import { ReactElement, useState } from "react";

import { BlockData, BlockKey } from "@pipeline/aggregate/Blocks";
import { useBlockData } from "@report/BlockHook";
import { BlockState } from "@report/BlockStore";
import ErrorBoundary from "@report/components/ErrorBoundary";
import { LoadingGroup } from "@report/components/LoadingGroup";
import { Tooltip } from "@report/components/core/Tooltip";

import InfoIcon from "@assets/images/icons/info.svg";
import "@assets/styles/Card.less";

type Title = string | (string | string[])[];

interface Props<K extends BlockKey> {
    num: 1 | 2 | 3;
    title: Title;
    defaultOptions?: number[];
    blockKey: K;
    children: (props: { data?: BlockData<K>; options: number[] }) => JSX.Element;
    tooltip?: ReactElement | string;
}

const Card = <K extends BlockKey>(props: Props<K>) => {
    const Content = (pp: { state: BlockState }) => {
        const { state } = pp;

        // normalize title, make sure it's an array
        const title = typeof props.title === "string" ? [props.title] : props.title;

        // by default all options are 0
        const [options, setOptions] = useState<number[]>(
            props.defaultOptions || title.filter((a) => typeof a !== "string").map((_) => 0)
        );

        const elements: JSX.Element[] = [];

        let optionIndex = 0;
        for (const entry of title) {
            if (typeof entry === "string") {
                // raw text
                elements.push(<span key={entry}>{entry}</span>);
            } else {
                // select with options
                const localOptionIndex = optionIndex;
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

        const data = useBlockData<K>(props.blockKey);

        return (
            <>
                <ErrorBoundary>
                    <div
                        className={
                            "Card__overlay" +
                            (state === "ready"
                                ? " Card__overlay--hidden"
                                : state === "error"
                                ? " Card__overlay--error"
                                : "")
                        }
                    ></div>
                    {state === "error" && (
                        <div className="Card__error">Error occurred, please check the console for more details</div>
                    )}
                    <div className={"Card__title Card__title--" + state}>
                        {elements}
                        {props.tooltip ? (
                            <Tooltip
                                content={props.tooltip}
                                children={<img src={InfoIcon} height={16} style={{ marginTop: 2 }} />}
                            />
                        ) : null}
                    </div>
                    <div className={state === "ready" ? "" : "Card__gray"}>
                        <props.children data={data || undefined} options={options} />
                    </div>
                </ErrorBoundary>
            </>
        );
    };

    return (
        <div className={"Card Card--" + props.num}>
            <LoadingGroup children={(state) => <Content state={state} />} />
        </div>
    );
};

export default Card;
