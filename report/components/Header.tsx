import { CSSProperties, useCallback, useLayoutEffect, useMemo, useState } from "react";

import { Index } from "@pipeline/Types";
import { Database } from "@pipeline/process/Types";
import { matchFormat } from "@pipeline/process/nlp/Text";
import { Section } from "@report/ReportPage";
import { getDatabase, getFormatCache, getWorker } from "@report/WorkerWrapper";
import FilterSelect, { FilterOption } from "@report/components/FilterSelect";
import { TabSwitch } from "@report/components/Tabs";
import TimeSelector from "@report/components/TimeSelector";
import { Title } from "@report/components/Title";
import { AuthorLabel } from "@report/components/core/labels/AuthorLabel";
import { ChannelLabel } from "@report/components/core/labels/ChannelLabel";
import { GuildLabel } from "@report/components/core/labels/GuildLabel";

import Logo from "@assets/images/logos/app_dark.svg";
import "@assets/styles/Header.less";

interface Props {
    section: string;
    setSection: (tab: string) => void;
    sections: Section[];
}

const channelsFilterOptionsFn: (db: Database) => FilterOption[] = (db) => {
    const options: FilterOption[] = [
        {
            name: "Select all channels",
            options: db.channels.map((_, i) => i),
        },
    ];

    // let users filter channels by guild
    if (db.guilds.length >= 2) {
        for (let index = 0; index < db.guilds.length; index++) {
            options.push({
                name: (
                    <div style={{ display: "flex", whiteSpace: "nowrap", alignItems: "center", gap: 6 }}>
                        Select only channels in
                        <div
                            className="FilterSelect__option-list FilterSelect__option-list--selected"
                            style={{ "--hue": 0 } as CSSProperties}
                        >
                            <GuildLabel index={index} />
                        </div>
                    </div>
                ),
                options: db.channels
                    .map((c, i) => [c.guildIndex, i])
                    .filter((c) => c[0] === index)
                    .map((c) => c[1]),
            });
        }
    }

    return options;
};

const authorsFilterOptionsFn: (db: Database) => FilterOption[] = (db) => {
    const botsPresent = db.authors.some((a) => a.b);
    const options: FilterOption[] = [
        {
            name: "Select all authors" + (botsPresent ? "  (🧍➕🤖)" : ""),
            options: db.authors.map((_, i) => i),
        },
    ];
    if (botsPresent) {
        const allIndexes = new Array(db.authors.length).fill(0).map((_, i) => i);
        options.push(
            {
                name: "Select only non-bot authors (🧍)",
                options: allIndexes.filter((i) => db.authors[i].b !== true),
            },
            {
                name: "Select only bot authors (🤖)",
                options: allIndexes.filter((i) => db.authors[i].b === true),
            }
        );
    }
    return options;
};

const Header = (props: Props) => {
    const { sections, section, setSection } = props;
    const database = getDatabase();
    const formatCache = getFormatCache();
    const worker = getWorker();

    const channelsFilterOptions = useMemo(() => channelsFilterOptionsFn(database), [database]);
    const authorsFilterOptions = useMemo(() => authorsFilterOptionsFn(database), [database]);

    const [selectedChannels, setSelectedChannels] = useState<Index[]>(channelsFilterOptions[0].options);
    const [selectedAuthors, setSelectedAuthors] = useState<Index[]>(authorsFilterOptions[0].options);

    useLayoutEffect(() => worker.updateAuthors(selectedAuthors), [selectedAuthors]);
    useLayoutEffect(() => worker.updateChannels(selectedChannels), [selectedChannels]);

    const filterChannels = useCallback(
        (_term: string) => {
            const term = matchFormat(_term);
            return channelsFilterOptions[0].options.filter((i) => formatCache.channels[i].includes(term));
        },
        [formatCache]
    );
    const filterAuthors = useCallback(
        (_term: string) => {
            const term = matchFormat(_term);
            return authorsFilterOptions[0].options.filter((i) => formatCache.authors[i].includes(term));
        },
        [formatCache]
    );

    return (
        <div className="Header">
            <header className="Header__info">
                <span className="Header__title">
                    <h1>
                        <Title />
                    </h1>
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
