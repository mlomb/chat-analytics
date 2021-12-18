import "@assets/styles/Header.less";

import { useLayoutEffect, useState } from "react";

import { useDataProvider } from "@report/DataProvider";
import { AuthorOption, ChannelOption } from "@report/Basic";

import AuthorChip from "@report/components/core/AuthorChip";
import ChannelChip from "@report/components/core/ChannelChip";
import { TabSwitch } from "@report/components/Tabs";
import TimeSelector from "@report/components/TimeSelector";
import FilterSelect, { SelectSpecialOpcion } from "@report/components/FilterSelect";

import Logo from "@assets/images/logo.svg";

interface Props {
    tab: string;
    setTab: (tab: string) => void;
}

const channelsSpecialOptions: SelectSpecialOpcion<ChannelOption>[] = [
    {
        name: "Select all channels",
        filter: (options) => options,
    },
];

const authorsSpecialOptions: SelectSpecialOpcion<AuthorOption>[] = [
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
    const dataProvider = useDataProvider();

    const [selectedChannels, setSelectedChannels] = useState<ChannelOption[]>([...dataProvider.basic.channels]);
    const [selectedAuthors, setSelectedAuthors] = useState<AuthorOption[]>([...dataProvider.basic.authors]);

    useLayoutEffect(() => dataProvider.updateAuthors(selectedAuthors), [selectedAuthors]);
    useLayoutEffect(() => dataProvider.updateChannels(selectedChannels), [selectedChannels]);

    return (
        <div className="Header">
            <div className="Header__info">
                <span className="Header__title">
                    <h1>{dataProvider.basic.title}</h1>
                    <h2>chat analysis report</h2>
                </span>
                <div className="Header__link">
                    <a href="https://chatstbdtbd.app" target="_blank">
                        <img src={Logo} alt="chatstbdtbd.app logo" height="60" />
                    </a>
                </div>
            </div>
            <div className="Filters">
                <div className="Filters__Filter">
                    <label htmlFor="channels">Channels</label>
                    <FilterSelect
                        id="channels"
                        options={dataProvider.basic.channels}
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
                        options={dataProvider.basic.authors}
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
