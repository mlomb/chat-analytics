import { Platform } from "@pipeline/Types";
import { ReportData } from "@pipeline/process/ReportData";

export interface AuthorOption {
    id: number;
    name: string;
    name_searchable: string;
    bot: boolean;
}

export interface ChannelOption {
    id: number;
    name: string;
    name_searchable: string;
}

export interface Basic {
    platform: Platform;
    title: string;
    minDate: string;
    maxDate: string;
    authors: AuthorOption[];
    channels: ChannelOption[];
}

export const computeBasic = (pd: ReportData): Basic => ({
    platform: pd.config.platform,
    title: pd.title,
    minDate: pd.minDate,
    maxDate: pd.maxDate,
    authors: pd.authors.map((a, i) => ({
        id: i,
        name: a.name,
        name_searchable: a.name_searchable,
        bot: a.bot,
    })),
    channels: pd.channels.map((a, i) => ({
        id: i,
        name: a.name,
        name_searchable: a.name_searchable,
    })),
});
