import { FileInput, ProgressStep } from "@pipeline/Types";

import clarinet, { CParser } from "clarinet";

const CHUNK_SIZE = 1024 * 1024 * (2 * 2); // 4MB

type CallbackFn<T> = (object: T) => void;
type Event = "value" | "key" | "openobject" | "closeobject" | "openarray" | "closearray";
type Handler = (ev: Event, keyOrValue?: string | boolean | null) => void;

/*
    Allows streaming big JSON files
    >2GB, >4GB, etc

    It assumes the root is always an object
    Only keys on the root can be listened
*/
export default class JSONStream {
    private cparser: CParser;
    private fullCallbacks: Map<string, CallbackFn<any>> = new Map();
    private arrayCallbacks: Map<string, CallbackFn<any>> = new Map();

    constructor(private readonly file: FileInput) {
        this.cparser = clarinet.parser();
        this.cparser.onerror = (e) => {
            throw new Error(`Make sure it is a valid JSON file.\nDetails: ${e?.message}`);
        };
        this.cparser.onvalue = (value) => this.activeHandler("value", value);
        this.cparser.onkey = (key) => this.activeHandler("key", key);
        this.cparser.onopenobject = (key: string) => {
            this.activeHandler("openobject");
            this.activeHandler("key", key);
        };
        this.cparser.oncloseobject = () => this.activeHandler("closeobject");
        this.cparser.onopenarray = () => this.activeHandler("openarray");
        this.cparser.onclosearray = () => this.activeHandler("closearray");
    }

    // Object from the root which match the key will be emitted completely
    public onFull<T>(key: string, callback: CallbackFn<T>) {
        this.fullCallbacks.set(key, callback);
    }

    // Arrays from the root which match the key will be emitted element by element
    public onArray<T>(key: string, callback: CallbackFn<T>) {
        this.arrayCallbacks.set(key, callback);
    }

    public async *parse(): AsyncGenerator<ProgressStep> {
        const textDecoder = new TextDecoder("utf-8");

        let receivedLength = 0;
        while (receivedLength < this.file.size) {
            const buffer = await this.file.slice(receivedLength, receivedLength + CHUNK_SIZE);
            const str = textDecoder.decode(buffer, { stream: true });

            receivedLength += buffer.byteLength;
            this.cparser.write(str);
            yield { type: "progress", format: "bytes", progress: [receivedLength, this.file.size] };
        }
        this.cparser.end();
    }

    // Root object handler
    // Wether we are inside the root object
    private inRoot: boolean = false;
    // Root key currently being processed
    private topKey?: string;
    // Wether we are inside an array
    private inArray: boolean = false;
    private rootHandler: Handler = (ev, keyOrValue) => {
        switch (ev) {
            case "value":
            case "openarray":
            case "closearray":
                throw new Error("Root must be an object");
            case "key":
                if (!this.inRoot) throw new Error("Key not in root");
                const key = keyOrValue as string;
                this.topKey = key;

                if (this.fullCallbacks.has(key)) {
                    this.activeHandler = this.fullHandler;
                } else if (this.arrayCallbacks.has(key)) {
                    this.activeHandler = this.arrayHandler;
                    this.inArray = true;
                } else {
                    this.activeHandler = this.ignoreHandler;
                }
                break;
            case "openobject":
                this.inRoot = true;
                break;
            case "closeobject":
                this.inRoot = false;
                break;
        }
    };

    // Parse everything
    // The last key visited
    private lastKey: string = "";
    // The stack of objects and arrays
    private stack: any[] = [];
    private pushToStack(x: {} | [] | string | boolean | null) {
        if (this.stack.length > 0) {
            const last = this.stack[this.stack.length - 1];
            if (last instanceof Array) {
                // push to array
                last.push(x);
            } else {
                // set as key in object
                last[this.lastKey] = x;
            }
        }
        if (x instanceof Array || x instanceof Object) {
            // push to stack if its not a value
            this.stack.push(x);
        }
    }
    private emit(x: any) {
        if (this.topKey === undefined) throw new Error("No top key");

        // emit
        if (this.fullCallbacks.has(this.topKey)) {
            this.fullCallbacks.get(this.topKey)!(x);
        } else if (this.arrayCallbacks.has(this.topKey)) {
            this.arrayCallbacks.get(this.topKey)!(x);
        } else {
            throw new Error("No handler for " + this.topKey);
        }

        if (this.inArray === false) {
            // go back to the root
            this.activeHandler = this.rootHandler;
        }
    }
    private fullHandler: Handler = (ev, keyOrValue) => {
        switch (ev) {
            case "key":
                this.lastKey = keyOrValue as string;
                break;
            case "value":
                const val = keyOrValue as string | boolean | null;
                this.pushToStack(val);
                if (this.stack.length === 0) this.emit(val);
                break;
            case "openobject":
                this.pushToStack({});
                break;
            case "closeobject":
                if (this.stack.length === 1) this.emit(this.stack[0]);
                this.stack.pop();
                break;
            case "openarray":
                this.pushToStack([]);
                break;
            case "closearray":
                if (this.stack.length === 0) {
                    // close array
                    console.assert(this.inArray, "Should be inside array");
                    this.activeHandler = this.arrayHandler;
                    this.arrayHandler(ev, keyOrValue); // forward
                    break;
                }
                if (this.stack.length === 1) this.emit(this.stack[0]);
                this.stack.pop();
                break;
        }
    };

    // Parse every element from an array
    private arrayHandler: Handler = (ev, keyOrValue) => {
        switch (ev) {
            case "key":
            case "value":
            case "openobject":
            case "closeobject":
                throw new Error("Expected array on key " + this.topKey);
            case "openarray":
                this.activeHandler = this.fullHandler;
                break;
            case "closearray":
                this.activeHandler = this.rootHandler;
                this.inArray = false;
                break;
        }
    };

    // Skip everything
    private objectCount: number = 0;
    private arrayCount: number = 0;
    private ignoreHandler: Handler = (ev) => {
        switch (ev) {
            case "key":
                return;
            case "openobject":
                this.objectCount++;
                break;
            case "closeobject":
                this.objectCount--;
                break;
            case "openarray":
                this.arrayCount++;
                break;
            case "closearray":
                this.arrayCount--;
                break;
        }
        if (this.objectCount === 0 && this.arrayCount === 0) {
            this.activeHandler = this.rootHandler;
        }
    };

    private activeHandler: Handler = this.rootHandler;
}
