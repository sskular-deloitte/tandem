"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useIdentity } from "@/lib/useIdentity";
import { fetchItems, respondToItem, resolveItem } from "@/lib/api";
import type { Item, OwnershipResponse } from "@/lib/types";
import { useToast } from "@/components/Toast";
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

function promptFor(item: Item): string {
  if (item.state === "needs_agreement") return "What needs a decision this week?";
  if (item.state === "agreed") return "Here's what's in motion.";
  if (item.state === "resolved") return "A small win to celebrate.";
  return "Taking stock.";
}

type AnimState = "idle" | "out" | "in";

export default function CheckinPage() {
  const router = useRouter();
  const { userId, loaded } = useIdentity();
  const toast = useToast();

  const [queue, setQueue] = useState<Item[]>([]);
  const [index, setIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(0);
  const [anim, setAnim] = useState<AnimState>("idle");
  const [dir, setDir] = useState<1 | -1>(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loaded && !userId) {
      router.replace("/");
    }
  }, [loaded, userId, router]);

  useEffect(() => {
    if (!userId) return;
    fetchItems(userId).then((items) => {
      const nonPrivate = items.filter((i) => !i.private);
      if (nonPrivate.length === 0) {
        toast("Nothing to review right now.");
        router.push("/app");
        return;
      }
      setQueue(nonPrivate);
      setReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!loaded || !userId || !ready) return null;

  const isDone = index >= queue.length;
  const current = !isDone ? queue[index] : null;

  function advance() {
    setDir(1);
    setAnim("out");
    setTimeout(() => {
      setIndex((i) => i + 1);
      setAnim("in");
      setTimeout(() => setAnim("idle"), 300);
    }, 230);
  }

  async function handleAction(action: OwnershipResponse | "resolve" | "next") {
    if (!current || !userId) return;
    setReviewed((r) => r + 1);

    if (action === "take" || action === "together") {
      await respondToItem(current.id, action, userId);
      toast(action === "take" ? "Agreed — moved to Agreed/Planned." : "Agreed — moved to Agreed/Planned.");
    } else if (action === "discuss") {
      await respondToItem(current.id, "discuss", userId);
      toast("Noted — flagged to discuss together.");
    } else if (action === "not_now") {
      await respondToItem(current.id, "not_now", userId);
      toast("No problem — revisit later.");
    } else if (action === "resolve") {
      const note = `${current.ai?.outcome ?? current.text} — marked resolved during check-in.`;
      await resolveItem(current.id, note);
      setResolvedCount((c) => c + 1);
      toast("Resolved — nice work together.");
    }
    advance();
  }

  const slideOutClass = dir > 0 ? "slide-left-out" : "slide-right-out";
  const slideInClass = dir > 0 ? "slide-right-in" : "slide-left-in";
  const cardAnimClass =
    anim === "out" ? slideOutClass : anim === "in" ? slideInClass : "";

  return (
    <div className="fixed inset-0 bg-[var(--bg)] z-[90] flex flex-col">
      <div className="ci-top">
        <button
          className="ci-close"
          style={{ left: 20, right: "auto" }}
          onClick={() => router.push("/app")}
        >
          <Icon name="close" size={18} />
        </button>
        {!isDone ? (
          <>
            <div className="ci-counter">
              Item {index + 1} of {queue.length}
            </div>
            <div className="ci-dots">
              {queue.map((_, i) => (
                <div
                  key={i}
                  className={`ci-dot ${i < index ? "pass" : i === index ? "on" : ""}`}
                />
              ))}
            </div>
            <div className="ci-prompt">{promptFor(current!)}</div>
          </>
        ) : (
          <>
            <div className="ci-counter">All done</div>
            <div className="ci-prompt">Nice check-in.</div>
          </>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-7 overflow-hidden">
        <div className="w-full max-w-[480px]">
          {!isDone && current && (
            <div className={`card ci-card ${cardAnimClass}`}>
              <div
                className={`pill ${PILL_CLASS[current.state]}`}
                style={{ display: "inline-block", marginBottom: 12 }}
              >
                {PILL_LABEL[current.state]}
                {current.state === "resolved" && <Icon name="check" size={13} />}
              </div>
              <div className="ci-outcome">
                {current.state === "resolved"
                  ? current.resolutionNote || current.ai?.outcome || current.text
                  : current.ai?.outcome || current.text}
              </div>
              {current.state !== "resolved" && (
                <div className="ci-next">{current.ai?.nextStep ?? ""}</div>
              )}

              {current.state === "needs_agreement" && (
                <div className="respond-grid">
                  <button className="respond-btn" onClick={() => handleAction("take")}>
                    I&apos;ll take this
                  </button>
                  <button className="respond-btn" onClick={() => handleAction("together")}>
                    Let&apos;s do it together
                  </button>
                  <button className="respond-btn" onClick={() => handleAction("discuss")}>
                    Can we discuss it?
                  </button>
                  <button className="respond-btn" onClick={() => handleAction("not_now")}>
                    Not now
                  </button>
                </div>
              )}
              {current.state === "agreed" && (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => handleAction("resolve")}
                >
                  Mark resolved
                </button>
              )}
              {current.state === "resolved" && (
                <button
                  className="btn btn-ghost"
                  style={{ width: "100%" }}
                  onClick={() => handleAction("next")}
                >
                  <Icon name="check" size={16} /> Nice — Next
                </button>
              )}
            </div>
          )}

          {isDone && (
            <div className="card ci-card text-center">
              <Image
                src="/brand/arrived-together.webp"
                alt=""
                width={900}
                height={506}
                className="brand-inline"
                style={{ maxWidth: 200, marginBottom: 10 }}
              />
              <h3 className="text-xl font-bold mb-2">
                You reviewed {reviewed} thing{reviewed === 1 ? "" : "s"} together
              </h3>
              <p className="text-[var(--text-soft)] text-sm mb-[22px]">
                {resolvedCount} resolved this time — the rest are still
                visible and waiting, no pressure.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push("/app")}
              >
                Back to Tandem
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
