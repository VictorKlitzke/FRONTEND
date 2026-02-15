import { createBrowserRouter } from "react-router-dom";
import { DashboardRoute } from "../feature/dashboard/route";
import { EmpresaRoute } from "../feature/empresa/route";
import { AuthRoute } from "../feature/auth/route";
import { PrivateLayout } from "../layouts/private-layout";
import { ProductRoute } from "@/feature/product/route";
import { StockMovementRoute } from "@/feature/stockmovement/route";
import { ClientRoutes } from "@/feature/client/route";
import { ServiceRoute } from "@/feature/service/route";
import { ProfissionaisRoute } from "@/feature/profissional/route";
import { AppointmentPublicRoute, AppointmentRoute } from "@/feature/appointment/route";
import { PermissionsRoute } from "@/feature/permissions/route";
import { ConfigRoute } from "@/feature/config/route";
import { CaseRoute } from "@/feature/case/route";

export const router = createBrowserRouter([

  ...AuthRoute,
  ...EmpresaRoute,
  ...AppointmentPublicRoute,


  {
    path: "/",
    Component: PrivateLayout,
    children: [
      ...DashboardRoute,
      ...ProfissionaisRoute,
      ...ServiceRoute,
      ...ProductRoute,
      ...ClientRoutes,
      ...StockMovementRoute,
      ...AppointmentRoute,
      ...CaseRoute,
      ...PermissionsRoute,
      ...ConfigRoute,
    ],
  },
]);
