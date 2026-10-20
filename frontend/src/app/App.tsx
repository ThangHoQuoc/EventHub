import { Outlet, useLocation } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { AuthProvider } from "../context/AuthContext";

export function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const isCheckoutPage = location.pathname.startsWith("/checkout") || location.pathname.startsWith("/payment");
  const isEditorialPage =
    location.pathname === "/" ||
    location.pathname === "/explore" ||
    location.pathname.startsWith("/events/") ||
    location.pathname === "/eventmatch" ||
    location.pathname.startsWith("/my-") ||
    location.pathname === "/profile" ||
    location.pathname.startsWith("/organizer");

  return (
    <AuthProvider>
      <div className={`app-shell ${isEditorialPage ? "app-shell-editorial" : ""} ${isCheckoutPage ? "app-shell-checkout" : ""}`}>
        {!isAuthPage && !isCheckoutPage ? <Header editorial={isEditorialPage} /> : null}
        {isCheckoutPage ? <Outlet /> : <main><Outlet /></main>}
        {!isAuthPage && !isCheckoutPage ? <Footer editorial={isEditorialPage} /> : null}
      </div>
    </AuthProvider>
  );
}
