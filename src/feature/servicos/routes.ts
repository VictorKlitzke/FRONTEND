import type { RouteObject } from "react-router-dom";
import { ServicosPage } from "./pages/servicos-page";

export const ServicosRoute: RouteObject[] = [
    {
        path: "/servicos",
        Component: ServicosPage
    }
]