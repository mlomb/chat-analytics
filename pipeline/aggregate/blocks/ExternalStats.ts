import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { parseAndFilterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface ExternalStats {
    domainsCount: number[];
}

const fn: BlockFn<ExternalStats> = (database, filters, common) => {
    const domainsCount = new Array(database.domains.length).fill(0);

    const processMessage = (msg: MessageView) => {
        const domains = msg.getDomains();
        if (domains) {
            for (const domain of domains) {
                domainsCount[domain[0]] += domain[1];
            }
        }
    };

    parseAndFilterMessages(processMessage, database, filters);

    return { domainsCount };
};

export default {
    key: "external-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"external-stats", ExternalStats>;
