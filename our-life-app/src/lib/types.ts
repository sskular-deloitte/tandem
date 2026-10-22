export type UserId = "william" | "sam";

export type ItemState =
  | "on_my_mind"
  | "shared"
  | "needs_agreement"
  | "agreed"
  | "resolved";

export type OwnershipResponse = "take" | "together" | "discuss" | "not_now";

export type SuggestedOwner = "creator" | "partner" | "together" | "not_agreed";

export interface AiSuggestion {
  outcome: string;
  nextStep: string;
  suggestedDate: string;
  suggestedOwner: SuggestedOwner;
  neutralShareText: string;
  isFallback: boolean;
}

export interface Item {
  id: string;
  text: string;
  createdBy: UserId;
  private: boolean;
  state: ItemState;
  ai: AiSuggestion | null;
  ownershipResponse: OwnershipResponse | null;
  ownerType: UserId | "together" | null;
  resolutionNote: string | null;
  createdAt: number;
  updatedAt: number;
}

export type OnboardingAnswers = Record<string, string>;

export interface OnboardingState {
  william?: OnboardingAnswers;
  sam?: OnboardingAnswers;
}

export function otherUser(user: UserId): UserId {
  return user === "william" ? "sam" : "william";
}

export const USER_LABELS: Record<UserId, string> = {
  william: "William",
  sam: "Sam",
};
