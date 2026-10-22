export interface OnboardingQuestion {
  key: string;
  label: string;
  placeholder: string;
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    key: "work",
    label: "What does your working pattern look like?",
    placeholder: "e.g. office Mon-Thu, home Friday",
  },
  {
    key: "dependants",
    label: "Any children or dependants to plan around?",
    placeholder: "e.g. one child, age 6, school pickup at 3:15",
  },
  {
    key: "pets",
    label: "Any pets?",
    placeholder: "e.g. one dog, needs walking twice a day",
  },
  {
    key: "home",
    label: "Anything about your home worth knowing?",
    placeholder: "e.g. renting, boiler due a service",
  },
  {
    key: "vehicles",
    label: "Any vehicles to keep track of?",
    placeholder: "e.g. one car, MOT due in spring",
  },
];
