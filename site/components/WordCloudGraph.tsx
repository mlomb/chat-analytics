import { useLayoutEffect, useRef } from "react";

import { dataProvider } from "../DataProvider";

interface Props {
    getData: "getWordsData" | "getEmojisData";
}

const WordCloudGraph = (props: Props) => {
    const chartDiv = useRef<HTMLDivElement>(null);
    /*const chart = useRef<am4plugins_wordCloud.WordCloud | null>(null);

    /*useLayoutEffect(() => {
        let x = am4core.create(chartDiv.current!, am4plugins_wordCloud.WordCloud);

        let series = x.series.push(new am4plugins_wordCloud.WordCloudSeries());
        series.dataFields.word = "value";
        series.dataFields.value = "count";
        series.angles = [0];
        series.rotationThreshold = 0;
        series.randomness = 0;

        const onDataUpdated = () => x.data = dataProvider[props.getData]();
        onDataUpdated();
        dataProvider.on('updated-data', onDataUpdated);

        chart.current = x;
        return () => {
            dataProvider.off('updated-data', onDataUpdated);
            x.dispose();
        };
    }, [props.getData]);*/

    return <div ref={chartDiv} style={{ width: "100%", height: "500px" }}></div>;
};

export default WordCloudGraph;
