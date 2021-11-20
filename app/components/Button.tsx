import { ReactNode } from "react";
import { Interpolation } from "@emotion/serialize";
import { css } from "@emotion/react";

interface Props {
    cssStack?: Interpolation<any>;
    color: [number, number, number];
    children: ReactNode;
    href?: string;
    onClick?: () => void;
}

const ButtonBaseStyle = css`
    display: inline-flex;
    align-items: center;
    padding: 0 24px;
    font-family: inherit;
    font-weight: 500;
    border: 0;
    appearance: none;
    border-radius: 6px;
    color: #fff;
    height: 50px;
    padding: 0 30px;
    font-size: 14px;
    text-decoration: none;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    white-space: nowrap;

    img {
        width: 2rem;
        height: 2rem;
        margin-right: 8px;
    }
`;

const Button = (props: Props) => {
    const cssStyles = [
        ButtonBaseStyle,
        css`
            background-color: hsl(${props.color[0]}, ${props.color[1]}%, ${props.color[2]}%);
            &:hover {
                background-color: hsl(${props.color[0]}, ${props.color[1]}%, ${props.color[2] - 5}%);
            }
        `,
        props.cssStack,
    ];

    return props.href ? (
        <a href={props.href} css={cssStyles} children={props.children} />
    ) : (
        <button onClick={props.onClick} css={cssStyles} children={props.children} />
    );
};

export default Button;
