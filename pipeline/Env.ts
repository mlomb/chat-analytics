import { Progress } from "@pipeline/Progress";

/**
 * Interface to load assets, e.g. stopword list, models, etc.
 * In the web, it may be an XHR request, in Node it may be a file read
 *
 * It must implement all three signatures
 */
export type LoadAssetFn = {
    <T>(filepath: string, type: "json"): Promise<T>;
    (filepath: string, type: "text"): Promise<string>;
    (filepath: string, type: "arraybuffer"): Promise<ArrayBuffer>;
};

/** Interface required for each environment */
export interface Env {
    /** Required to load assets */
    loadAsset: LoadAssetFn;

    /** Optionally provide a Progress object to receive progress callbacks */
    progress?: Progress;
}
