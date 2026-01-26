import type { RouteObject } from "react-router-dom";
import { EmpresaPage } from "./pages/empresa-page";

export const EmpresaRoute: RouteObject[] = [
  {
    path: '/empresa/cadastro',
    Component: EmpresaPage
  }
]