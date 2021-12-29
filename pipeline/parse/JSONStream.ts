import clarinet, { CParser } from "clarinet";

export type CallbackFn<T> = (object: T) => void;

type Event = "value" | "key" | "openobject" | "closeobject" | "openarray" | "closearray";
type Handler = (ev: Event, keyOrValue?: string | boolean | null) => void;

/*
    Allows streaming big JSON files
    >2GB, >4GB, etc

    It assumes the root is always an object
    Only keys on the root can be listened

    Note: you can use onRoot OR (onArrayItem and onObject) but not both at the same time
*/
export class JSONStream {
    private cparser: CParser;
    private rootCallback: CallbackFn<any> | undefined;
    private objectCallbacks: Map<string, CallbackFn<any>> = new Map();
    private arrayCallbacks: Map<string, CallbackFn<any>> = new Map();

    constructor() {
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

    public push(chunk: string, last: boolean) {
        if (chunk.length > 0) {
            this.cparser.write(chunk);
        }
        if (last) {
            this.cparser.close();
            this.rootCallback?.(this.root);
        }
    }

    // Root object
    public onRoot<T>(callback: CallbackFn<T>) {
        this.rootCallback = callback;
    }

    // Object from the root which match the key will be emitted completely
    public onObject<T>(key: string, callback: CallbackFn<T>) {
        this.objectCallbacks.set(key, callback);
    }

    // Arrays from the root which match the key will be emitted element by element
    public onArrayItem<T>(key: string, callback: CallbackFn<T>) {
        this.arrayCallbacks.set(key, callback);
    }

    // Root object handler
    // Wether we are inside the root object
    private inRoot: boolean = false;
    // Root key currently being processed
    private topKey?: string;
    // Wether we are inside an array
    private inArray: boolean = false;
    // Constructed root (only used when using onRoot)
    private root: any = {};
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

                if (this.rootCallback || this.objectCallbacks.has(key)) {
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
                if (typeof x === "string") {
                    // Avoid leaking with big strings
                    // See https://stackoverflow.com/questions/31712808/how-to-force-javascript-to-deep-copy-a-string
                    // See https://bugs.chromium.org/p/v8/issues/detail?id=2869
                    last[this.lastKey] = (" " + x).substring(1);
                } else {
                    last[this.lastKey] = x;
                }
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
        if (this.rootCallback) {
            this.root[this.topKey] = x;
        } else if (this.objectCallbacks.has(this.topKey)) {
            this.objectCallbacks.get(this.topKey)!(x);
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
