import { ColorSet, Container } from "@amcharts/amcharts5";
import { WordCloud as am5WordCloud } from "@amcharts/amcharts5/wc";
import { getDatabase } from "@report/WorkerWrapper";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

interface Props {
    wordsCount?: number[];
}

const createWordCloud = (c: Container) => {
    const db = getDatabase();

    const series = c.root.container.children.push(
        am5WordCloud.new(c.root, {
            minFontSize: 10,
            maxFontSize: 80,
            randomness: 0.7,
            colors: ColorSet.new(c.root, {}),
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

    return (words: number[]) => {
        const data = words
            .map((c, i) => ({
                category: db.words[i],
                value: c,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 100);

        series.data.setAll(data);
    };
};

const WordCloud = (props: Props) => (
    <AmCharts5Chart
        create={createWordCloud}
        data={props.wordsCount}
        style={{
            minHeight: 673,
            marginLeft: 5,
            marginBottom: 8,
        }}
    />
);

export default WordCloud;
