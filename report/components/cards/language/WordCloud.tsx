import { useLayoutEffect, useRef } from "react";

import { ColorSet, Root } from "@amcharts/amcharts5";
import { WordCloud as am5WordCloud } from "@amcharts/amcharts5/wc";
import { getDatabase } from "@report/WorkerWrapper";

import { Themes, enableDebouncedResize } from "../../viz/amcharts/AmCharts5";

interface Props {
    wordsCount: number[];
}

const WordCloud = (props: Props) => {
    const db = getDatabase();
    const chartDiv = useRef<HTMLDivElement>(null);
    const seriesRef = useRef<am5WordCloud | null>(null);

    useLayoutEffect(() => {
        const root = Root.new(chartDiv.current!);
        root.setThemes(Themes(root, false));
        const cleanupDebounce = enableDebouncedResize(root);

        seriesRef.current = root.container.children.push(
            am5WordCloud.new(root, {
                minFontSize: 10,
                maxFontSize: 80,
                randomness: 0.7,
                colors: ColorSet.new(root, {}),
                paddingBottom: 10,
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                marginBottom: 0,
                marginLeft: 0,
                marginRight: 0,
                marginTop: 0,
            })
        );

        return () => {
            seriesRef.current = null;
            cleanupDebounce();
            root.dispose();
        };
    }, []);

    useLayoutEffect(() => {
        const data = props.wordsCount
            .map((c, i) => ({
                category: db.words[i],
                value: c,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100);

        seriesRef.current?.data.setAll(data);
    }, [props.wordsCount]);

    return (
        <div
            ref={chartDiv}
            style={{
                minHeight: 673,
                marginLeft: 5,
                marginBottom: 8,
            }}
        />
    );
};

export default WordCloud;
