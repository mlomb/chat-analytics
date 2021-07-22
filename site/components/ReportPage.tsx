import { useState } from "react";

import { NewAuthor, NewChannel, NewReport } from "../../analyzer/Analyzer";
import Header from "./Header";
import FilterSelect from "./FilterSelect";
import TimeSelector from "./TimeSelector";
import MessagesGraph from "./MessagesGraph";

interface Props {
    report: NewReport
};

const ReportPage = ({ report }: Props) => {
  const [selectedChannels, setSelectedChannels] = useState<NewChannel[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<NewAuthor[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<[Date, Date]>([new Date(), new Date()]);

  console.log("report", report);
  console.log("selection", selectedUsers, selectedChannels);
  console.log("time", selectedTimeRange[0]?.toDateString(), selectedTimeRange[1]?.toDateString());

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

        <TimeSelector onChange={setSelectedTimeRange} />

        <h2>Messages | Words | Emojis</h2>
        <MessagesGraph timeRange={selectedTimeRange} />
  </>;
};


export default ReportPage;
