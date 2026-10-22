"use client";

import { useEffect, useState } from "react";
import type { UserId } from "./types";

const KEY = "our-life:identity";

export function useIdentity() {
  const [userId, setUserIdState] = useState<UserId | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(KEY) as UserId | null;
    setUserIdState(stored);
    setLoaded(true);
  }, []);

  function setUserId(id: UserId) {
    sessionStorage.setItem(KEY, id);
    setUserIdState(id);
  }

  function clearUserId() {
    sessionStorage.removeItem(KEY);
    setUserIdState(null);
  }

  return { userId, setUserId, clearUserId, loaded };
}
