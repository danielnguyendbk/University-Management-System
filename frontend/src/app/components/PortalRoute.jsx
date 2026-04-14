import { Root } from "./Root";
import { RequireAuth } from "./RequireAuth";

export function PortalRoute() {
  return (
    <RequireAuth>
      <Root />
    </RequireAuth>
  );
}