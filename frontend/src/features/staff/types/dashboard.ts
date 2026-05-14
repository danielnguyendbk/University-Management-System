import type { ComponentType } from "react";

export type SectionStatus = "assigned" | "pending" | "conflict";

export interface StaffStatItem {
  title: string;
  value: string;
  sub: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  text: string;
}

export interface StaffQuickAction {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}

export interface RecentSection {
  id: string;
  name: string;
  credits: number;
  students: number;
  room: string;
  day: string;
  slot: string;
  status: SectionStatus;
}
