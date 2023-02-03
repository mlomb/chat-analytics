import { LoadAssetFn } from "@pipeline/Env";
import { Progress } from "@pipeline/Progress";
import { FileInput } from "@pipeline/parse/File";

/** Wraps a Web API File object to our file abstraction */
export const wrapFile = (file: File): FileInput => ({
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    slice: (start, end) => (start !== undefined ? file.slice(start, end).arrayBuffer() : file.arrayBuffer()),
});

/** Global progress object for the WebEnv, since we only need one */
const progress = new Progress();

/** Loads assets when running in the web environment using XHR */
const loadWebAsset: LoadAssetFn = async (filepath: string, responseType: "json" | "text" | "arraybuffer") => {
    // We use XHR and not fetch because fetch doesn't support "onprogress"

    progress.new("Downloading file", filepath.split("/").pop());
    return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = responseType;
        xhr.open("GET", filepath);
        xhr.onload = () => {
            progress.success();
            if (xhr.status === 200) resolve(xhr.response);
            else reject(xhr.statusText);
        };
        xhr.onerror = () => reject("XHR Error, check your internet connection");
        xhr.onprogress = (e) => progress.progress("bytes", e.loaded || 0, e.total <= 0 ? undefined : e.total);
        xhr.send();
    });
};

export const WebEnv = {
    loadAsset: loadWebAsset,
    progress,
};
// TODO: add the following line when https://github.com/trivago/prettier-plugin-sort-imports/issues/204 is resolved
// } satisfies Env;
