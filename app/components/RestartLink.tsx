import Refresh from "@assets/images/icons/refresh.svg";

interface Props {
    text: string;
}

export const RestartLink = ({ text }: Props) => (
    <a href="/" className="RestartLink">
        <img src={Refresh} alt="Refresh" />
        {text}
    </a>
);
