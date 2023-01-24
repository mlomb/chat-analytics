import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { HomePage } from "@app/HomePage";

import { plausible } from "@assets/Plausible";

createRoot(document.getElementById("app") as HTMLElement).render(
    <StrictMode>
        <HomePage />
    </StrictMode>
);

console.log(env);

plausible("pageview");
