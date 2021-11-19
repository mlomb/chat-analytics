import "@assets/app.less";

import ReactDOM from "react-dom";

import LandingPage from "@app/LandingPage";

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(<LandingPage />, document.getElementById("app"));
});
