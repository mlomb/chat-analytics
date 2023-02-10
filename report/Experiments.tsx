import { useBlockData } from "./BlockHooks";
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
    const dataC = useBlockData("c", { id: 5 });

    return <div>c: {JSON.stringify(dataC)}</div>;
};

const Test = () => {
    const dataB = useBlockData("b");

    if (dataB === undefined) return <div>waiting for b</div>;

    return (
        <div>
            b: {JSON.stringify(dataB)}
            <CosoParaId id={dataB.id} />
        </div>
    );
};

export const Experiment = () => {
    return (
        <>
            <LoadingGroup>
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
                <LoadingGroup>
                    <Test />
                </LoadingGroup>
            </LoadingGroup>
        </>
    );
};
