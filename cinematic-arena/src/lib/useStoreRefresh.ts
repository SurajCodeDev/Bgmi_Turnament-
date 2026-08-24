"use client";

import { useEffect, useSyncExternalStore } from "react";
import { subscribeStore } from "@/lib/store";

export function useStoreRefresh() {
  return useSyncExternalStore(
    subscribeStore,
    () => Date.now(),
    () => 0
  );
}
