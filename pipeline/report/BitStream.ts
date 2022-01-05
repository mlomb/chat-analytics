import { BitAddress } from "@pipeline/Types";
import { BitView } from "bit-buffer";

export class BitStream {
    private view: BitView;
    private _buffer: Uint8Array;
    public offset: BitAddress;

    get buffer(): Uint8Array {
        return this._buffer;
    }

    constructor(buffer?: Uint8Array) {
        this._buffer = buffer || new Uint8Array(1024); // 1024 bytes by default
        this.view = new BitView(this._buffer.buffer);
        this.offset = 0;
    }

    setBits(bits: number, value: number): void {
        if ((this.offset + bits) >>> 3 > this._buffer.length) {
            // grow
            // TODO: maybe double is too much
            const newBuffer = new Uint8Array(this._buffer.length * 2);
            newBuffer.set(this._buffer);
            this._buffer = newBuffer;
            this.view = new BitView(this._buffer.buffer);
        }
        this.view.setBits(this.offset, value, bits);
        this.offset += bits;
    }

    getBits(bits: number, signed: boolean = false): number {
        const val = this.view.getBits(this.offset, bits, signed);
        this.offset += bits;
        return val;
    }
}
