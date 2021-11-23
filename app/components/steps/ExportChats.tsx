import { Platform } from "@pipeline/Types";
import { Platforms } from "@app/Platforms";

import Button from "@app/components/Button";

interface Props {
    platform: Platform | null;
    onBack: () => void;
    onNext: () => void;
}

const ExportChats = ({ platform, onBack, onNext }: Props) => (
    <div className="ExportChats">
        You need to export the chats you want to analyze.
        <br />
        Below you can find official instructions:
        <br />
        <ol>
            <li>Open WhatsApp in your phone and then select the chat you want to analyze.</li>
            <li>Press the context menu in the top right corner.</li>
            <li>In the context menu, press "More" and then "Export chat".</li>
            <li>When asked to export with or without media, select "Without Media".</li>
            <li>Save the file and transfer it to this device.</li>
        </ol>
        For more information about exporting, please visit the{" "}
        <a href="https://faq.whatsapp.com/android/chats/how-to-save-your-chat-history" target="_blank">
            official link
        </a>
        .
        <br />
        <Button color={[212, 17, 12]} onClick={onBack}>
            Back
        </Button>
        <Button color={[258, 90, 61]} onClick={onNext}>
            Continue
        </Button>
    </div>
);

export default ExportChats;
