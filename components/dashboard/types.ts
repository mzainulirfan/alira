import type { IconSvgElement } from "@hugeicons/react";

export type ActivityType = "payment" | "reading" | "customer" | "expense";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  time: string;
  href: string;
  badge?: string;
};

export type QuickActionItem = {
  key: string;
  label: string;
  description: string;
  href: string;
  icon: IconSvgElement;
};