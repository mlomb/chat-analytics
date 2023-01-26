import { PMessageGroup } from "@pipeline/process/ChannelMessageGrouper";

/**
 * The MessageProcessor takes PMessageGroup objects and processes them into the final Message object.
 *
 * It does all the necessary analysis.
 */
export class MessageProcessor {
    constructor() {}

    process(group: PMessageGroup): Message[] {}
}
