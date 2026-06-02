// Centres d'intérêt prédéfinis proposés à l'onboarding (F2.1).
export const INTERESTS = [
  "Football",
  "IA",
  "Entrepreneuriat",
  "Technologie",
  "Lecture",
  "Histoire",
  "Sciences",
  "Business",
  "Finance",
  "Films",
  "Musique",
  "Gaming",
] as const;

export type Interest = (typeof INTERESTS)[number];
