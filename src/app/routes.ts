import { createBrowserRouter } from "react-router-dom";
import { DashboardRoute } from "../feature/dashboard/route";
import { EmpresaRoute } from "../feature/empresa/route";
import { AuthRoute } from "../feature/auth/route";
import { PrivateLayout } from "../layouts/private-layout";
import { ProfissionaisRoute } from "../feature/profissionais/route";
import { ServicosRoute } from "@/feature/servicos/routes";

export const router = createBrowserRouter([

  ...AuthRoute,
  ...EmpresaRoute,

  {
    path: "/",
    Component: PrivateLayout,
    children: [
      ...DashboardRoute,
      ...ProfissionaisRoute,
      ...ServicosRoute,
    ],
  },
]);
