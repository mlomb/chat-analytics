import { Bullet, Color, Container, Picture, Root, Theme, object, p50, percent } from "@amcharts/amcharts5";
import { BreadcrumbBar, Treemap } from "@amcharts/amcharts5/hierarchy";
import { DomainTreeEntry } from "@pipeline/aggregate/blocks/domains/DomainsStats";
import { useBlockData } from "@report/BlockHook";
import { AmCharts5Chart } from "@report/components/viz/amcharts/AmCharts5Chart";

const createTreeTheme = (root: Root) => {
    const treeTheme = Theme.new(root);

    treeTheme.rule("RoundedRectangle", ["hierarchy", "node", "shape", "depth1"]).setAll({
        strokeWidth: 2,
        stroke: Color.fromHex(0x393f44),
    });

    treeTheme.rule("Label", ["node", "depth1"]).setAll({
        centerY: 32,
    });

    /*
    treeTheme.rule("RoundedRectangle", ["hierarchy", "node", "shape", "depth1"]).setAll({
        strokeWidth: 2,
    });

    treeTheme.rule("RoundedRectangle", ["hierarchy", "node", "shape", "depth2"]).setAll({
        fillOpacity: 0,
        strokeWidth: 1,
        strokeOpacity: 0.2,
    });

    treeTheme.rule("Label", ["node", "depth1"]).setAll({
        forceHidden: true,
    });

    treeTheme.rule("Label", ["node", "depth2"]).setAll({
        fontSize: 10,
    });
    */

    return treeTheme;
};

const createChart = (c: Container) => {
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
        })
    );

    //series.get("colors")!.set("step", 1);

    c.children.moveValue(
        BreadcrumbBar.new(c.root, {
            series: series,
        }),
        0
    );

    series.bullets.push(function (root, series, dataItem) {
        let depth = dataItem.get("depth");

        console.log(depth);

        let domain = (dataItem.dataContext as DomainTreeEntry).domain;

        // skip "Other" nodes
        if (domain.includes("Other")) return undefined;

        // if TLD, try to load icon from nic site (nic.us, nic.io, etc.)
        if (domain.startsWith(".") && domain.split(".").length === 2) domain = "nic" + domain;

        // remove front dot
        if (domain.startsWith(".")) domain = domain.substr(1);

        let picture = Picture.new(root, {
            src: "https://icons.duckduckgo.com/ip3/" + domain + ".ico",
            centerX: p50,
            centerY: p50,
            width: 32,
            height: 32,
            isMeasured: true,
            dy: -28,
        });

        // picture.states.lookup("default")!.setAll({ forceHidden: true });

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
        create={createChart}
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
