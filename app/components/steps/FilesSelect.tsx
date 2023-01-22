import prettyBytes from "pretty-bytes";
import { DragEvent, useRef, useState } from "react";

import { Platforms } from "@app/Platforms";
import Button from "@app/components/Button";
import { Platform } from "@pipeline/Types";

interface Props {
    platform: Platform | null;
    files: File[];
    onFilesUpdate: (files: File[]) => void;
}

const FilesSelect = ({ platform, files, onFilesUpdate }: Props) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [dragover, setDragover] = useState(false);

    const onFileClick = () => fileRef.current!.click();

    const mergeFiles = (newFiles: File[]) => {
        const merged: File[] = [...files];
        newFiles.forEach((file) => {
            for (const existingFile of merged) {
                if (
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
                ) {
                    return;
                }
            }
            merged.push(file);
        });
        onFilesUpdate(merged);
    };

    const onFileChange = () => {
        mergeFiles(Array.from(fileRef.current!.files!));
        fileRef.current!.value = "";
    };

    const onDrag = (e: DragEvent<HTMLButtonElement>) => {
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
                mergeFiles(Array.from(e.dataTransfer!.files));
                break;
        }
    };

    const onClear = () => {
        onFilesUpdate([]);
        fileRef.current!.value = "";
    };

    const platformInfo = Platforms.find((p) => p.platform === platform);

    return (
        <div className="FilesSelect">
            Select the files from the previous step:
            <div className="FilesSelect__zone">
                <button
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
                </button>
                <div className="FilesSelect__info">
                    {files.length === 0 ? (
                        <>No files selected</>
                    ) : (
                        <>
                            {files.length} file{files.length === 1 ? "" : "s"} selected (
                            {prettyBytes(files.reduce((acc, file) => acc + file.size, 0))})
                        </>
                    )}
                    <Button
                        className="FilesSelect__clear"
                        hueColor={[0, 50, 50]}
                        onClick={onClear}
                        disabled={files.length === 0}
                    >
                        Clear
                    </Button>
                </div>
            </div>
            <input type="file" hidden multiple onChange={onFileChange} ref={fileRef} />
        </div>
    );
};

export default FilesSelect;
