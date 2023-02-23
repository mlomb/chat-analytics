import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { Datetime } from "@pipeline/aggregate/Common";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

interface PeriodStat {
    minutes: number;
    start: Datetime;
    end: Datetime;
}

export interface ConversationDuration {
    longestTimeWithoutMessages?: PeriodStat;
    longestActiveConversation?: PeriodStat;
}

const fn: BlockFn<ConversationDuration> = (database, filters, common, args) => {
    const { dateKeys } = common.timeKeys;

    const numFiveMinBlocks = 24 * 12 * database.time.numDays;
    const fiveMinMessagesCount = new Array(numFiveMinBlocks).fill(0);

    const processMessage = (msg: MessageView) => {
        fiveMinMessagesCount[msg.dayIndex * 288 + Math.floor(msg.secondOfDay / 300)]++;
    };

    filterMessages(processMessage, database, filters);

    let longestTimeWithoutMessages: PeriodStat | undefined;
    let longestActiveConversation: PeriodStat | undefined;
    // NOTE: doing it this way, we are not counting the periods in the sides (which is what we want)
    // if the first message ever is in the last 5m block of the day, it should not count 0-23.55 as "no messages"
    let prevMessage = -1, // used for time without messages
        startMessage = -1; // used for active conversations
    for (let i = 0; i < numFiveMinBlocks; i++) {
        // found a 5 minute block with messages
        if (fiveMinMessagesCount[i] > 0) {
            // [longestTimeWithoutMessages]
            // did we find one before?
            if (prevMessage !== -1) {
                // check the difference
                const diff = (i - prevMessage) * 5;
                if (longestTimeWithoutMessages === undefined || diff > longestTimeWithoutMessages.minutes) {
                    longestTimeWithoutMessages = {
                        minutes: diff,
                        start: {
                            day: dateKeys[Math.floor(prevMessage / 288)],
                            secondOfDay: (prevMessage % 288) * 300,
                        },
                        end: {
                            day: dateKeys[Math.floor(i / 288)],
                            secondOfDay: (i % 288) * 300,
                        },
                    };
                }
            }
            // set the last message as i
            prevMessage = i;

            // [longestActiveConversation]
            if (startMessage === -1) startMessage = i;
            const diff = (i - startMessage + 1) * 5;
            if (longestActiveConversation === undefined || diff > longestActiveConversation.minutes) {
                longestActiveConversation = {
                    minutes: diff,
                    start: {
                        day: dateKeys[Math.floor(startMessage / 288)],
                        secondOfDay: (startMessage % 288) * 300,
                    },
                    end: {
                        day: dateKeys[Math.floor(i / 288)],
                        secondOfDay: (i % 288) * 300,
                    },
                };
            }
        } else {
            startMessage = -1;
        }
    }

    return {
        longestTimeWithoutMessages,
        longestActiveConversation,
    };
};

export default {
    key: "conversation-duration",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"conversation-duration", ConversationDuration>;
