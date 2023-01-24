import "@assets/styles/Button.less";

type Props = {
    hueColor: [number, number, number];
} & (React.AnchorHTMLAttributes<HTMLAnchorElement> | React.ButtonHTMLAttributes<HTMLButtonElement>);

export const Button = ({ hueColor, className, style, ...rest }: Props) => {
    const [h, s, l] = hueColor;

    const cssStyles = {
        "--default-color": `hsl(${h}, ${s}%, ${l}%)`,
        "--hover-color": `hsl(${h}, ${s}%, ${l - 5}%)`,
        "--disable-color": `hsl(${h}, 0%, ${l}%)`,
        ...style,
    } as React.CSSProperties;

    const classes = `Button ${className}`;

    return "href" in rest ? (
        <a className={classes} style={cssStyles} {...rest} />
    ) : (
        // @ts-ignore
        <button className={classes} style={cssStyles} {...rest} />
    );
};
