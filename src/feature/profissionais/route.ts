import type { RouteObject } from "react-router-dom";
import { ProfissionaisPage } from "./page/profissionais-page";

export const ProfissionaisRoute: RouteObject[] = [
    {
        path: "/profissionais",
        Component: ProfissionaisPage,
    },
];
