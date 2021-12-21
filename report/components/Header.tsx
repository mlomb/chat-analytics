import "@assets/styles/Header.less";

import { useLayoutEffect, useMemo, useState } from "react";

import { ID } from "@pipeline/Types";
import { DataProvider, useDataProvider } from "@report/DataProvider";
import { AuthorOption, ChannelOption } from "@report/Basic";

import AuthorLabel from "@report/components/core/AuthorLabel";
import ChannelLabel from "@report/components/core/ChannelLabel";
import { TabSwitch } from "@report/components/Tabs";
import TimeSelector from "@report/components/TimeSelector";
import FilterSelect, { FilterOption } from "@report/components/FilterSelect";

import Logo from "@assets/images/logo.svg";

interface Props {
    tab: string;
    setTab: (tab: string) => void;
}

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

const channelsFilterOptionsFn: (dp: DataProvider) => FilterOption[] = (dp) => [
    {
        name: "Select all channels",
        options: dp.basic.channels.map((c) => c.id),
    },
];

const authorsFilterOptionsFn: (dp: DataProvider) => FilterOption[] = (dp) => [
    {
        name: "Select all authors (🧍➕🤖)",
        options: dp.basic.authors.map((a) => a.id),
    },
    {
        name: "Select all non-bot authors (🧍)",
        options: dp.basic.authors.filter((o) => o.bot === false).map((a) => a.id),
    },
    {
        name: "Select all bot authors (🤖)",
        options: dp.basic.authors.filter((o) => o.bot === true).map((a) => a.id),
    },
];

const NumberComponentTest = (props: { id: number }) => {
    return (
        <span
            style={{
                color: "white",
                whiteSpace: "nowrap",
            }}
        >
            index {props.id}
        </span>
    );
};

const Header = (props: Props) => {
    const { tab, setTab } = props;
    const dataProvider = useDataProvider();

    const channelsFilterOptions = useMemo(() => channelsFilterOptionsFn(dataProvider), [dataProvider]);
    const authorsFilterOptions = useMemo(() => authorsFilterOptionsFn(dataProvider), [dataProvider]);

    const [selectedChannels, setSelectedChannels] = useState<ID[]>(channelsFilterOptions[0].options);
    const [selectedAuthors, setSelectedAuthors] = useState<ID[]>(authorsFilterOptions[0].options);

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
                        options={channelsFilterOptions[0].options}
                        placeholder="Select channels..."
                        selected={selectedChannels}
                        onChange={setSelectedChannels}
                        optionColorHue={266}
                        itemComponent={ChannelLabel}
                        filterOptions={channelsFilterOptions}
                    />
                </div>
                <div className="Filters__Filter">
                    <label htmlFor="authors">Authors</label>
                    <FilterSelect
                        options={authorsFilterOptions[0].options}
                        placeholder="Select authors..."
                        selected={selectedAuthors}
                        onChange={setSelectedAuthors}
                        optionColorHue={240}
                        itemComponent={NumberComponentTest}
                        filterOptions={authorsFilterOptions}
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
