"use client";

import { useSyncExternalStore } from "react";
import {
  type AccentSelection,
  getAccentSelection,
  subscribeAccent,
} from "./accent";

const getServerSelection = () => null;

/** The current accent selection, live across every mounted control. */
export function useAccentSelection(): AccentSelection | null {
  return useSyncExternalStore(subscribeAccent, getAccentSelection, getServerSelection);
}
