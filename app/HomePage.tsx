import { useState, useEffect, useRef } from "react";

import { Platform } from "@pipeline/Types";

import Worker, { WorkerResult } from "@app/Worker";

const HomePage = () => {
    const [platform, setPlatform] = useState<Platform | undefined>(undefined);
    const [worker, setWorker] = useState<Worker | undefined>(undefined);
    const [result, setResult] = useState<WorkerResult | undefined>(undefined);
    const fileInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const worker: Worker = new Worker();
        worker.onerror = (ev) => alert(`Error loading WebWorker:\n\n${ev.message}`);
        worker.onmessage = (ev: MessageEvent<WorkerResult>) => setResult(ev.data);
        setWorker(worker);
        return () => {
            worker.terminate();
            console.log("Terminating");
        };
    }, []);

    const selectFiles = (files: FileList) => {
        worker!.postMessage({ type: "start", platform, files });
    };

    return (
        <>
            <div>
                <h1>Hello world</h1>
                {platform ? (
                    <>
                        <div>Selected: {platform}</div>
                        <button
                            onClick={() => {
                                setPlatform(undefined);
                                setResult(undefined);
                            }}
                        >
                            Cancel
                        </button>
                        <input
                            type="file"
                            multiple={true}
                            ref={fileInput}
                            onChange={(e) => (e.target as any).files && selectFiles((e.target as any).files)}
                        />
                        {result ? (
                            <>
                                <br />
                                <a href={result.url} target="_blank">
                                    Ver reportes
                                </a>
                                <br />
                                <a href={result.url} download="report.html">
                                    Descargar ({result.blob.size} bytes)
                                </a>
                            </>
                        ) : null}
                    </>
                ) : (
                    <>
                        <button onClick={() => setPlatform("whatsapp")}>Select WhatsApp</button>
                        <br />
                        <button onClick={() => setPlatform("discord")}>Select Discord</button>
                        <br />
                        <button onClick={() => setPlatform("telegram")}>Select Telegram</button>
                    </>
                )}
            </div>
        </>
    );
};

export default HomePage;
