import "@assets/styles/Card.less";

import { useState } from "react";
import { BlockDataType, BlockInfo, BlockKey, BlockState } from "@pipeline/aggregate/Blocks";
import Block from "@report/components/Block";

import Spinner from "@assets/images/icons/spinner.svg";

type Title = string | (string | string[])[];

interface Props<K extends BlockKey> {
    num: 1 | 2 | 3;
    title: Title;
    blockKey: K;
    children: (props: { data?: BlockDataType<K>; options: number[] }) => JSX.Element;
}

const Indicators: { [key in BlockState]: string } = {
    loading: "⚙️",
    stale: "⌛",
    error: "❌",
    ready: "✅",
};

const Card = <K extends BlockKey>(props: Props<K>) => {
    const Content = <K extends BlockKey>({ info }: { info: BlockInfo<K> }) => {
        // normalize title, make sure it's an array
        const title = typeof props.title === "string" ? [props.title] : props.title;

        // by default all options are 0
        const [options, setOptions] = useState<number[]>(title.filter((a) => typeof a !== "string").map((_) => 0));

        const elements: JSX.Element[] = [];

        let optionIndex = 0;
        for (const entry of title) {
            if (typeof entry === "string") {
                // raw text
                elements.push(<span key={entry}>{entry}</span>);
            } else {
                // select with options
                let localOptionIndex = optionIndex;
                elements.push(
                    // use first option as key
                    <select
                        key={entry[0]}
                        value={options[localOptionIndex]}
                        onChange={(e) =>
                            setOptions((prev) => {
                                const newOptions = [...prev];
                                newOptions[localOptionIndex] = parseInt(e.target.value);
                                return newOptions;
                            })
                        }
                    >
                        {entry.map((o, i) => (
                            <option key={i} value={i}>
                                {o}
                            </option>
                        ))}
                    </select>
                );
                optionIndex++;
            }
        }

        return (
            <>
                <div className="Card_title">{elements}</div>
                <props.children data={info.data || undefined} options={options} />
                <div className={"Card_overlay" + (info.state === "ready" ? " Card_overlay--hidden" : "")}>
                    <img src={Spinner} alt="Loading" height={60} />
                    {Indicators[info.state]}
                </div>
            </>
        );
    };

    return (
        <div className={"Card Card--" + props.num}>
            <Block blockKey={props.blockKey} children={Content} />
        </div>
    );
};

export default Card;
