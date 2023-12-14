import { Env } from "@pipeline/Env";
import { Language, getLanguageIndexByCode } from "@pipeline/Languages";

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

/** FastText model wrapper. Only allows to run predict */
export class FastTextModel {
    private constructor(private readonly model: FastTextModelClass) {}

    /**
     * Make a prediction for a single line of text.
     *
     * @param text the text to predict
     * @param k return top `k` predictions
     * @param threshold only return predictions with a probability higher than `threshold`
     * @returns an array of [probability, label] pairs
     */
    predict(text: string, k = 1, threshold = 0.0): [number, string][] {
        const predictions = this.model.predict(text, k, threshold);
        const len = predictions.size();
        const res = [];
        for (let i = 0; i < len; i++) res.push(predictions.get(i));
        return res;
    }

    static async load(modelPath: string, env: Env) {
        // load assets and model
        const fastTextModuleJs = await env.loadAsset(`/fasttext/fasttext_wasm.js`, "text");
        const fastTextModuleWasm = await env.loadAsset(`/fasttext/fasttext_wasm.wasm`, "arraybuffer");
        const model = new Uint8Array(await env.loadAsset(modelPath, "arraybuffer"));

        // instantiate module using eval :)
        const fastTextModuleFn = new Function(fastTextModuleJs + `; return Module;`)();
        const fastTextModule = (await fastTextModuleFn({ wasmBinary: fastTextModuleWasm })) as FastTextModule;

        // write the input model to the fake filesystem as "model.bin"
        // NOTE: writeFile is not available since the closure compiler optimized it out (but we still have open, write and close)
        // we could configure CC to keep it, but it's not worth it; this works
        const { FS } = fastTextModule;
        const stream = FS.open("model.bin", "w+");
        FS.write(stream, model, 0, model.length, 0);
        FS.close(stream);

        // create the C++ class FastText and load the model "model.bin" from the fake filesystem
        const fastText = new fastTextModule.FastText();
        fastText.loadModel("model.bin");

        return new FastTextModel(fastText);
    }
}

/**
 * Language identification model provided by fastText themselves.
 *
 * https://fasttext.cc/docs/en/language-identification.html
 */
export class FastTextLID176Model {
    private constructor(private readonly model: FastTextModel) {}

    /**
     * Identify the language of the given text.
     *
     * @param line text to identify language, **must be a single line** and not contain newlines
     * @returns ISO 639-2/3 code and accuracy
     */
    identifyLanguage(line: string) {
        const result = this.model.predict(line, 1, 0.0);
        const code = result[0][1].slice(9); // "__label__".length === 9
        return {
            iso639: code as Language,
            iso639index: getLanguageIndexByCode(code as Language),
            accuracy: result[0][0],
        };
    }

    /** Loads the `lid.176.ftz` model */
    static async load(env: Env) {
        return new FastTextLID176Model(await FastTextModel.load("/data/models/lid.176.ftz", env));
    }
}
