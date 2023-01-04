import { progress } from "@pipeline/Progress";
import { downloadFile } from "@pipeline/File";

export class FastTextModel {
    constructor(private readonly model: any) {}

    predict(text: string, k = 1, threshold = 0.0): [number, string][] {
        const predictions = this.model.predict(text, k, threshold);
        const len = predictions.size();
        const res = [];
        for (let i = 0; i < len; i++) res.push(predictions.get(i));
        return res;
    }
}

export const loadFastTextModel = async (modelName: string) => {
    progress.new("Downloading FastText WASM module");
    // @ts-ignore
    const { default: fastTextModularized } = await import("@assets/fasttext/fasttext_wasm.js");
    const fastTextModule = await fastTextModularized();
    const fastText = new fastTextModule.FastText();
    progress.done();

    const model = new Uint8Array(await downloadFile(`/data/${modelName}.ftz`, "arraybuffer"));

    progress.new("Loading model", modelName);
    const FS = fastTextModule.FS;
    await FS.writeFile("model.bin", model);
    fastText.loadModel("model.bin");
    progress.done();

    return new FastTextModel(fastText);
};
