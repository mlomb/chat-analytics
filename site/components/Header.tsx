import { dataProvider } from "../DataProvider";
import { NewAuthor, NewChannel } from "../../analyzer/Analyzer";
import AuthorChip from "./chips/AuthorChip";
import ChannelChip from "./chips/ChannelChip";

import FilterSelect, { SelectSpecialOpcion } from "./FilterSelect";
import TimeSelector from "./TimeSelector";

interface Props {
    tab: string;
    setTab: (tab: string) => void;
    selectedChannels: NewChannel[];
    selectedAuthors: NewAuthor[];
    setSelectedAuthors: (authors: NewAuthor[]) => void;
    setSelectedChannels: (channels: NewChannel[]) => void;
}

const Tab = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
    onChange: (value: string) => void;
}) => {
    const selected = props.currentValue === props.value;
    return (
        <a
            className={selected ? "active" : ""}
            onClick={() => props.onChange(props.value)}
            role="tab"
            aria-selected={selected}
        >
            {props.children}
        </a>
    );
};

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

const Header = (props: Props) => {
    const { tab, setTab } = props;
    const report = dataProvider.getSource();

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
                        selected={props.selectedChannels}
                        onChange={props.setSelectedChannels}
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
                        selected={props.selectedAuthors}
                        onChange={props.setSelectedAuthors}
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
                <Tab currentValue={tab} onChange={setTab} value="messages">
                    💬 Messages
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="language">
                    🅰️ Language
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="emojis">
                    😃 Emojis
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="interaction">
                    🌀 Interaction
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="sentiment">
                    💙 Sentiment
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="external">
                    🔗 External
                </Tab>
                <Tab currentValue={tab} onChange={setTab} value="timeline">
                    📅 Timeline
                </Tab>
            </div>
        </div>
    );
};

export default Header;
