import { EventEmitter } from "events";

type Status = "processing" | "waiting" | "success" | "error";

/**
 * Format of the progress
 * e.g.
 * - "number" (e.g. 3/10)
 * - "bytes" (e.g. 3.5MB/10MB)
 */
type FormatProgress = "number" | "bytes";

export interface ProgressTask {
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

/** Key-value pairs of stats */
export interface ProgressStats {
    [key: string]: number;
}

export declare interface Progress {
    on(event: "progress", listener: (tasks: ProgressTask[], stats: ProgressStats) => void): this;
}

/**
 * Tracks the progress of the generation.
 *
 * It stores two things:
 * - a stack of tasks and its status and progress
 * - key-value pairs of stats (e.g. files processed, messages processed, etc.)
 *
 * Every time progress is updated, it emits a "progress" event with the updated tasks and stats.
 *
 * The lifecycle of a task is:
 * - `new()`
 * - `progress()` (optional)
 * - ...
 * - `progress()` (optional)
 * - `success()` or `error()`
 *
 * Note: there is an undocumented and untested `waiting` state, which allows multiple `new` calls (unused)
 */
export class Progress extends EventEmitter {
    /** All the tasks */
    private tasks: ProgressTask[] = [];

    /** Currently active task. Next calls to `progress` will update this task. */
    private active?: ProgressTask;

    /** Stats (global) */
    private keys: ProgressStats = {};

    /** Whether a task errored */
    private errored: boolean = false;

    /** Adds a new task */
    new(title: string, subject?: string) {
        if (this.errored) throw new Error("Can't create new progress task after an error");

        const task: ProgressTask = {
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

    /** Updates the progress of the current task */
    progress(format: FormatProgress, actual: number, total?: number) {
        if (!this.active) {
            const prevTask = this.tasks
                .slice()
                .reverse()
                .find((t) => t.status === "waiting");
            if (prevTask) {
                const prevTaskCopy = JSON.parse(JSON.stringify(prevTask));
                prevTaskCopy.status = "processing";
                this.tasks.push(prevTaskCopy);
                this.active = prevTaskCopy;
            }
        }

        if (!this.active) throw new Error("No active task to update progress");

        this.active.progress = {
            actual,
            total,
            format,
        };
        // throttle updates
        this.update(false);
    }

    /** Marks the last task as finished and removes it from the stack */
    success() {
        if (!this.active) throw new Error("No active task to mark as success");

        this.active.status = "success";
        if (this.active.progress && this.active.progress.total) {
            // make sure to top up the progress
            this.active.progress.actual = this.active.progress.total;
        }
        this.active = undefined;
        this.update(true);
    }

    /** Marks the last task as failed */
    error(info: string) {
        if (!this.active) this.new("Error");
        this.active!.status = "error";
        this.active!.error = info;
        this.errored = true;
        this.update(true);
    }

    /** Set a stat value */
    stat(key: string, value: number) {
        if (this.keys[key] !== value) {
            const wasDefined = key in this.keys;
            this.keys[key] = value;
            this.update(!wasDefined);
        }
    }

    private lastCount: number = 0;
    private lastTs: number = 0;

    /**
     * Emits a "progress" event if progress advanced at least 1% or 15ms has passed since the last update.
     *
     * @param force whether to force the update
     */
    private update(force: boolean) {
        let emit = force;
        let ts: number = 0;

        // throttle
        if (!emit && this.active && this.active.progress) {
            // try by %
            if (this.active.progress.total !== undefined) {
                const onePercent = this.active.progress.total * 0.01;
                emit = this.active.progress.actual - this.lastCount >= onePercent;
            }

            // try by time
            if (!emit) {
                ts = Date.now();
                emit = ts - this.lastTs > 15;
            }
        }

        if (emit) {
            this.emit("progress", this.tasks, this.keys);
            this.lastCount = this.active?.progress?.actual || 0;
            this.lastTs = ts || Date.now();
        }
    }
}
