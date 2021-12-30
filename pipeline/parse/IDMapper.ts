import { ID, RawID } from "@pipeline/Types";

// Maps between RawIDs and (internal) sequential IDs.
export default class IDMapper {
    private id: ID = 0;
    private mappings: Map<RawID, ID> = new Map();

    public has(input: RawID): boolean {
        return this.mappings.has(input);
    }

    public get(input: RawID): [ID, boolean] {
        let id = this.mappings.get(input);
        if (id === undefined) {
            id = this.id++;
            this.mappings.set(input, id);
            return [id, true];
        }
        return [id, false];
    }
}
