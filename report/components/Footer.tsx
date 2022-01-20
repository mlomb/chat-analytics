import "@assets/styles/Footer.less";

import GitHub from "@assets/images/logos/github.svg";

export default () => {
    return (
        <div className="Footer">
            <span>Generated with</span>
            <a href="https://chatstbdtbd.app" target="_blank">
                https://chatstbdtbd.app
            </a>
            <span>•</span>
            <a href="https://github.com" target="_blank">
                <img src={GitHub} alt="GitHub" />
            </a>
            <span className="Footer__build" title={env.build.date}>
                build {env.build.hash}
            </span>
            <br />
        </div>
    );
};
