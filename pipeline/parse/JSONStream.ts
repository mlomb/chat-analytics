export type CallbackFn<T> = (object: T) => void;

type Callbacks = { [key: string]: CallbackFn<any> };

// prettier-ignore
const Char = {
    tab                 : 0x09,     // \t
    lineFeed            : 0x0A,     // \\n
    carriageReturn      : 0x0D,     // \r
    space               : 0x20,     // " "

    doubleQuote         : 0x22,     // "
    comma               : 0x2C,     // ,
    colon               : 0x3A,     // :

    openBracket         : 0x5B,     // [
    backslash           : 0x5C,     // \
    closeBracket        : 0x5D,     // ]

    openBrace           : 0x7B,     // {
    closeBrace          : 0x7D,     // }
};

enum State {
    INVALID,
    // read {
    ROOT,
    // read , } or check for "
    NEXT_KEY,
    // read , or check for ]
    NEXT_ARRAY_ITEM,
    // read [
    START_ARRAY,
    // read ]
    END_ARRAY,
    // strings, objects, arrays
    VALUE,
    // read :
    END_VALUE_KEY,
    // read ,
    END_VALUE_ROOT,
    // read ,
    END_VALUE_ARRAY,
}

const isPrimitiveTerminator = (c: number) => c === Char.comma || c === Char.closeBrace || c === Char.closeBracket;
const isWhitespace = (c: number) =>
    c === Char.carriageReturn || c === Char.lineFeed || c === Char.space || c === Char.tab;

/*
    Allows streaming big JSON files
    >2GB, >4GB, etc

    It assumes the root is always an object
    Only keys on the root can be listened

    This class expects well-formed JSONs
*/
export class JSONStream {
    private objectCallbacks: Callbacks = {};
    private arrayCallbacks: Callbacks = {};

    private state: State = State.ROOT;
    private next: State = State.INVALID;
    private index = 0;
    private buffer = "";
    private key: string | undefined;

    private valueStart = 0;
    private valueEnd = 0;
    private slashed = false;
    private quotes = false;
    private brackets = 0;
    private braces = 0;
    private primitive = true;

    private parseValue(): string {
        return JSON.parse(this.buffer.slice(this.valueStart, this.valueEnd + 1));
    }

