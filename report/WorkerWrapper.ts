import { EventEmitter } from "events";

import { Day } from "@pipeline/Time";
import { Index } from "@pipeline/Types";
import { BlockKey, Filter } from "@pipeline/aggregate/Blocks";
import { Database } from "@pipeline/process/Types";
import {
    BlockRequest,
    BlockRequestMessage,
    BlockResult,
    BlockResultMessage,
    InitMessage,
    ReadyMessage,
} from "@report/WorkerReport";

/** Used in the UI to cache the format of common objects (mostly for searching) */
export interface FormatCache {
    authors: string[];
    channels: string[];
    words: string[];
    emojis: string[];
    mentions: string[];
}

export declare interface WorkerWrapper {
    emit(event: "ready"): boolean;
    emit(event: "filter-change", trigger: Filter): boolean;
    emit<K extends BlockKey>(
        event: "result",
        request: BlockRequest<K>,
        result: BlockResult<K>,
        invalid: boolean
    ): boolean;

    on(event: "ready", listener: () => void): this;
    on(event: "filter-change", listener: (trigger: Filter) => void): this;
    on<K extends BlockKey>(
        event: "result",
        listener: (request: BlockRequest<K>, result: BlockResult<K>, invalid: boolean) => void
    ): this;
}

/**
 * This class wraps the native Worker and handles initialization and communication.
 * It also keeps track of the active filters in the UI and sends them to the worker when a request is made.
 */
export class WorkerWrapper extends EventEmitter {
    private worker: Worker;

    public database!: Database;
    public formatCache!: FormatCache;

    // active filters
    private channelsSet: boolean = false;
    private authorsSet: boolean = false;
    private activeChannels: Index[] = [];
    private activeAuthors: Index[] = [];
    private activeStartDate: Day | undefined;
    private activeEndDate: Day | undefined;

    /** Updated filters since last request */
    private staleFilters: Set<Filter> = new Set(["authors", "channels", "time"]);

    /** Wether the worker is currently processing a request */
    private workerBusy: boolean = false;

    constructor(dataStr: string) {
        super();

        if (env.isDev) {
            if (document.location.protocol === "blob:") {
                // this is when we are in a blob, in that case building the URL with import.meta.url will fail
                // so we use the following workaround to use the correct origin
                this.worker = new Worker(
                    new URL(__webpack_require__.u("report_WorkerReport_ts"), document.location.origin)
                );
            } else {
                // normal webpack v5 worker loading
                // @ts-expect-error
                this.worker = new Worker(new URL("@report/WorkerReport.ts", import.meta.url));
            }
        } else {
            // Why we use base64 instead of Blob+URL.createObjectURL?
            // Chrome Mobile crashes if you use createObjectURL from an .html file :)
            // See: https://bugs.chromium.org/p/chromium/issues/detail?id=1150828&q=createObjectURL%20crash
            // We can work around it using base64, so no requests are made
            // NOTE: data:application/javascript breaks
            const workerJs = document.getElementById("worker-script")!.textContent!;
            this.worker = new Worker(
                "data:application/javascript;base64," + btoa(unescape(encodeURIComponent(workerJs)))
            );
        }
        this.worker.onerror = this.onError.bind(this);
        this.worker.onmessage = this.onMessage.bind(this);
        this.worker.postMessage({ type: "init", dataStr } as InitMessage);
    }

    private onError(e: ErrorEvent) {
        console.log(e);
        alert("An error occurred creating the WebWorker.\n\n Error: " + e.message);
        this.worker.terminate();
    }

    private onMessage(e: MessageEvent<ReadyMessage | BlockResultMessage<BlockKey>>) {
        const res = e.data;
        if (res.type === "ready") {
            this.database = res.database;
            this.formatCache = res.formatCache;

            // set default time range
            this.activeStartDate = Day.fromKey(res.database.time.minDate);
            this.activeEndDate = Day.fromKey(res.database.time.maxDate);

            // worker is ready
            console.log("Worker is ready");
            this.emit("ready");
        } else if (res.type === "result") {
            this.workerBusy = false;
            // a result will be invialid if one of its triggers has been updated since the request was made
            const invalid = res.result.triggers.some((f) => this.staleFilters.has(f));
            this.emit("result", res.request, res.result, invalid);
        }
    }

    updateChannels(channels: Index[]) {
        this.channelsSet = true;
        this.activeChannels = channels;
        this.staleFilters.add("channels");
        this.emit("filter-change", "channels");
    }

    updateAuthors(authors: Index[]) {
        this.authorsSet = true;
        this.activeAuthors = authors;
        this.staleFilters.add("authors");
        this.emit("filter-change", "authors");
    }

    updateTimeRange(start: Date, end: Date) {
        const clampDate = (day: Day) =>
            Day.clamp(day, Day.fromKey(this.database.time.minDate), Day.fromKey(this.database.time.maxDate));
        this.activeStartDate = clampDate(Day.fromDate(start));
        this.activeEndDate = clampDate(Day.fromDate(end));
        this.staleFilters.add("time");
        this.emit("filter-change", "time");
    }

    sendBlockRequest(request: BlockRequest<BlockKey>) {
        const br: BlockRequestMessage = {
            type: "request",
            request,
            filters: {},
        };

        // only update filters if they have changed
        if (this.staleFilters.has("channels")) {
            br.filters.channels = this.activeChannels;
            this.staleFilters.add("channels");
        }
        if (this.staleFilters.has("authors")) {
            br.filters.authors = this.activeAuthors;
            this.staleFilters.add("authors");
        }
        if (this.staleFilters.has("time")) {
            br.filters.startDate = this.activeStartDate?.dateKey;
            br.filters.endDate = this.activeEndDate?.dateKey;
            this.staleFilters.add("time");
        }

        // unmark stale, since we are updating them here
        this.staleFilters.clear();

        this.workerBusy = true;
        this.worker.postMessage(br);
    }

    public getActiveStartDate(): Date {
        return this.activeStartDate!.toDate();
    }

    public getActiveEndDate(): Date {
        // we add one day because zoomToDates is [start, end)
        return this.activeEndDate!.nextDay().toDate();
    }

    get areFiltersSet() {
        return this.channelsSet && this.authorsSet;
    }

    get available() {
        return this.workerBusy === false;
    }
}

let worker: WorkerWrapper;

export const initWorker = (dataStr: string) => (worker = new WorkerWrapper(dataStr));

export const getWorker = () => worker;
export const getDatabase = () => worker.database;
export const getFormatCache = () => worker.formatCache;
