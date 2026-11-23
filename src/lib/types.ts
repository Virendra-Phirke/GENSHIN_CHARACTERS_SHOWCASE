export type BuildStat = {
  label: string;
  value: string;
  rawValue?: number;
  detail?: string;
};

export type ShowcaseArtifact = {
  slot: string;
  name?: string;
  setName?: string;
  rarity?: number;
  level?: number;
  mainStat?: BuildStat;
  substats: BuildStat[];
  icon?: string;
  iconFallback?: string;
};

export type ShowcaseCharacter = {
  id: number;
  name: string;
  element?: string;
  level?: number;
  friendship?: number;
  constellation?: number;
  rarity?: number;
  image?: string;
  imageFallback?: string;
  weapon?: {
    name?: string;
    level?: number;
    refinement?: number;
    rarity?: number;
    baseAttack?: string;
    substat?: BuildStat;
    icon?: string;
    iconFallback?: string;
  };
  artifacts: ShowcaseArtifact[];
  stats: BuildStat[];
  talents: Array<{ name: string; level: number }>;
};

export type PlayerShowcase = {
  uid: string;
  nickname?: string;
  adventureRank?: number;
  worldLevel?: number;
  signature?: string;
  characters: ShowcaseCharacter[];
  fetchedAt: string;
};

export type PlayerApiError = {
  error: string;
  code:
    | "INVALID_UID"
    | "PROFILE_UNAVAILABLE"
    | "EMPTY_SHOWCASE"
    | "RATE_LIMITED"
    | "UPSTREAM_ERROR"
    | "INVALID_RESPONSE";
};
