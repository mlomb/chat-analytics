import "./assets/styles.less";
import { h, Fragment, render } from 'preact';
import { useState, useRef } from 'preact/hooks';

import { Platform } from '../analyzer/Types';
import Service from "./worker/WorkerService";

const HomePage = () => {
    const [platform, setPlatform] = useState<Platform | undefined>(undefined);
    const fileInput = useRef<HTMLInputElement>(null);

    const select = (platform: Platform | undefined) => {
        setPlatform(platform);
        Service.platform = platform;
    };

    const selectFiles = (files: FileList) => {
        Service.attachFiles(files);
    };

    return <>
        <div>
            <h1>Hello world</h1>
            {platform ? <>
                <div>Selected: {platform}</div>
                <button onClick={() => select(undefined)}>Cancel</button>
                <input
                    type="file"
                    multiple={true}
                    ref={fileInput}
                    onChange={(e) => (e.target as any).files && selectFiles((e.target as any).files)}
                />
            </> : <>
                <button onClick={() => select("whatsapp")}>Start WhatsApp</button><br/>
                <button onClick={() => select("discord")}>Start Discord</button>
            </>}
        </div>
    </>;
}

document.addEventListener('DOMContentLoaded', () => {
    render(<HomePage/>, document.body);
});