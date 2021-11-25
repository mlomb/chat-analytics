interface Props {
    blob: Blob | null;
}

const ViewDownloadReport = (props: Props) => {
    console.log(props.blob);

    return <div className="ViewDownloadReport">asdsdadasd</div>;
};

export default ViewDownloadReport;
