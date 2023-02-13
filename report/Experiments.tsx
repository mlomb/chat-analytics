import { useBlockData } from "./BlockHook";
import { LoadingGroup } from "./components/LoadingGroup";

const Card = (props: any) => {
    const data = useBlockData(props.blockKey);

    return (
        <div>
            {props.blockKey}: {JSON.stringify(data)}
        </div>
    );
};

const CosoParaId = (props: any) => {
    const dataC = useBlockData("word-stats", { word: 5 });

    return <div>c: {JSON.stringify(dataC)}</div>;
};

const Test = () => {
    const dataB = useBlockData("b");

    if (dataB === undefined) return <div>waiting for b</div>;

    return (
        <div>
            b: {JSON.stringify(dataB)}
            <CosoParaId id={5} />
        </div>
    );
};

export const Experiment = () => {
    return (
        <>
            <LoadingGroup>
                <Card blockKey="a" />
                <Card blockKey="a" />
            </LoadingGroup>
            <LoadingGroup>
                <Card blockKey="b" />
            </LoadingGroup>
            <LoadingGroup>
                <Card blockKey="a" />
            </LoadingGroup>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <LoadingGroup>
                <Card blockKey="a" />
                <Card blockKey="b" />
                <Card blockKey="c" />
                <Card blockKey="d" />
                <LoadingGroup>
                    <Test />
                </LoadingGroup>
            </LoadingGroup>
        </>
    );
};
