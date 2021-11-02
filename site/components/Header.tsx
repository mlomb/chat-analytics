import { useMemo, useState } from "react";

import { NewAuthor, NewChannel, NewReport } from "../../analyzer/Analyzer";
import { dataProvider, DataProvider } from "../DataProvider";
import AuthorChip from "./chips/AuthorChip";

import ChannelChip from "./chips/ChannelChip";
import FilterSelect from "./FilterSelect";
import TimeSelector from "./TimeSelector";

interface Props {
    title: string;
    tab: string;
    setTab: (tab: string) => void;
    selectedChannels: NewChannel[];
    selectedAuthors: NewAuthor[];
    setSelectedChannels: (channels: NewChannel[]) => void;
    setSelectedAuthors: (authors: NewAuthor[]) => void;
}

const Tab = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
    onChange: (value: string) => void;
}) => {
    const selected = props.currentValue === props.value;
    return <a
        className={selected ? "active" : ""}
        onClick={() => props.onChange(props.value)}
        role="tab"
        aria-selected={selected}
    >
        {props.children}
    </a>;
};

const Header = (props: Props) => {
    const { tab, setTab, title } = props;
    const report = dataProvider.getSource();

    const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([...report.channels]);
    const [selectedUsers, setSelectedUsers] = useState<NewAuthor[]>([...report.authors]);

    const channelChip = useMemo(() => (props: { data: NewChannel }) => <ChannelChip platform="telegram" channel={props.data} />, []); // TODO: add platform dependency
    const authorChip = useMemo(() => (props: { data: NewAuthor }) => <AuthorChip platform="telegram" author={props.data} />, []); // TODO: add platform dependency

    return (
        <div className="Header">
            <h1>{title}</h1>
            <h2>chat analysis report</h2>
            <div className="Filters">
                <div className="Filters__Filter">
                    <label htmlFor="channels">Channels</label>
                    <FilterSelect
                        options={report.channels}
                        placeholder="Select channels..."
                        selected={selectedChannels}
                        onChange={setSelectedChannels}
                        optionColorHue={266}
                        itemComponent={channelChip}
                    />
                </div>
                <div className="Filters__Filter">
                    <label htmlFor="authors">Authors</label>
                    <FilterSelect
                        options={report.authors}
                        placeholder="Select users..."
                        selected={selectedUsers}
                        // @ts-ignore
                        onChange={setSelectedUsers}
                        optionColorHue={240}
                        itemComponent={authorChip}
                    />
                </div>
                <div className="Filters__Filter" style={{ minWidth: "100%" }}>
                    <label htmlFor="authors">Time</label>
                    <TimeSelector/>
                </div>
            </div>
            <div className="Header__Tabs" role="tablist">
                <Tab currentValue={tab} onChange={setTab} value="messages">💬 Messages</Tab>
                <Tab currentValue={tab} onChange={setTab} value="language">🅰️ Language</Tab>
                <Tab currentValue={tab} onChange={setTab} value="emojis">😃 Emojis</Tab>
                <Tab currentValue={tab} onChange={setTab} value="interaction">🌀 Interaction</Tab>
                <Tab currentValue={tab} onChange={setTab} value="sentiment">💙 Sentiment</Tab>
                <Tab currentValue={tab} onChange={setTab} value="external">🔗 External</Tab>
                <Tab currentValue={tab} onChange={setTab} value="timeline">📅 Timeline</Tab>
            </div>
        </div>
    );
};

export default Header;