import { Serializer, Deserializer } from "@pipeline/report/Serializer";

/*
// dateIndex: 16 bits 0-65535 (~179 years)
// monthIndex: 11 bits: 0-2047 (~170 years)
// hour: 5 bits: 0-31 (we only use 0-24)
public writeDate(dateIndex: number, monthIndex: number, hour: number) {
    const d: number = (dateIndex << 16) | (monthIndex << 5) | hour;
    this.writeUint32(d);
}

public readMessages(
    start: Address,
    count: number,
    fn: (dateIndex: number, monthIndex: number, hour: number, authorId: ID) => void
) {
    this.seek(start);
    for (let i = 0; i < count; i++) {
        const d = this.readUint32();
        const authorId = this.readUint32();

        fn((d >> 16) & 0xffff, (d >> 5) & 0x7ff, d & 0x1f, authorId);
    }
}
*/

// TODO: messages binary serialization
