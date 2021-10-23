import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import am5themes_Responsive from "@amcharts/amcharts5/themes/Responsive";

export const Themes = (root: any) => [
    am5themes_Animated.new(root),
    am5themes_Dark.new(root),
    //am5themes_Responsive.new(root)
];
