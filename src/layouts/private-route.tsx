import { Outlet } from "react-router-dom"
import { HeaderComponents } from "../components/header"
import { SideBarComponents } from "../components/sidebar"
import { SidebarProvider } from "../components/ui/sidebar"

export const PrivateRoute = () => {
  return (
    <SidebarProvider className="min-h-0">
      <SideBarComponents />
      <div className="flex w-full flex-col">
        <HeaderComponents />
        <main className="w-full flex-1 px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}