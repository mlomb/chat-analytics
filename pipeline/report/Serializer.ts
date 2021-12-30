import { Address } from "@pipeline/Types";

export class Serializer {
    private buffer: Uint8Array;
    private dv: DataView;
    // current position
    private head: Address;
    // last valid position (written, buffer may be bigger)
    private tail: Address;

    constructor() {
        this.buffer = new Uint8Array(1024 * 1024 * 1); // 1MB by default
        this.dv = new DataView(this.buffer.buffer);
        this.head = 0;
        this.tail = 0;
    }

    public get validBuffer(): Uint8Array {
        return this.buffer.slice(0, this.tail);
    }

    public get currentOffset(): number {
        return this.head;
    }

    public writeUint8(value: number) {
        this.need(1);
        this.dv.setUint8(this.head, value);
        this.push(1);
    }

    public writeUint32(value: number) {
        this.need(4);
        this.dv.setUint32(this.head, value);
        this.push(4);
    }

    private need(size: number) {
        if (this.head + size > this.buffer.length) {
            // grow
            // TODO: maybe double is too much
            const newBuffer = new Uint8Array(this.buffer.length * 2);
            newBuffer.set(this.buffer);
            this.buffer = newBuffer;
            this.dv = new DataView(this.buffer.buffer);
        }
    }

    private push(value: number) {
        this.head += value;
        this.tail = Math.max(this.tail, this.head);
    }
}

export class Deserializer {
    private buffer: Uint8Array;
    private dv: DataView;

    // current position
    private cursor: Address;

    constructor(buffer: Uint8Array) {
        this.buffer = buffer;
        this.dv = new DataView(buffer.buffer);
        this.cursor = 0;
    }

    public seek(address: Address) {
        console.assert(address >= 0 && address < this.buffer.length, "Invalid seek address");
        this.cursor = address;
    }

    public readUint32(): number {
        const value = this.dv.getUint32(this.cursor);
        this.cursor += 4;
        return value;
    }

    public readUint8(): number {
        const value = this.dv.getUint8(this.cursor);
        this.cursor += 1;
        return value;
    }
}
