import type { ComponentType } from "react";

export type AllocationStatus = "ok" | "unassigned" | "conflict";
export type ConflictSeverity = "high" | "medium" | "low";
export type ConflictType = "room" | "lecturer" | "capacity";

export interface AllocationItem {
  id: string;
  name: string;
  students: number;
  reqRoom: string;
  assigned: string;
  capacity: number;
  day: string;
  slot: string;
  status: AllocationStatus;
}

export interface ConflictItem {
  id: number;
  type: ConflictType;
  severity: ConflictSeverity;
  room: string;
  day: string;
  slot: string;
  section1: string;
  section2: string;
  desc: string;
}

export interface SeverityConfig {
  label: string;
  className: string;
  icon: ComponentType<{ className?: string }>;
}

export interface ConflictTypeConfig {
  label: string;
  color: string;
}