    public push(chunk: string) {
        this.buffer += chunk;
        const len = this.buffer.length;
        if (len === 0) return;

        let i = this.index;
        let c = this.buffer.charCodeAt(i);

        while (c > 0) {
            // console.log(c, String.fromCharCode(c), chunk.substring(i - 5, i + 5), this.state);

            switch (this.state) {
                case State.ROOT:
                    if (c === Char.openBrace) this.state = State.NEXT_KEY;
                    else if (!isWhitespace(c)) throw new Error("Expected {");
                    break;

                case State.NEXT_KEY:
                    if (c === Char.doubleQuote || c === Char.comma) {
                        // read key
                        this.state = State.VALUE;
                        this.next = State.END_VALUE_KEY;

                        if (c === Char.doubleQuote) {
                            // let VALUE consume the quote
                            this.valueStart = this.valueEnd = i;
                            continue; // (don't i++)
                        } else {
                            this.valueStart = this.valueEnd = i + 1;
                        }
                    } else if (c === Char.closeBrace) this.state = State.ROOT;
                    else if (!isWhitespace(c)) throw new Error('Expected ", comma or }');
                    break;

                case State.NEXT_ARRAY_ITEM:
                    if (c === Char.comma) {
                        // read next item
                        this.valueStart = this.valueEnd = i + 1;
                        this.state = State.VALUE;
                        this.next = State.END_VALUE_ARRAY;
                    } else if (c === Char.closeBracket) {
                        this.state = State.END_ARRAY;
                        this.next = State.INVALID;
                        // dont consume ], let END_ARRAY handle it
                        continue; // (don't i++)
                    } else if (!isWhitespace(c)) throw new Error("Expected , or ]");
                    break;

                case State.START_ARRAY:
                    if (c === Char.openBracket) {
                        // read first item
                        this.valueStart = this.valueEnd = i + 1;
                        this.state = State.VALUE;
                        this.next = State.END_VALUE_ARRAY;
                    } else if (!isWhitespace(c)) throw new Error("Expected [");
                    break;

                case State.END_ARRAY:
                    if (c === Char.closeBracket) this.state = State.NEXT_KEY;
                    else if (!isWhitespace(c)) throw new Error("Expected ]");
                    break;

                case State.VALUE:
                    if (
                        this.brackets === 0 &&
                        this.braces === 0 &&
                        this.quotes === false &&
                        this.primitive &&
                        isPrimitiveTerminator(c)
                    ) {
                        // console.log("key", this.key, "value", this.value);
                        this.state = this.next;
                        this.next = State.INVALID;
                        // don't consume the terminator, let the next state handle it
                        continue; // (don't i++)
                    }
                    this.valueEnd = i;
                    if (isWhitespace(c)) break;
                    else if (c === Char.backslash) {
                        this.slashed = !this.slashed;
                        break;
                    } else if (c === Char.doubleQuote) {
                        this.primitive = false;
                        if (this.slashed) {
                            this.slashed = false;
                            break;
                        }
                        this.quotes = !this.quotes;
                    }

                    // anything else is not escaped
                    this.slashed = false;

                    if (this.quotes) break;

                    if (c === Char.openBracket) this.brackets++;
                    else if (c === Char.openBrace) this.braces++;
                    else if (c === Char.closeBracket) this.brackets--;
                    else if (c === Char.closeBrace) this.braces--;

                    const sameLevel = this.brackets === 0 && this.braces === 0;
                    this.primitive = this.primitive && sameLevel;

                    if (!this.primitive && sameLevel) {
                        // console.log("key", this.key, "value", this.value);

                        this.primitive = true;
                        this.state = this.next;
                        this.next = State.INVALID;
                    }
                    break;

                case State.END_VALUE_ROOT:
                    if (this.key! in this.objectCallbacks) {
                        // emit in root
                        // console.log("EMITTING IN ROOT", this.key, this.value);
                        this.objectCallbacks[this.key!](this.parseValue());
                    }
                    // read next key
                    this.state = State.NEXT_KEY;
                    continue;

                case State.END_VALUE_KEY:
                    if (c === Char.colon) {
                        this.key = this.parseValue();
                        if (typeof this.key !== "string") throw new Error("Expected string on key");

                        if (this.key in this.arrayCallbacks) {
                            // start array
                            this.state = State.START_ARRAY;
                            this.next = State.INVALID;
                        } else {
                            // read value directly
                            this.valueStart = this.valueEnd = i + 1;
                            this.state = State.VALUE;
                            this.next = State.END_VALUE_ROOT;
                        }
                    } else if (!isWhitespace(c)) throw new Error("Expected :");
                    break;

                case State.END_VALUE_ARRAY:
                    // console.log("EMITTING ARRAY", this.key, this.value);
                    this.arrayCallbacks[this.key!](this.parseValue());

                    // read next item
                    this.state = State.NEXT_ARRAY_ITEM;
                    continue;

                default:
                    throw new Error("Invalid JSON state: " + this.state);
            }

            i++;
            c = this.buffer.charCodeAt(i);
        }

        const base = Math.min(i, this.valueStart);
        this.buffer = this.buffer.slice(base);
        this.index = i - base;
        this.valueEnd -= base;
        this.valueStart -= base;
    }

    // Object from the root which match the key will be emitted completely
    public onObject<T>(key: string, callback: CallbackFn<T>): JSONStream {
        this.objectCallbacks[key] = callback;
        return this;
    }

    // Arrays from the root which match the key will be emitted element by element
    public onArrayItem<T>(key: string, callback: CallbackFn<T>): JSONStream {
        this.arrayCallbacks[key] = callback;
        return this;
    }
}
