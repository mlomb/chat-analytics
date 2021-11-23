import { Platform } from "@pipeline/Types";
import { Platforms } from "@app/Platforms";

import Button from "@app/components/Button";

interface Props {
    platform: Platform | null;
}

const FilesSelect = ({ platform }: Props) => (
    <div className="FilesSelect">
        <div className="FilesSelect__drop-area">
            Drop <span>telegram.json</span> files here
            <br />
            or <a>browse</a> to upload
        </div>
        <Button color={[1, 2, 3]}>Back</Button>
        <Button color={[1, 2, 3]}>Generate</Button>
    </div>
);

export default FilesSelect;
