import { Bullet, Color, Container, Picture, Root, Theme, p50 } from "@amcharts/amcharts5";
import { BreadcrumbBar, Treemap } from "@amcharts/amcharts5/hierarchy";
import { DomainTreeEntry } from "@pipeline/aggregate/blocks/domains/DomainsStats";
import { useBlockData } from "@report/BlockHook";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const createTreeTheme = (root: Root) => {
    const treeTheme = Theme.new(root);

    for (let depth = 0; depth < 10; depth++) {
        treeTheme.rule("RoundedRectangle", ["hierarchy", "node", "shape", "depth" + depth]).setAll({
            strokeWidth: 2,
            stroke: Color.fromHex(0x232930),
        });
    }

    return treeTheme;
};

const createTreeChart = (c: Container) => {
    let series = c.children.push(
        Treemap.new(c.root, {
            sort: "descending",
            singleBranchOnly: true,
            topDepth: 0, // show TLDs
            initialDepth: 1, // show one depth down
            valueField: "count",
            categoryField: "domain",
            childDataField: "subdomains",
            nodePaddingOuter: 0,
            nodePaddingInner: 0,
            nodePaddingTop: 0,
            nodePaddingBottom: 0,
        })
    );

    //series.get("colors")!.set("step", 1);

    const nav = c.children.unshift(
        BreadcrumbBar.new(c.root, {
            series: series,
        })
    );
    nav.labels.template.setAll({
        fontSize: 20,
        fill: Color.fromHex(0x7ed0ff),
    });

    series.events.on("dataitemselected", ({ dataItem }) => {
        dataItem?._settings.children.forEach((c) => {
            let domain = (c.dataContext as DomainTreeEntry).domain;

            // skip "Other" nodes
            if (domain.includes("Other")) return undefined;

            // if TLD, try to load icon from nic site (nic.us, nic.io, etc.)
            if (domain.startsWith(".") && domain.split(".").length === 2) domain = "nic" + domain;

            // remove front dot
            if (domain.startsWith(".")) domain = domain.substr(1);

            const imageSrc = "https://icons.duckduckgo.com/ip3/" + domain + ".ico";

            (c.bullets![0].get("sprite") as Picture).set("src", imageSrc);
        });
    });

    series.bullets.push(function (root, series, dataItem) {
        const picture = Picture.new(root, {
            centerX: p50,
            centerY: p50,
            width: 32,
            height: 32,
            isMeasured: true,
            dy: -28,
            // we don't have Access-Control-Allow-Origin in icons.duckduckgo.com
            // so request using no-cors mode (Opaque Response)
            cors: null,
        });

        return Bullet.new(root, { sprite: picture });
    });

    return (data: DomainTreeEntry) => {
        series.data.setAll([data]);
        series.set("selectedDataItem", series.dataItems[0]);
    };
};

const DomainsTree = () => (
    <AmCharts5Chart
        /* TreeMap appears to be broken if animations are disabled, wtf? */
        animated={true}
        create={createTreeChart}
        createTheme={createTreeTheme}
        data={useBlockData("domains/stats")?.tree}
        style={{
            minHeight: 681,
            borderBottomLeftRadius: 5,
            borderBottomRightRadius: 5,
        }}
    />
);
export default DomainsTree;
