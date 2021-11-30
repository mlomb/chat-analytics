// @ts-nocheck TODO: remove
import { useLayoutEffect, useState } from "react";
import { dataProvider } from "@report/DataProvider";
import { NewAuthor, NewChannel } from "@pipeline/Analyzer";
import AuthorChip from "./components/core/AuthorChip";
import ChannelChip from "./components/core/ChannelChip";

import FilterSelect, { SelectSpecialOpcion } from "./components/FilterSelect";
import TimeSelector from "./components/TimeSelector";
import { TabSwitch } from "./Tabs";
import { dataDispatcher } from "./DataDispatcher";

interface Props {
    tab: string;
    setTab: (tab: string) => void;
}

const channelsSpecialOptions: SelectSpecialOpcion<NewChannel>[] = [
    {
        name: "Select all channels",
        filter: (options) => options,
    },
];

const authorsSpecialOptions: SelectSpecialOpcion<NewAuthor>[] = [
    {
        name: "Select all authors (🧍➕🤖)",
        filter: (options) => options,
    },
    {
        name: "Select all non-bot authors (🧍)",
        filter: (options) => options.filter((o) => o.bot === false),
    },
    {
        name: "Select all bot authors (🤖)",
        filter: (options) => options.filter((o) => o.bot === true),
    },
];

const tabs = [
    {
        name: "💬 Messages",
        value: "messages",
    },
    {
        name: "🅰️ Language",
        value: "language",
    },
    {
        name: "😃 Emojis",
        value: "emojis",
    },
    {
        name: "🌀 Interaction",
        value: "interaction",
    },
    {
        name: "💙 Sentiment",
        value: "sentiment",
    },
    {
        name: "🔗 External",
        value: "external",
    },
    {
        name: "📅 Timeline",
        value: "timeline",
    },
];

const Header = (props: Props) => {
    const { tab, setTab } = props;
    const report = dataProvider.getSource();

    const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([...report.channels]);
    const [selectedAuthors, setSelectedAuthors] = useState<NewAuthor[]>([...report.authors]);

    useLayoutEffect(() => dataDispatcher.updateAuthors(selectedAuthors), [selectedAuthors]);
    useLayoutEffect(() => dataDispatcher.updateChannels(selectedChannels), [selectedChannels]);

    return (
        <div className="Header">
            <h1>{report.title}</h1>
            <h2>chat analysis report</h2>
            <div className="Filters">
                <div className="Filters__Filter">
                    <label htmlFor="channels">Channels</label>
                    <FilterSelect
                        id="channels"
                        options={report.channels}
                        placeholder="Select channels..."
                        selected={selectedChannels}
                        onChange={setSelectedChannels}
                        optionColorHue={266}
                        itemComponent={ChannelChip}
                        specialOptions={channelsSpecialOptions}
                    />
                </div>
                <div className="Filters__Filter">
                    <label htmlFor="authors">Authors</label>
                    <FilterSelect
                        id="authors"
                        options={report.authors}
                        placeholder="Select authors..."
                        selected={selectedAuthors}
                        onChange={setSelectedAuthors}
                        optionColorHue={240}
                        itemComponent={AuthorChip}
                        specialOptions={authorsSpecialOptions}
                    />
                </div>
                <div className="Filters__Filter" style={{ minWidth: "100%" }}>
                    <label htmlFor="authors">Time</label>
                    <TimeSelector />
                </div>
            </div>
            <div className="Header__Tabs" role="tablist">
                {tabs.map((t) => (
                    <TabSwitch key={t.value} currentValue={tab} onChange={setTab} value={t.value} children={t.name} />
                ))}
            </div>
        </div>
    );
};

export default Header;
