import { StrictMode } from "react";
import ReactDOM from "react-dom";

import HomePage from "@app/HomePage";

ReactDOM.render(
    <StrictMode>
        <HomePage />
    </StrictMode>,
    document.getElementById("app")
);

console.log(env);
