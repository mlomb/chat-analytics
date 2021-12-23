import { Address, Timestamp } from "@pipeline/Types";

export class DataSerializer {
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

    public writeUint32(value: number) {
        if (this.head + 4 > this.buffer.length) {
            this.grow();
        }
        this.dv.setUint32(this.head, value);
        this.head += 4;
        this.tail = Math.max(this.tail, this.head);
    }

    // year: 12 bits: 0-4095
    // month: 4 bits: 0-15
    // date: 5 bits: 0-31
    // hour: 5 bits: 0-31
    public writeDate(year: number, month: number, date: number, hour: number) {
        const d: number = (year << 14) | (month << 10) | (date << 5) | hour;
        this.writeUint32(d);
    }

    private grow() {
        const newBuffer = new Uint8Array(this.buffer.length * 2); // TODO: maybe power of 2 is too much
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
        this.dv = new DataView(this.buffer.buffer);
    }
}

export class DataDeserializer {
    private buffer: Uint8Array;
    private dv: DataView;

    // current position
    private cursor: Address;

    constructor(buffer: Uint8Array) {
        this.buffer = buffer;
        this.dv = new DataView(buffer.buffer);
        this.cursor = 0;
    }

    public get currentOffset(): number {
        return this.cursor;
    }

    public seek(address: Address) {
        console.assert(address >= 0 && address < this.buffer.length, "Invalid seek address");
        this.cursor = address;
    }

    public readDate(): [number, number, number, number] {
        const d = this.readUint32();
        return [(d >> 14) & 0x3fff, (d >> 10) & 0xf, (d >> 5) & 0x1f, d & 0x1f];
    }

    public readUint32(): number {
        const value = this.dv.getUint32(this.cursor);
        this.cursor += 4;
        return value;
    }
}
