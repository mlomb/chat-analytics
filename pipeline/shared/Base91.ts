// This is a browser version of https://github.com/Equim-chan/base91

/*
BSD 3-Clause License

Copyright (c) 2017, Equim
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// NOTE: the character "<" was replaced by "-" to avoid problems embedding in HTML         ↓
const table = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;-=>?@[]^_`{|}~"';

export class Base91Encoder {
    private n = 0;
    private b = 0;

    encode(chunk: Uint8Array, last: boolean): string {
        let ret = "";
        const len = chunk.length;

        let n = this.n;
        let b = this.b;

        for (let i = 0; i < len; i++) {
            b |= chunk[i] << n;
            n += 8;

            if (n > 13) {
                let v = b & 8191;
                if (v > 88) {
                    b >>= 13;
                    n -= 13;
                } else {
                    v = b & 16383;
                    b >>= 14;
                    n -= 14;
                }
                ret += table[v % 91] + table[(v / 91) | 0];
            }
        }

        if (last && n) {
            ret += table[b % 91];
            if (n > 7 || b > 90) ret += table[(b / 91) | 0];
        }

        this.n = n;
        this.b = b;

        return ret;
    }
}

export class Base91Decoder {
    private b = 0;
    private n = 0;
    private v = -1;

    decode(chunk: string, last: boolean): Uint8Array {
        const len = chunk.length;
        const ret = [];

        let b = this.b;
        let n = this.n;
        let v = this.v;

        for (let i = 0; i < len; i++) {
            const p = table.indexOf(chunk[i]);
            if (p === -1) continue;
            if (v < 0) {
                v = p;
            } else {
                v += p * 91;
                b |= v << n;
                n += (v & 8191) > 88 ? 13 : 14;
                do {
                    ret.push(b & 0xff);
                    b >>= 8;
                    n -= 8;
                } while (n > 7);
                v = -1;
            }
        }

        if (last && v > -1) {
            ret.push((b | (v << n)) & 0xff);
        }

        this.b = b;
        this.n = n;
        this.v = v;

        return new Uint8Array(ret);
    }
}
