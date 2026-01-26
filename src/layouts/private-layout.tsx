import { Navigate, Outlet } from "react-router-dom"
import { SideBarComponents } from "../components/sidebar"
import { HeaderComponents } from "../components/header"

export const PrivateLayout = () => {
  const auth = sessionStorage.getItem("auth-storage");
  const token = auth ? JSON.parse(auth).state.token : null;

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <div className="flex h-screen bg-slate-50">
        <SideBarComponents />

        <div className="flex-1 flex flex-col">
          <HeaderComponents />

          <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </>
  )
}