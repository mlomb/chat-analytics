import Logo from "@assets/images/logo.svg";
import Spinner from "@assets/images/spinner.svg";

interface Props {
    loading: boolean;
}

const LoadingOverlay = (props: Props) => {
    return (
        <div className={`LoadingOverlay ${props.loading ? "" : "LoadingOverlay--hidden"}`}>
            <div className="LoadingOverlay__logo">
                <img src={Logo} alt="chatstbdtbd.app logo" />
            </div>
            <div className="LoadingOverlay__spinner">
                <img src={Spinner} alt="spinner" />
                <div>Decompressing data...</div>
            </div>
        </div>
    );
};

export default LoadingOverlay;
