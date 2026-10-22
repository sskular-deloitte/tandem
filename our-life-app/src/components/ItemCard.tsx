"use client";

import type { Item } from "@/lib/types";
import { Icon } from "@/components/Icon";

const PILL_CLASS: Record<Item["state"], string> = {
  on_my_mind: "pill-onmymind",
  shared: "pill-shared",
  needs_agreement: "pill-needs",
  agreed: "pill-agreed",
  resolved: "pill-resolved",
};

const PILL_LABEL: Record<Item["state"], string> = {
  on_my_mind: "On my mind",
  shared: "Shared",
  needs_agreement: "Needs agreement",
  agreed: "Agreed",
  resolved: "Resolved",
};

export function ItemCard({
  item,
  onClick,
  justAdded,
}: {
  item: Item;
  onClick?: () => void;
  justAdded?: boolean;
}) {
  const outcome = item.ai?.outcome ?? item.text;
  const secondary =
    item.state === "resolved"
      ? item.resolutionNote ?? ""
      : item.ai?.nextStep ?? "";

  return (
    <div
      className={`card item-card ${justAdded ? "flash" : ""}`}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div>
        <div className="item-outcome">{outcome}</div>
        {secondary && <div className="item-next">{secondary}</div>}
      </div>
      <span className={`pill ${PILL_CLASS[item.state]}`}>
        {PILL_LABEL[item.state]}
        {item.state === "resolved" && <Icon name="check" size={13} />}
      </span>
    </div>
  );
}
