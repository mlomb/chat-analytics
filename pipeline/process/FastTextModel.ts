import { Env } from "@pipeline/Env";

interface FastTextModelClass {
    loadModel: (path: string) => void;
    predict: (text: string, k: number, threshold: number) => any;
}

interface FastTextModule {
    FS: {
        open: (path: string, flags: string) => number;
        write: (stream: number, buffer: Uint8Array, offset: number, length: number, position: number) => number;
        close: (stream: number) => void;
    };

    FastText: new () => FastTextModelClass;
}

export class FastTextModel {
    constructor(private readonly model: FastTextModelClass) {}

    predict(text: string, k = 1, threshold = 0.0): [number, string][] {
        const predictions = this.model.predict(text, k, threshold);
        const len = predictions.size();
        const res = [];
        for (let i = 0; i < len; i++) res.push(predictions.get(i));
        return res;
    }
}
export const loadFastTextModel = async (modelName: string, env: Env) => {
    const fastTextModuleJs = await env.loadAsset(`/fasttext/fasttext_wasm.js`, "text");
    const fastTextModuleFn = new Function(fastTextModuleJs + `; return Module;`)();
    const fastTextModule = (await fastTextModuleFn({
        wasmBinary: await env.loadAsset(`/fasttext/fasttext_wasm.wasm`, "arraybuffer"),
    })) as FastTextModule;

    const model = new Uint8Array(await env.loadAsset(`/data/models/${modelName}.ftz`, "arraybuffer"));

    // NOTE: writeFile is not available since the closure compiler optimized it out (but we still have open, write and close)
    // we could configure CC to keep it but it's not worth it, this works
    const { FS } = fastTextModule;
    const stream = FS.open("model.bin", "w+");
    FS.write(stream, model, 0, model.length, 0);
    FS.close(stream);

    const fastText = new fastTextModule.FastText();
    fastText.loadModel("model.bin");

    return new FastTextModel(fastText);
};
