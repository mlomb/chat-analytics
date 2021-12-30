import { IMessage } from "@pipeline/Types";

import { FastTextModel, loadFastTextModel } from "@pipeline/process/FastText";

let languageDetectorModel: FastTextModel | undefined;

export const processMessage = async (message: IMessage) => {
    //console.log("==========================");
    //console.log(message);
    /*
    if (languageDetectorModel === undefined) {
        languageDetectorModel = await loadFastTextModel("lid.176");
    }
    let pred = languageDetectorModel.predict(message.content, 5, 0.0);
    */
    //console.log(pred[0]);
};
