export type LoadAssetFn = {
    <T>(filepath: string, type: "json"): Promise<T>;
    (filepath: string, type: "text"): Promise<string>;
    (filepath: string, type: "arraybuffer"): Promise<ArrayBuffer>;
};

export interface Env {
    // isDev: boolean;
    loadAsset: LoadAssetFn;
}
