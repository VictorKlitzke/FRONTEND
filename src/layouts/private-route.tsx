import { Outlet } from "react-router-dom"
import { HeaderComponents } from "../components/header"
import { SideBarComponents } from "../components/sidebar"
import { SidebarProvider } from "../components/ui/sidebar"

export const PrivateRoute = () => {
  return (
    <>
      <HeaderComponents />

      <SidebarProvider className="min-h-0">
        <SideBarComponents />
        <main className="w-full ml-6">
          <Outlet />
        </main>
      </SidebarProvider>
    </>
  )
}