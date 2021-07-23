import { useLayoutEffect, useRef } from "react";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4plugins_wordCloud from "@amcharts/amcharts4/plugins/wordCloud"; 

import { dataProvider } from "../DataProvider";

const WordCloudGraph = () => {
    const chartDiv = useRef<HTMLDivElement>(null);
    const chart = useRef<am4plugins_wordCloud.WordCloud | null>(null);

    useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4plugins_wordCloud.WordCloud);

        let series = x.series.push(new am4plugins_wordCloud.WordCloudSeries());
        series.dataFields.word = "word";
        series.dataFields.value = "count";

        const onDataUpdated = () => {
            x.data = dataProvider.getWordsData();
        };
        onDataUpdated();
        dataProvider.on('updated-data', onDataUpdated);

        chart.current = x;
        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            x.dispose();
        };
    }, []);

    return <div ref={chartDiv} style={{ width: "100%", height: "500px" }}></div>;
};

export default WordCloudGraph;
