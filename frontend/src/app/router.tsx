import { createBrowserRouter } from "react-router-dom";
import { RequireAuth } from "../components/auth/RequireAuth";
import { EmptyState } from "../components/ui/EmptyState";
import { AdminPaymentPage } from "../pages/AdminPaymentPage";
import { AdminStatsPage } from "../pages/AdminStatsPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { App } from "./App";
import { EventDetailPage } from "../pages/EventDetailPage";
import { EventMatchPage } from "../pages/EventMatchPage";
import { ExploreEventsPage } from "../pages/ExploreEventsPage";
import { LandingPage } from "../pages/LandingPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { PaymentPage } from "../pages/PaymentPage";
import { PaymentResultPage } from "../pages/PaymentResultPage";
import { MyTicketsPage } from "../pages/MyTicketsPage";
import { TicketDetailPage } from "../pages/TicketDetailPage";
import { MyBookingsPage } from "../pages/MyBookingsPage";
import { MyWaitlistPage } from "../pages/MyWaitlistPage";
import { ProfilePage } from "../pages/ProfilePage";
import { OrganizerDashboardPage } from "../pages/OrganizerDashboardPage";
import { CreateEventPage } from "../pages/CreateEventPage";
import { EventTicketsConfigPage } from "../pages/EventTicketsConfigPage";
import { EditEventPage } from "../pages/EditEventPage";
import { CheckInStationPage } from "../pages/CheckInStationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "explore", element: <ExploreEventsPage /> },
      { path: "events/:id", element: <EventDetailPage /> },
      { path: "eventmatch", element: <EventMatchPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "checkout", element: <RequireAuth roles={["CUSTOMER"]}><CheckoutPage /></RequireAuth> },
      { path: "payment", element: <RequireAuth roles={["CUSTOMER"]}><PaymentPage /></RequireAuth> },
      { path: "payment/result", element: <RequireAuth roles={["CUSTOMER"]}><PaymentResultPage /></RequireAuth> },
      // Admin Portal
      { path: "admin", element: <RequireAuth roles={["ADMIN"]}><AdminStatsPage /></RequireAuth> },
      { path: "admin/stats", element: <RequireAuth roles={["ADMIN"]}><AdminStatsPage /></RequireAuth> },
      { path: "admin/users", element: <RequireAuth roles={["ADMIN"]}><AdminUsersPage /></RequireAuth> },
      { path: "admin/payments", element: <RequireAuth roles={["ADMIN"]}><AdminPaymentPage /></RequireAuth> },
      // Customer Portal
      { path: "my-tickets", element: <RequireAuth roles={["CUSTOMER"]}><MyTicketsPage /></RequireAuth> },
      { path: "my-tickets/:ticketId", element: <RequireAuth roles={["CUSTOMER"]}><TicketDetailPage /></RequireAuth> },
      { path: "my-bookings", element: <RequireAuth roles={["CUSTOMER"]}><MyBookingsPage /></RequireAuth> },
      { path: "my-waitlist", element: <RequireAuth roles={["CUSTOMER"]}><MyWaitlistPage /></RequireAuth> },
      { path: "profile", element: <RequireAuth><ProfilePage /></RequireAuth> },
      // Organizer Portal
      { path: "organizer", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><OrganizerDashboardPage /></RequireAuth> },
      { path: "organizer/dashboard", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><OrganizerDashboardPage /></RequireAuth> },
      { path: "organizer/events/new", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><CreateEventPage /></RequireAuth> },
      { path: "organizer/events/:id/tickets", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><EventTicketsConfigPage /></RequireAuth> },
      { path: "organizer/events/:id/edit", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><EditEventPage /></RequireAuth> },
      { path: "organizer/check-in", element: <RequireAuth roles={["ADMIN", "ORGANIZER"]}><CheckInStationPage /></RequireAuth> },
      { path: "*", element: <EmptyState title="Không tìm thấy trang" description="Đường dẫn này không còn tồn tại." actionLabel="Khám phá sự kiện" actionTo="/explore" /> },
    ],
  },
]);
