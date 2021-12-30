import { EventEmitter } from "events";

type Status = "processing" | "waiting" | "success" | "error";
type FormatProgress = "number" | "bytes";

export interface TaskInfo {
    status: Status;
    title: string;
    subject?: string;
    progress?: {
        actual: number;
        total?: number;
        format: FormatProgress;
    };
    error?: string;
}

export interface ProgressKeys {
    [key: string]: number;
}

export interface ProgressMessage {
    type: "progress";
    tasks: TaskInfo[];
    keys: ProgressKeys;
}

declare interface Progress {
    on(event: "update", listener: (msg: ProgressMessage) => void): this;
}

class Progress extends EventEmitter {
    // all tasks
    private tasks: TaskInfo[] = [];
    // active task
    private active?: TaskInfo;
    // you can't invoke progress after an error
    private errored: boolean = false;
    // keys
    private keys: ProgressKeys = {};

    // removes all tasks
    reset() {
        this.tasks = [];
        this.active = undefined;
        this.errored = false;
    }

    // adds a new task to the stack
    new(title: string, subject?: string) {
        console.assert(this.errored === false, "Can't continue after an error");
        const task: TaskInfo = {
            status: "processing",
            title,
            subject,
        };
        if (this.active) {
            // mark the previous task as waiting
            this.active.status = "waiting";
        }
        this.active = task;
        this.tasks.push(task);
        this.update(true);
    }

    // updates the progress of the current task
    progress(format: FormatProgress, actual: number, total?: number) {
        if (!this.active) {
            console.assert(false, "No active task");
            return;
        }
        this.active.progress = {
            actual,
            total,
            format,
        };
        // throttle updates
        this.update(false);
    }

    // marks the last task as finished and removes it from the stack
    done() {
        if (!this.active) {
            console.assert(false, "No active task");
            return;
        }
        this.active.status = "success";
        if (this.active.progress && this.active.progress.total) {
            // make sure to top out the progress
            this.active.progress.actual = this.active.progress.total;
        }
        this.active = this.tasks
            .slice()
            .reverse()
            .find((t) => t.status === "waiting");
        this.update(true);
    }

    // marks the last task as failed and crashes
    error(info: string) {
        if (!this.active) this.new("Error");
        this.active!.status = "error";
        this.active!.error = info;
        this.errored = true;
        this.update(true);
    }

    // set a stat key
    stat(key: string, value: number) {
        if (this.keys[key] !== value) {
            this.keys[key] = value;
            this.update(false);
        }
    }

    private lastCount: number = 0;
    private lastTs: number = 0;

    private update(force: boolean) {
        let emit = force;
        let ts: number = 0;

        // throttle
        if (emit === false && this.active && this.active.progress) {
            // try by %
            if (this.active.progress.total !== undefined) {
                const onePercent = this.active.progress.total * 0.01;
                emit = this.active.progress.actual - this.lastCount >= onePercent;
            }

            // try by time
            // (check time every 100 items)
            if (emit === false && this.active.progress.actual - this.lastCount > 100) {
                ts = Date.now();
                emit = ts - this.lastTs > 15;
            }
        }

        if (emit) {
            this.emit("update", <ProgressMessage>{
                type: "progress",
                tasks: this.tasks,
                keys: this.keys,
            });
            this.lastCount = this.active?.progress?.actual || 0;
            this.lastTs = ts || Date.now();
        }
    }
}

// Global progress object
// Can be used anywhere but be careful
export const progress = new Progress();
