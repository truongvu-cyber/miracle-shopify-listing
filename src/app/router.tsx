import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./routes/Layout";
import { CreateListing } from "./routes/CreateListing";
import { ListingHistory } from "./routes/ListingHistory";
import { Login } from "./routes/Login";
import { UserManagement } from "./routes/UserManagement";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <CreateListing />,
      },
      {
        path: "history",
        element: <ListingHistory />,
      },
      {
        path: "users",
        element: <UserManagement />,
      },
    ],
  },
]);
