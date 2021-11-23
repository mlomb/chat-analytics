import { useRef, useState, DragEvent } from "react";

import { Platform } from "@pipeline/Types";
import { Platforms } from "@app/Platforms";

import Button from "@app/components/Button";

interface Props {
    platform: Platform | null;
    files: File[];
    onFilesUpdate: (files: File[]) => void;
}

const FilesSelect = ({ platform, files, onFilesUpdate }: Props) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragover, setDragover] = useState(false);

    const onFileClick = () => fileRef.current!.click();

    const onFileChange = () => {
        console.log(fileRef.current!.files!.length > 0 ? fileRef.current!.files : "Drag your audio file or click here");
        onFilesUpdate(Array.from(fileRef.current!.files!));
    };

    const onDrag = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        switch (e.type) {
            case "dragover":
            case "dragenter":
                setDragover(true);
                break;

            case "dragleave":
            case "dragend":
                setDragover(false);
                break;

            case "drop":
                setDragover(false);
                fileRef.current!.files = e.dataTransfer!.files;
                onFileChange();
                break;
        }
    };

    const platformInfo = Platforms.find((p) => p.platform === platform);

    return (
        <div className="FilesSelect">
            Select the files from the previous step:
            <div
                className={["FilesSelect__dropzone", dragover ? "FilesSelect__dropzone--dragover" : ""].join(" ")}
                onClick={onFileClick}
                onDrop={onDrag}
                onDragOver={onDrag}
                onDragEnd={onDrag}
                onDragEnter={onDrag}
                onDragLeave={onDrag}
            >
                Drop <span>{platformInfo?.defaultFilename}</span> files here
                <br />
                or click to browse
            </div>
            <input type="file" hidden multiple onChange={onFileChange} ref={fileRef} />
            {files.length === 0 ? (
                <>No files selected</>
            ) : (
                <>
                    {files.length} file{files.length === 1 ? "" : "s"} selected
                </>
            )}
            <Button
                className="FilesSelect__clear"
                color={[0, 50, 50]}
                onClick={() => onFilesUpdate([])}
                disabled={files.length === 0}
            >
                Clear
            </Button>
        </div>
    );
};

export default FilesSelect;
