import { useLayoutEffect, useMemo, useState } from "react";

import { NewAuthor, NewChannel, NewReport } from "../../analyzer/Analyzer";
import { dataProvider, DataProvider } from "../DataProvider";
import Header from "./Header";
import FilterSelect from "./FilterSelect";
import TimeSelector from "./TimeSelector";
import MessagesGraph from "./MessagesGraph";
import MessagesHeatMap from "./MessagesHeatMap";
import WordCloudGraph from "./WordCloudGraph";

const Tab = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
    onChange: (value: string) => void;
}) => {
    return <div
        className={props.currentValue === props.value ? "active tab" : "tab"}
        onClick={() => props.onChange(props.value)}
    >
        {props.children}
    </div>;
};

const TabContainer = (props: {
    currentValue: string;
    value: string;
    children: React.ReactNode;
}) => {
    return <div style={{ display: props.currentValue === props.value ? "block" : "none" }}>
        {props.children}
    </div>;
};

const ReportPage = () => {
    const report = dataProvider.getSource();

    const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([...report.channels]);
    const [selectedUsers, setSelectedUsers] = useState<NewAuthor[]>([...report.authors]);
    const [tab, setTab] = useState("messages");

    // let data = useMemo(()=> dataProvider.(selectedChannels, selectedUsers, report), [selectedChannels, selectedUsers]);

    console.log("report", report);
    console.log("selection", selectedUsers, selectedChannels);
    //console.log("data", data);

    useLayoutEffect(() => dataProvider.updateAuthors(selectedUsers), [selectedUsers]);
    useLayoutEffect(() => dataProvider.updateChannels(selectedChannels), [selectedChannels]);

    return <>
        <Header></Header>
        <h1>{report.title} (reporte WIP)</h1>

        <FilterSelect
        options={report.channels}
        allText="All channels"
        placeholder="Select channels..."
        selected={selectedChannels}
        onChange={setSelectedChannels}
        />
        <FilterSelect
        options={report.authors}
        allText="All users"
        placeholder="Select users..."
        selected={selectedUsers}
        onChange={setSelectedUsers}
        />

        <TimeSelector/>

        <Tab currentValue={tab} onChange={setTab} value="messages">Messages</Tab>
        <Tab currentValue={tab} onChange={setTab} value="words">Words</Tab>
        <Tab currentValue={tab} onChange={setTab} value="emojis">Emojis</Tab>

        <TabContainer currentValue={tab} value="messages">
            <MessagesGraph/>
        </TabContainer>
        <TabContainer currentValue={tab} value="words">
            <WordCloudGraph/>
        </TabContainer>

        {/*<MessagesHeatMap timeRange={selectedTimeRange} />*/}
    </>;
};

export default ReportPage;
