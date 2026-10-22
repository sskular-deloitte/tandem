"use client";

import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/components/Icon";

const TABS = [
  { key: "mind", label: "Mind", icon: "psychology_alt", path: "/capture" },
  { key: "shared", label: "Shared", icon: "diversity_1", path: "/app" },
  { key: "checkin", label: "Check-in", icon: "local_cafe", path: "/checkin" },
  { key: "context", label: "Context", icon: "cottage", path: "/onboarding" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {TABS.map((tab) => {
          const active = pathname === tab.path;
          return (
            <button
              key={tab.key}
              className={`bottom-nav-tab ${active ? "active" : ""}`}
              onClick={() =>
                router.push(
                  tab.key === "mind" ? `/capture?n=${Date.now()}` : tab.path
                )
              }
            >
              <Icon name={tab.icon} size={24} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
