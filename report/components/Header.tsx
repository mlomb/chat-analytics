import "@assets/styles/Header.less";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";

import { matchFormat } from "@pipeline/Text";
import { Database, Index } from "@pipeline/Types";
import { useDataProvider } from "@report/DataProvider";

import { ChannelLabel } from "@report/components/core/Labels";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import FilterSelect, { FilterOption } from "@report/components/FilterSelect";
import { TabSwitch } from "@report/components/Tabs";
import TimeSelector from "@report/components/TimeSelector";
import { Section } from "@report/ReportPage";

import Logo from "@assets/images/logos/app_dark.svg";

interface Props {
    section: string;
    setSection: (tab: string) => void;
    sections: Section[];
}

const channelsFilterOptionsFn: (db: Database) => FilterOption[] = (db) => [
    {
        name: "Select all channels",
        options: db.channels
            .map((c, i) => [c.msgCount, i])
            .sort((a, b) => b[0] - a[0])
            .map((c) => c[1]),
    },
];

const authorsFilterOptionsFn: (db: Database) => FilterOption[] = (db) => {
    const botsPresent = db.authorsBotCutoff >= 0;
    const options: FilterOption[] = [
        {
            name: "Select all authors" + (botsPresent ? "  (🧍➕🤖)" : ""),
            options: db.authorsOrder,
        },
    ];
    if (botsPresent) {
        options.push(
            {
                name: "Select all non-bot authors (🧍)",
                options: db.authorsOrder.slice(0, db.authorsBotCutoff),
            },
            {
                name: "Select all bot authors (🤖)",
                options: db.authorsOrder.slice(db.authorsBotCutoff),
            }
        );
    }
    return options;
};

const Header = (props: Props) => {
    const { sections, section, setSection } = props;
    const dataProvider = useDataProvider();

    const channelsFilterOptions = useMemo(() => channelsFilterOptionsFn(dataProvider.database), [dataProvider]);
    const authorsFilterOptions = useMemo(() => authorsFilterOptionsFn(dataProvider.database), [dataProvider]);

    const [selectedChannels, setSelectedChannels] = useState<Index[]>(channelsFilterOptions[0].options);
    const [selectedAuthors, setSelectedAuthors] = useState<Index[]>(authorsFilterOptions[0].options);

    useLayoutEffect(() => dataProvider.updateAuthors(selectedAuthors), [selectedAuthors]);
    useLayoutEffect(() => dataProvider.updateChannels(selectedChannels), [selectedChannels]);

    const filterChannels = useCallback(
        (_term: string) => {
            const term = matchFormat(_term);
            return channelsFilterOptions[0].options.filter((i) => dataProvider.formatCache.channels[i].includes(term));
        },
        [dataProvider]
    );
    const filterAuthors = useCallback(
        (_term: string) => {
            const term = matchFormat(_term);
            return authorsFilterOptions[0].options.filter((i) => dataProvider.formatCache.authors[i].includes(term));
        },
        [dataProvider]
    );

    return (
        <div className="Header">
            <header className="Header__info">
                <span className="Header__title">
                    <h1>{dataProvider.database.title}</h1>
                    <h2>chat analysis report</h2>
                </span>
                <div className="Header__link">
                    <a href="https://chatanalytics.app?utm_source=report" target="_blank">
                        <img src={Logo} alt="chatanalytics.app logo" height="60" />
                    </a>
                </div>
            </header>
            <div className="Filters">
                <div className="Filters__Filter">
                    <label htmlFor="channels">Channels</label>
                    <FilterSelect
                        options={channelsFilterOptions[0].options}
                        isDisabled={channelsFilterOptions[0].options.length < 2}
                        placeholder="Select channels..."
                        selected={selectedChannels}
                        onChange={setSelectedChannels}
                        optionColorHue={266}
                        itemComponent={ChannelLabel}
                        filterOptions={channelsFilterOptions}
                        filterSearch={filterChannels}
                    />
                </div>
                <div className="Filters__Filter">
                    <label htmlFor="authors">Authors</label>
                    <FilterSelect
                        options={authorsFilterOptions[0].options}
                        isDisabled={authorsFilterOptions[0].options.length < 2}
                        placeholder="Select authors..."
                        selected={selectedAuthors}
                        onChange={setSelectedAuthors}
                        optionColorHue={240}
                        itemComponent={AuthorLabel}
                        filterOptions={authorsFilterOptions}
                        filterSearch={filterAuthors}
                    />
                </div>
                <div className="Filters__Filter" style={{ minWidth: "100%" }}>
                    <label htmlFor="authors">Time</label>
                    <TimeSelector />
                </div>
            </div>
            <nav className="Header__Tabs" role="tablist">
                {sections.map((t) => (
                    <TabSwitch
                        key={t.value}
                        currentValue={section}
                        onChange={setSection}
                        value={t.value}
                        children={t.name}
                    />
                ))}
            </nav>
        </div>
    );
};

export default Header;
