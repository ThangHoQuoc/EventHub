import { createBrowserRouter } from "react-router-dom";
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
      { path: "checkout", element: <CheckoutPage /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "payment/result", element: <PaymentResultPage /> },
      // Customer Portal (Phần 2)
      { path: "my-tickets", element: <MyTicketsPage /> },
      { path: "my-tickets/:ticketId", element: <TicketDetailPage /> },
      { path: "my-bookings", element: <MyBookingsPage /> },
      { path: "my-waitlist", element: <MyWaitlistPage /> },
      { path: "profile", element: <ProfilePage /> },
      // Organizer Portal (Phần 3)
      { path: "organizer", element: <OrganizerDashboardPage /> },
      { path: "organizer/dashboard", element: <OrganizerDashboardPage /> },
      { path: "organizer/events/new", element: <CreateEventPage /> },
      { path: "organizer/events/:id/tickets", element: <EventTicketsConfigPage /> },
      { path: "organizer/events/:id/edit", element: <EditEventPage /> },
      { path: "organizer/check-in", element: <CheckInStationPage /> },
    ],
  },
]);

