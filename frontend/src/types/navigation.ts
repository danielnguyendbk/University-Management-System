import type { ComponentType } from "react";

import type { UserRole } from "./auth";

export interface NavigationItem {
  icon: ComponentType<{ className?: string }>;
  label: string;
  path: string;
  badge?: string;
}

export type NavigationByRole = Record<UserRole, NavigationItem[]>;
