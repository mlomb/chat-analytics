import { Env, LoadAssetFn } from "@pipeline/Env";
import { FileInput } from "@pipeline/File";
import { progress } from "@pipeline/Progress";

// Wraps a Web API File object to our file abstraction
export const wrapFile = (file: File): FileInput => ({
    name: file.name,
    size: file.size,
    lastModified: file.lastModified,
    slice: (start, end) => (start !== undefined ? file.slice(start, end).arrayBuffer() : file.arrayBuffer()),
});

const loadAsset: LoadAssetFn = async (filepath: string, responseType: "json" | "text" | "arraybuffer") => {
    progress.new("Downloading file", filepath.split("/").pop());
    return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.responseType = responseType;
        xhr.open("GET", filepath);
        xhr.onload = () => {
            progress.done();
            if (xhr.status === 200) resolve(xhr.response);
            else reject(xhr.statusText);
        };
        xhr.onerror = () => reject("XHR Error, check your internet connection");
        xhr.onprogress = (e) => progress.progress("bytes", e.loaded || 0, e.total <= 0 ? undefined : e.total);
        xhr.send();
    });
};

export const WebEnv: Env = {
    loadAsset,
};
