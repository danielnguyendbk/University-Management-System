import { Root } from "./Root";
import { RequireAuth } from "./RequireAuth";
import { RequireRole } from "./RequireRole";

export function StudentPortalRoute() {
  return (
    <RequireAuth>
      <RequireRole role="STUDENT">
        <Root />
      </RequireRole>
    </RequireAuth>
  );
}

export function LecturerPortalRoute() {
  return (
    <RequireAuth>
      <RequireRole role="LECTURER">
        <Root />
      </RequireRole>
    </RequireAuth>
  );
}

export function AdminPortalRoute() {
  return (
    <RequireAuth>
      <RequireRole role="ADMIN">
        <Root />
      </RequireRole>
    </RequireAuth>
  );
}