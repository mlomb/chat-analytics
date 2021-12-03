import { ReportConfig, StepInfo } from "@pipeline/Types";
import { Database } from "@pipeline/parse/Database";
import { ProcessedData } from "@pipeline/preprocess/ProcessedData";

export const preprocess = async function* (
    database: Database,
    config: ReportConfig
): AsyncGenerator<StepInfo, ProcessedData> {
    return {
        platform: database.platform,
        title: database.title,
        minDate: "",
        maxDate: "",

        channels: [],
        authors: [],
    };
};
