import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { plausible } from "@assets/Plausible";

import HomePage from "@app/HomePage";

createRoot(document.getElementById("app") as HTMLElement).render(
    <StrictMode>
        <HomePage />
    </StrictMode>
);

console.log(env);

plausible("pageview");
