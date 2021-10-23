import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";

export const Themes = (root: any, animated: boolean) => 
    animated ? [am5themes_Animated.new(root), am5themes_Dark.new(root)]
             : [am5themes_Dark.new(root)];
