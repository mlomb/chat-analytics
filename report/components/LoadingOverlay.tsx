import Logo from "@assets/images/logos/app.svg";
import Spinner from "@assets/images/icons/spinner.svg";

interface Props {
    loading: boolean;
}

const LoadingOverlay = (props: Props) => (
    <div className={`LoadingOverlay ${props.loading ? "" : "LoadingOverlay--hidden"}`}>
        <div className="LoadingOverlay__logo">
            <img src={Logo} alt="chatanalytics.app logo" />
        </div>
        <div className="LoadingOverlay__spinner">
            <img src={Spinner} alt="spinner" />
            <div>Decompressing data...</div>
        </div>
    </div>
);

export default LoadingOverlay;
