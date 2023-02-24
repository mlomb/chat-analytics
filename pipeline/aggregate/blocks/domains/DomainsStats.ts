import { BlockDescription, BlockFn } from "@pipeline/aggregate/Blocks";
import { filterMessages } from "@pipeline/aggregate/Helpers";
import { MessageView } from "@pipeline/serialization/MessageView";

export type DomainTreeEntry = {
    domain: string;
    groupCount: number;
    count?: number;
    subdomains?: DomainTreeEntry[];
};

export interface DomainsStats {
    counts: {
        /** Number of times each domain has been linked */
        domains: number[];
        /** Number of links each author has sent */
        authors: number[];
        /** Number of links sent in each channel */
        channels: number[];
    };

    /** Tree of domains with counts in the leafs */
    tree: DomainTreeEntry;
}

const buildDomainTree = (domains: string[], counts: number[]) => {
    const treeRoot: DomainTreeEntry = { domain: "TLDs", groupCount: 0, subdomains: [] };

    for (let i = 0; i < domains.length; i++) {
        const parts = domains[i].split(".");

        let current = treeRoot;
        let domain = "";

        for (let j = parts.length - 1; j >= 0; j--) {
            // e.g domain = ".com"
            const part = parts[j]; // e.g. google
            const exact = part + domain; // e.g. "google.com"
            domain = "." + part + domain; // e.g. ".google.com"

            if (current.subdomains === undefined) {
                // this should not happen
                continue;
            }

            const subentry = current.subdomains.find((e) => e.domain === domain);

            if (subentry === undefined) {
                current.subdomains.push({
                    domain,
                    groupCount: 0,
                    subdomains: [
                        // entry for the exact domain
                        // ! ALWAYS AT POSITION 0 !
                        {
                            domain: exact,
                            groupCount: 0,
                            count: 0,
                        },
                    ],
                });
                current = current.subdomains[current.subdomains.length - 1];
            } else {
                current = subentry;
            }

            current.groupCount += counts[i];

            if (current.subdomains![0].domain === domains[i]) {
                current.subdomains![0].groupCount = counts[i];
                current.subdomains![0].count = counts[i];
            }
        }
    }

    // make sure the root has the correct count
    treeRoot.groupCount = treeRoot.subdomains!.reduce((acc, e) => acc + e.groupCount, 0);

    let numNodes = 0;

    // tree has been build
    // now we want to:
    //   - remove zeroes
    //   - group unfrequent domains
    //   - collapse all nodes that have only one child
    const cleanup = (entry: DomainTreeEntry): DomainTreeEntry => {
        numNodes++;

        if (entry.subdomains === undefined) return entry;

        const total = entry.subdomains.reduce((acc, e) => acc + e.groupCount, 0);

        const newSubdomains: DomainTreeEntry[] = [];
        let otherCount = 0;
        let combined = 0;

        for (const subdomain of entry.subdomains) {
            // remove subdomains with zero count or less than a threshold
            if (subdomain.groupCount / total >= 0.01) {
                newSubdomains.push(subdomain);
            } else {
                combined++;
                otherCount += subdomain.groupCount;
            }
        }

        if (
            otherCount > 0 &&
            // fiter others aswell
            otherCount / total >= 0.01 &&
            // only add other if we are combining more than one domain
            combined > 1
        ) {
            newSubdomains.push({
                domain: entry.domain === "TLDs" ? `Other TLDs` : `Other '${entry.domain}' domains`,
                count: otherCount,
                groupCount: otherCount,
            });

            entry.subdomains = newSubdomains;
        }

        if (newSubdomains.length === 1) {
            // collapse node
            return cleanup(newSubdomains[0]);
        }

        return {
            ...entry,
            // recursively cleanup subdomains
            subdomains: newSubdomains.map(cleanup),
        };
    };

    const finalTreeRoot = cleanup(treeRoot);

    console.log("Domain tree node count: " + numNodes);

    return finalTreeRoot;
};

const fn: BlockFn<DomainsStats> = (database, filters, common, args) => {
    const domainsCount = new Array(database.domains.length).fill(0);
    const authorsCount = new Array(database.authors.length).fill(0);
    const channelsCount = new Array(database.channels.length).fill(0);

    const processMessage = (msg: MessageView) => {
        const domains = msg.domains;
        if (domains === undefined) return;

        for (const domain of domains) {
            // count
            domainsCount[domain[0]] += domain[1];
            authorsCount[msg.authorIndex] += domain[1];
            channelsCount[msg.channelIndex] += domain[1];
        }
    };

    filterMessages(processMessage, database, filters);

    return {
        counts: {
            domains: domainsCount,
            authors: authorsCount,
            channels: channelsCount,
        },
        tree: buildDomainTree(database.domains, domainsCount),
    };
};

export default {
    key: "domains/stats",
    triggers: ["authors", "channels", "time"],
    fn,
} as BlockDescription<"domains/stats", DomainsStats>;
