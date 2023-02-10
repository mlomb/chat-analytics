import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export interface ExternalStats {
    domainsCount: number[];
}

const fn: BlockFn<ExternalStats> = (args, database, filters, common) => {
    const domainsCount = new Array(database.domains.length).fill(0);

    const processMessage = (msg: MessageView) => {
        const domains = msg.domains;
        if (domains) {
            for (const domain of domains) {
                domainsCount[domain[0]] += domain[1];
            }
        }
    };

    filterMessages(processMessage, database, filters);

    return { domainsCount };
};

export default {
    key: "external-stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"external-stats", ExternalStats>;
