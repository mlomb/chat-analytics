import { Day } from "@pipeline/Time";
import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

const MAX_AUTHORS = 20;
const NEW_CONVERSATION_THRESHOLD = 3600 / 2; // in seconds

interface Node {
    // from, to author index
    f: number;
    t: number;
    // count
    c: number;
}

export interface ConversationStats {
    authorConversations: number[]; // indexed by author index
    channelConversations: number[]; // indexed by channel index
    nodes: Node[];
}

const fn: BlockFn<ConversationStats> = (database, filters, common, args) => {
    const { dateKeys } = common.timeKeys;

    const channelConversations: number[] = new Array(database.channels.length).fill(0);
    const authorConversations: number[] = new Array(database.authors.length).fill(0);

    // first, find the MAX_AUTHORS authors with the most messages
    const authorsCounts: number[] = [...authorConversations];
    filterMessages((msg) => authorsCounts[msg.authorIndex]++, database, filters);

    // sort authors by count
    const sortedAuthors = authorsCounts
        .map((count, index) => ({ count, index }))
        .filter((author) => author.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, MAX_AUTHORS);

    // make a lookup table for author index -> sorted index or -1 if not present
    const authorsLookup: number[] = new Array(database.authors.length).fill(-1);
    for (let i = 0; i < sortedAuthors.length; i++)
        //
        authorsLookup[sortedAuthors[i].index] = i;

    // make a nodes tables
    const N = sortedAuthors.length;
    const table = new Uint16Array((N * (N + 1)) / 2).fill(0); // the table is symmetric

    // track conversations and fill the table
    interface ChannelContext {
        activeParticipant: boolean[];
        lastMessageTimestamp: number;
    }
    const contexts: ChannelContext[] = new Array(database.channels.length).fill({
        activeParticipant: new Array(N).fill(false),
        lastMessageTimestamp: -1,
    });

    const processMessage = (msg: MessageView) => {
        const d = Day.fromKey(dateKeys[msg.dayIndex]).toDate();
        d.setSeconds(msg.secondOfDay);
        const ts = d.getTime();

        const ctx = contexts[msg.channelIndex];

        // start of a new conversation
        if (ctx.lastMessageTimestamp === -1 || ts - ctx.lastMessageTimestamp > NEW_CONVERSATION_THRESHOLD * 1000) {
            // mark in table in M^2
            const participants = ctx.activeParticipant
                .map((active, index) => (active ? index : -1))
                .filter((x) => x !== -1);
            const M = participants.length;
            for (let i = 0; i < M; i++) {
                for (let j = i + 1; j < M; j++) {
                    const a = participants[i];
                    const b = participants[j];

                    const k = Math.min(a, b);
                    const l = Math.max(a, b);
                    // since the matrix is symmetric and k <= l, we can compute the index as follow:
                    // See: https://stackoverflow.com/a/9040526/2840384

                    const index = k * N - (k * (k + 1)) / 2 + l;
                    if (!(index >= 0 && index < table.length)) {
                        console.log(a, b, k, l, index);

                        debugger;
                    }
                    console.assert(index >= 0 && index < table.length);

                    table[index]++;
                }
            }

            // reset
            ctx.activeParticipant.fill(false);
            channelConversations[msg.channelIndex]++;
            // we have to check since we are not filtering by author
            if (filters.hasAuthor(msg.authorIndex)) {
                authorConversations[msg.authorIndex]++;
            }
        }

        ctx.lastMessageTimestamp = ts;

        const authorSortedIndex = authorsLookup[msg.authorIndex];
        if (authorSortedIndex !== -1) {
            ctx.activeParticipant[authorSortedIndex] = true;
        }
    };

    filterMessages(processMessage, database, filters, { channels: true, authors: false, time: true });

    // generate the nodes
    const nodes: Node[] = [];
    for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
            const index = i * N - (i * (i + 1)) / 2 + j; // i <= j
            const c = table[index];
            if (c > 0) {
                nodes.push({ f: sortedAuthors[i].index, t: sortedAuthors[j].index, c });
            }
        }
    }

    return {
        authorConversations,
        channelConversations,
        nodes,
    };
};

export default {
    key: "interaction/conversation-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"interaction/conversation-stats", ConversationStats>;
