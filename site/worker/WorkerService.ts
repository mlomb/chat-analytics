import Worker, { Message } from "./Worker";

import { Platform } from "../../analyzer/Types";

class WorkerService {
    private _worker?: Worker;
    private _platform?: Platform;

    constructor() {
        this.startWorker();
    }

    private startWorker() {
        this._worker = new Worker();
        this._worker!.onerror = (ev:any) => alert(`Error loading WebWorker:\n\n${ev.message}`);
        this._worker!.onmessage = (ev:any) => {
            console.log(ev.data);
            let url = URL.createObjectURL(ev.data);
            console.log(url);
        };
    }

    private post(msg: Message) {
        this._worker?.postMessage(msg);
    }

    public attachFiles(files: FileList) {
        this.post({ type: "start", platform: this._platform!, files });
    }
    
    public set platform(platform: Platform | undefined) {
        if(this._platform) {
            this._worker?.terminate();
            this.startWorker();
        }
        this._platform = platform;
    }
}

export default new WorkerService();
