import "@assets/app.less";

import ReactDOM from "react-dom";

import HomePage from "@app/HomePage";

document.addEventListener("DOMContentLoaded", () => {
    ReactDOM.render(<HomePage />, document.getElementById("app"));
});
