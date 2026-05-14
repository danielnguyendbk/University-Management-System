import { RouterProvider } from "react-router";
import { AppProviders } from "./providers/AppProviders";
import { appRouter } from "./routes/index";

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={appRouter} />
    </AppProviders>
  );
}
