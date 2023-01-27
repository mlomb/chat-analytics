import { PMessageGroup } from "@pipeline/process/ChannelMessages";
import { IndexedData } from "@pipeline/process/IndexedData";

import { IMessage } from "./Types";

/**
 * The MessageProcessor takes PMessageGroup objects and processes them into the final Message object.
 *
 * It does all the necessary analysis.
 */
export class MessageProcessor {
    constructor() {}
    /*
    private words = new IndexedData<string, string>();
    private emojis = new IndexedData<string, Emoji>();
    private mentions = new IndexedData<string, string>();
    private domains = new IndexedData<string, string>();
*/
    process(group: PMessageGroup): IMessage[] {
        return group.map((m) => ({ ...m }));
    }
}
