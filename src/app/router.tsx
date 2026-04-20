import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./routes/Layout";
import { CreateListing } from "./routes/CreateListing";
import { ListingHistory } from "./routes/ListingHistory";

export const router = createBrowserRouter([
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
    ],
  },
]);
