import { NextResponse } from "next/server";
import type {
  BuildStat,
  ConstellationInfo,
  PlayerShowcase,
  ShowcaseArtifact,
  ShowcaseCharacter,
  TalentInfo,
} from "@/lib/types";
import { getCharacterAssetMetadata } from "@/lib/character-assets";
import { SHOWCASE_UID } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type EnkaStat = {
  propType?: string;
  mainPropId?: string;
  appendPropId?: string;
  appendPropID?: string;
  propValue?: number;
  statValue?: number;
};

type EnkaEquipment = {
  itemId?: number;
  weapon?: { level?: number; promoteLevel?: number; affixMap?: Record<string, number> };
  reliquary?: { level?: number; mainPropId?: string; appendPropIdList?: string[] };
  flat?: {
    itemType?: string;
    nameTextMapHash?: string | number;
    nameTextHashMap?: string | number;
    setNameTextMapHash?: string | number;
    setNameTextHashMap?: string | number;
    setId?: number;
    rankLevel?: number;
    equipType?: string;
    icon?: string;
    weaponStats?: EnkaStat[];
    reliquaryMainstat?: EnkaStat;
    reliquarySubstats?: EnkaStat[];
  };
};

type EnkaCharacter = {
  avatarId?: number;
  propMap?: Record<string, { ival?: number; val?: number }>;
  fightPropMap?: Record<string, number>;
  talentIdList?: number[];
  skillLevelMap?: Record<string, number>;
  equipList?: EnkaEquipment[];
  fetterInfo?: { expLevel?: number };
};

type EnkaResponse = {
  ttl?: number;
  playerInfo?: { nickname?: string; level?: number; worldLevel?: number; signature?: string };
  avatarInfoList?: EnkaCharacter[];
};

type TextMap = Record<string, string>;
type EnkaRelicStore = {
  Items?: Record<string, { Rarity?: number; SetId?: number }>;
  Sets?: Record<string, { Name?: string | number }>;
};

let relicStorePromise: Promise<EnkaRelicStore> | null = null;
let relicStoreExpiresAt = 0;
const RELIC_STORE_TTL = 6 * 60 * 60 * 1000;

async function getRelicStore(): Promise<EnkaRelicStore> {
  if (relicStorePromise && Date.now() < relicStoreExpiresAt) return relicStorePromise;
  relicStorePromise = fetch("https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/relics.json", {
    next: { revalidate: 21600 },
  }).then(async (response) => {
    if (!response.ok) throw new Error("Relic metadata unavailable");
    return (await response.json()) as EnkaRelicStore;
  });
  relicStoreExpiresAt = Date.now() + RELIC_STORE_TTL;
  try {
    return await relicStorePromise;
  } catch (error) {
    relicStorePromise = null;
    relicStoreExpiresAt = 0;
    throw error;
  }
}

let textMapPromise: Promise<TextMap> | null = null;
let textMapExpiresAt = 0;
const TEXT_MAP_TTL = 6 * 60 * 60 * 1000;

async function getEnglishTextMap(): Promise<TextMap> {
  if (textMapPromise && Date.now() < textMapExpiresAt) return textMapPromise;
  textMapPromise = fetch("https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/locs.json", {
    next: { revalidate: 21600 },
  }).then(async (response) => {
    if (!response.ok) throw new Error("Localization metadata unavailable");
    const locales = (await response.json()) as { en?: TextMap };
    return locales.en ?? {};
  });
  textMapExpiresAt = Date.now() + TEXT_MAP_TTL;
  try {
    return await textMapPromise;
  } catch (error) {
    textMapPromise = null;
    textMapExpiresAt = 0;
    throw error;
  }
}

const STAT_NAMES: Record<string, string> = {
  FIGHT_PROP_HP: "HP",
  FIGHT_PROP_ATTACK: "ATK",
  FIGHT_PROP_DEFENSE: "DEF",
  FIGHT_PROP_HP_PERCENT: "HP%",
  FIGHT_PROP_ATTACK_PERCENT: "ATK%",
  FIGHT_PROP_DEFENSE_PERCENT: "DEF%",
  FIGHT_PROP_CRITICAL: "CRIT Rate",
  FIGHT_PROP_CRITICAL_HURT: "CRIT DMG",
  FIGHT_PROP_CHARGE_EFFICIENCY: "Energy Recharge",
  FIGHT_PROP_HEAL_ADD: "Healing Bonus",
  FIGHT_PROP_ELEMENT_MASTERY: "Elemental Mastery",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "Physical DMG Bonus",
  FIGHT_PROP_FIRE_ADD_HURT: "Pyro DMG Bonus",
  FIGHT_PROP_ELEC_ADD_HURT: "Electro DMG Bonus",
  FIGHT_PROP_WATER_ADD_HURT: "Hydro DMG Bonus",
  FIGHT_PROP_WIND_ADD_HURT: "Anemo DMG Bonus",
  FIGHT_PROP_ICE_ADD_HURT: "Cryo DMG Bonus",
  FIGHT_PROP_ROCK_ADD_HURT: "Geo DMG Bonus",
  FIGHT_PROP_GRASS_ADD_HURT: "Dendro DMG Bonus",
};

const PERCENT_STATS = new Set([
  "FIGHT_PROP_HP_PERCENT",
  "FIGHT_PROP_ATTACK_PERCENT",
  "FIGHT_PROP_DEFENSE_PERCENT",
  "FIGHT_PROP_CRITICAL",
  "FIGHT_PROP_CRITICAL_HURT",
  "FIGHT_PROP_CHARGE_EFFICIENCY",
  "FIGHT_PROP_HEAL_ADD",
  "FIGHT_PROP_PHYSICAL_ADD_HURT",
  "FIGHT_PROP_FIRE_ADD_HURT",
  "FIGHT_PROP_ELEC_ADD_HURT",
  "FIGHT_PROP_WATER_ADD_HURT",
  "FIGHT_PROP_WIND_ADD_HURT",
  "FIGHT_PROP_ICE_ADD_HURT",
  "FIGHT_PROP_ROCK_ADD_HURT",
  "FIGHT_PROP_GRASS_ADD_HURT",
]);

const EQUIP_SLOT_CONFIG: Record<
  string,
  { label: string; key: "flower" | "plume" | "sands" | "goblet" | "circlet" }
> = {
  EQUIP_BRACER: { label: "Flower of Life", key: "flower" },
  EQUIP_NECKLACE: { label: "Plume of Death", key: "plume" },
  EQUIP_SHOES: { label: "Sands of Eon", key: "sands" },
  EQUIP_RING: { label: "Goblet of Eonothem", key: "goblet" },
  EQUIP_DRESS: { label: "Circlet of Logos", key: "circlet" },
};

const CANONICAL_RELIC_PIECES: Record<number, Record<string, string>> = {
  // Marechaussee Hunter
  15031: {
    EQUIP_BRACER: "Hunter's Brooch",
    EQUIP_NECKLACE: "Masterpiece's Overture",
    EQUIP_SHOES: "Moment of Cessation",
    EQUIP_RING: "Musician's Top Hat",
    EQUIP_DRESS: "Veteran's Visage",
  },
  // Deepwood Memories
  15025: {
    EQUIP_BRACER: "Labyrinth Wayfarer",
    EQUIP_NECKLACE: "Scholar of Vines",
    EQUIP_SHOES: "A Time of Insight",
    EQUIP_RING: "Lamp of the Lost",
    EQUIP_DRESS: "Laurel Coronet",
  },
  // Golden Troupe
  15032: {
    EQUIP_BRACER: "Golden Song's Variation",
    EQUIP_NECKLACE: "Golden Bird's Shedding",
    EQUIP_SHOES: "Golden Hour's Passage",
    EQUIP_RING: "Golden Era's Prelude",
    EQUIP_DRESS: "Golden Troupe's Reward",
  },
  // Emblem of Severed Fate
  15020: {
    EQUIP_BRACER: "Magnificent Tsuba",
    EQUIP_NECKLACE: "Sundered Feather",
    EQUIP_SHOES: "Storm Cage",
    EQUIP_RING: "Scarlet Vessel",
    EQUIP_DRESS: "Ornate Kabuto",
  },
  // Tenacity of the Millelith
  15017: {
    EQUIP_BRACER: "Flower of Accolades",
    EQUIP_NECKLACE: "Ceremonial War-Plume",
    EQUIP_SHOES: "Orichalceous Timepiece",
    EQUIP_RING: "Noble's Pledging Vessel",
    EQUIP_DRESS: "General's Ancient Helm",
  },
  // Gilded Dreams
  15026: {
    EQUIP_BRACER: "Dreaming Steelbloom",
    EQUIP_NECKLACE: "Feather of Judgment",
    EQUIP_SHOES: "The Sunken Years",
    EQUIP_RING: "Honeyed Final Feast",
    EQUIP_DRESS: "Shadow of the Sand King",
  },
  // Obsidian Codex
  15038: {
    EQUIP_BRACER: "Reckoning of the Xenopen",
    EQUIP_NECKLACE: "Root of the Spirit-Vessel",
    EQUIP_SHOES: "Myths of the Night Realm",
    EQUIP_RING: "Preaching of the Predecessors",
    EQUIP_DRESS: "Crown of the Sacred Monarch",
  },
};

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function localizedName(hash: string | number | undefined, textMap: TextMap): string | undefined {
  return hash == null ? undefined : textMap[String(hash)];
}

function formatValue(value: number, isPercent = false): string {
  if (isPercent) return `${(value * 100).toFixed(1)}%`;
  return Number.isInteger(value) ? value.toLocaleString("en-US") : value.toFixed(1);
}

function toBuildStat(property: string | undefined, value: number | undefined, equipmentValue = false): BuildStat | undefined {
  if (!property || value == null || !Number.isFinite(value)) return undefined;
  const isPercent = PERCENT_STATS.has(property);
  return {
    label: STAT_NAMES[property] ?? property.replace(/^FIGHT_PROP_/, "").replaceAll("_", " "),
    value: isPercent
      ? `${(equipmentValue ? value : value * 100).toFixed(1)}%`
      : formatValue(value),
    rawValue: value,
  };
}

function getCharacterStats(character: EnkaCharacter): BuildStat[] {
  const map = character.fightPropMap ?? {};
  const stats: BuildStat[] = [];

  // 1. Primary Attributes (HP, ATK, DEF with base + bonus breakdown)
  const baseHp = map["1"];
  const totalHp = map["2000"];
  if (typeof totalHp === "number") {
    stats.push({
      label: "HP",
      value: Math.round(totalHp).toLocaleString("en-US"),
      rawValue: totalHp,
      detail: typeof baseHp === "number"
        ? `${Math.round(baseHp).toLocaleString("en-US")} BASE · +${Math.max(0, Math.round(totalHp - baseHp)).toLocaleString("en-US")} BONUS`
        : undefined,
    });
  }

  const baseAtk = map["4"];
  const totalAtk = map["2001"];
  if (typeof totalAtk === "number") {
    stats.push({
      label: "ATK",
      value: Math.round(totalAtk).toLocaleString("en-US"),
      rawValue: totalAtk,
      detail: typeof baseAtk === "number"
        ? `${Math.round(baseAtk).toLocaleString("en-US")} BASE · +${Math.max(0, Math.round(totalAtk - baseAtk)).toLocaleString("en-US")} BONUS`
        : undefined,
    });
  }

  const baseDef = map["7"];
  const totalDef = map["2002"];
  if (typeof totalDef === "number") {
    stats.push({
      label: "DEF",
      value: Math.round(totalDef).toLocaleString("en-US"),
      rawValue: totalDef,
      detail: typeof baseDef === "number"
        ? `${Math.round(baseDef).toLocaleString("en-US")} BASE · +${Math.max(0, Math.round(totalDef - baseDef)).toLocaleString("en-US")} BONUS`
        : undefined,
    });
  }

  // 2. Core Combat Stats
  if (typeof map["20"] === "number") {
    stats.push({
      label: "CRIT Rate",
      value: `${(map["20"] * 100).toFixed(1)}%`,
      rawValue: map["20"],
    });
  }

  if (typeof map["22"] === "number") {
    stats.push({
      label: "CRIT DMG",
      value: `${(map["22"] * 100).toFixed(1)}%`,
      rawValue: map["22"],
    });
  }

  if (typeof map["23"] === "number") {
    stats.push({
      label: "Energy Recharge",
      value: `${(map["23"] * 100).toFixed(1)}%`,
      rawValue: map["23"],
    });
  }

  if (typeof map["28"] === "number") {
    stats.push({
      label: "Elemental Mastery",
      value: Math.round(map["28"]).toLocaleString("en-US"),
      rawValue: map["28"],
    });
  }

  // 3. Situational / Elemental Bonuses (only if > 0)
  const elementalBonusMap: Record<string, string> = {
    "26": "Healing Bonus",
    "30": "Physical DMG Bonus",
    "40": "Pyro DMG Bonus",
    "41": "Electro DMG Bonus",
    "42": "Hydro DMG Bonus",
    "43": "Dendro DMG Bonus",
    "44": "Anemo DMG Bonus",
    "45": "Geo DMG Bonus",
    "46": "Cryo DMG Bonus",
  };

  for (const [key, label] of Object.entries(elementalBonusMap)) {
    const val = map[key];
    if (typeof val === "number" && val > 0.0001) {
      stats.push({
        label,
        value: `${(val * 100).toFixed(1)}%`,
        rawValue: val,
      });
    }
  }

  return stats;
}

function getEquipStat(stat: EnkaStat | undefined): BuildStat | undefined {
  if (!stat) return undefined;
  const property = stat.propType ?? stat.mainPropId ?? stat.appendPropId ?? stat.appendPropID;
  const value = readNumber(stat.statValue) ?? readNumber(stat.propValue);
  return toBuildStat(property, value, true);
}

function normalizeArtifact(item: EnkaEquipment, textMap: TextMap, relicStore: EnkaRelicStore): ShowcaseArtifact {
  const flat = item.flat;
  const reliquary = item.reliquary;
  const relicMetadata = relicStore.Items?.[String(item.itemId)];
  const setId = flat?.setId ?? relicMetadata?.SetId;
  const setNameHash = setId == null ? undefined : relicStore.Sets?.[String(setId)]?.Name;
  const setName = localizedName(setNameHash ?? flat?.setNameTextHashMap ?? flat?.setNameTextMapHash, textMap);

  const equipSlot = flat?.equipType ? EQUIP_SLOT_CONFIG[flat.equipType] : undefined;
  const slotLabel = equipSlot?.label ?? "Artifact";
  const slotKey = equipSlot?.key;

  // Retrieve canonical item name if available, then text map hash, then fallback
  const canonicalPieceName = setId && flat?.equipType ? CANONICAL_RELIC_PIECES[setId]?.[flat.equipType] : undefined;
  const hashPieceName = localizedName(flat?.nameTextHashMap ?? flat?.nameTextMapHash, textMap);
  const pieceName = canonicalPieceName ?? hashPieceName ?? (setName ? `${setName} · ${slotLabel.split(" ")[0]}` : slotLabel);

  const main = getEquipStat(flat?.reliquaryMainstat);
  const substats = (flat?.reliquarySubstats ?? [])
    .map(getEquipStat)
    .filter((stat): stat is BuildStat => Boolean(stat));

  // Compute Crit Value: (CRIT Rate * 2) + CRIT DMG
  const critRate = substats.find((s) => s.label === "CRIT Rate")?.rawValue ?? 0;
  const critDmg = substats.find((s) => s.label === "CRIT DMG")?.rawValue ?? 0;
  const critValue = (critRate > 0 || critDmg > 0)
    ? Number(((critRate * 2) + critDmg).toFixed(1))
    : undefined;

  return {
    slot: slotLabel,
    slotKey,
    name: pieceName,
    setName,
    rarity: readNumber(flat?.rankLevel) ?? readNumber(relicMetadata?.Rarity) ?? 5,
    level: Math.max(0, (readNumber(reliquary?.level) ?? 1) - 1),
    mainStat: main,
    substats,
    critValue,
    icon: flat?.icon ? `https://static.nanoka.cc/assets/gi/${flat.icon}.webp` : undefined,
    iconFallback: flat?.icon ? `https://enka.network/ui/${flat.icon}.png` : undefined,
  };
}

async function normalizeCharacter(character: EnkaCharacter, textMap: TextMap, relicStore: EnkaRelicStore): Promise<ShowcaseCharacter | null> {
  const id = readNumber(character.avatarId);
  if (!id) return null;

  const metadata = await getCharacterAssetMetadata(id);
  const equipment = character.equipList ?? [];
  const weaponEntry = equipment.find((item) => item.flat?.itemType === "ITEM_WEAPON");
  const artifactEntries = equipment.filter((item) => item.flat?.itemType === "ITEM_RELIQUARY");
  const weaponFlat = weaponEntry?.flat;
  const weaponStats = weaponFlat?.weaponStats ?? [];
  const baseAttack = weaponStats.find((stat) => (stat.appendPropId ?? stat.appendPropID) === "FIGHT_PROP_BASE_ATTACK");
  const weaponSubstat = weaponStats.find((stat) => (stat.appendPropId ?? stat.appendPropID) !== "FIGHT_PROP_BASE_ATTACK");
  const refinementValues = Object.values(weaponEntry?.weapon?.affixMap ?? {}).filter(Number.isFinite);

  const stats = getCharacterStats(character);
  const artifacts = artifactEntries.map((item) => normalizeArtifact(item, textMap, relicStore));

  // Compute overall character Crit Value: (CRIT Rate * 2) + CRIT DMG
  const critRateStat = stats.find((s) => s.label === "CRIT Rate")?.rawValue ?? 0;
  const critDmgStat = stats.find((s) => s.label === "CRIT DMG")?.rawValue ?? 0;
  const critValue = (critRateStat > 0 || critDmgStat > 0)
    ? Number(((critRateStat * 100 * 2) + (critDmgStat * 100)).toFixed(1))
    : undefined;

  // Build talent list with skill icons
  const talentNames = ["Normal Attack", "Elemental Skill", "Elemental Burst"];
  const skillLevels = Object.entries(character.skillLevelMap ?? {})
    .sort(([left], [right]) => Number(left) - Number(right));

  const talents: TalentInfo[] = skillLevels.map(([skillIdStr, level], index) => {
    const skillId = Number(skillIdStr);
    const skillAsset = metadata?.skills?.find((s) => s.id === skillId) ?? metadata?.skills?.[index];
    return {
      name: talentNames[index] ?? `Talent ${index + 1}`,
      level,
      isCrowned: level >= 10,
      icon: skillAsset?.icon,
      iconFallback: skillAsset?.fallbackIcon,
    };
  });

  // Build constellation list (all 6 nodes)
  const activatedConstellationCount = character.talentIdList?.length ?? 0;
  const constellations: ConstellationInfo[] = Array.from({ length: 6 }, (_, idx) => {
    const constIndex = idx + 1;
    const constAsset = metadata?.constellations?.find((c) => c.index === constIndex) ?? metadata?.constellations?.[idx];
    return {
      index: constIndex,
      unlocked: constIndex <= activatedConstellationCount,
      icon: constAsset?.icon,
      iconFallback: constAsset?.fallbackIcon,
    };
  });

  return {
    id,
    name: metadata?.name ?? `Character #${id}`,
    element: metadata?.element,
    image: metadata?.splashUrl,
    imageFallback: metadata?.fallbackUrl,
    level: readNumber(character.propMap?.["4001"]?.ival ?? character.propMap?.["4001"]?.val),
    friendship: readNumber(character.fetterInfo?.expLevel),
    constellation: activatedConstellationCount,
    rarity: metadata?.rarity ?? 5,
    critValue,
    weapon: weaponEntry
      ? {
          name: localizedName(weaponFlat?.nameTextHashMap ?? weaponFlat?.nameTextMapHash, textMap),
          level: readNumber(weaponEntry.weapon?.level),
          refinement: refinementValues.length ? Math.max(...refinementValues) + 1 : undefined,
          rarity: readNumber(weaponFlat?.rankLevel) ?? 4,
          baseAttack: baseAttack
            ? formatValue(readNumber(baseAttack.statValue) ?? readNumber(baseAttack.propValue) ?? 0)
            : undefined,
          substat: getEquipStat(weaponSubstat),
          icon: weaponFlat?.icon ? `https://static.nanoka.cc/assets/gi/${weaponFlat.icon}.webp` : undefined,
          iconFallback: weaponFlat?.icon ? `https://enka.network/ui/${weaponFlat.icon}.png` : undefined,
        }
      : undefined,
    artifacts,
    stats,
    talents,
    constellations,
  };
}

const cache = new Map<string, { expiresAt: number; data: PlayerShowcase }>();
const CACHE_FALLBACK_SECONDS = 60;
const MAX_CACHE_SECONDS = 60 * 60;

export async function GET(_request: Request, { params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  if (uid !== SHOWCASE_UID) {
    return NextResponse.json(
      { error: "This Astra archive is configured for one public showcase only.", code: "PROFILE_UNAVAILABLE" },
      { status: 404 },
    );
  }
  if (!/^\d{8,10}$/.test(uid)) {
    return NextResponse.json({ error: "Enter a valid 8–10 digit in-game UID.", code: "INVALID_UID" }, { status: 400 });
  }

  const cached = cache.get(uid);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "private, max-age=30", "X-Showcase-Cache": "HIT" },
    });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);

  try {
    const response = await fetch(`https://enka.network/api/uid/${uid}?x=1`, {
      headers: { Accept: "application/json", "User-Agent": "AstraGenshinShowcase/0.1 (public showcase viewer)" },
      signal: controller.signal,
      cache: "no-store",
    });

    if (response.status === 404) {
      return NextResponse.json(
        {
          error: "This profile is unavailable. Check the UID and make sure the in-game character showcase is public.",
          code: "PROFILE_UNAVAILABLE",
        },
        { status: 404 },
      );
    }
    if (response.status === 429) {
      return NextResponse.json(
        {
          error: "The showcase service is receiving too many requests. Please wait before trying again.",
          code: "RATE_LIMITED",
        },
        { status: 429 },
      );
    }
    if (!response.ok) {
      return NextResponse.json(
        { error: "The showcase service is temporarily unavailable. Please try again later.", code: "UPSTREAM_ERROR" },
        { status: 502 },
      );
    }

    const raw = (await response.json()) as EnkaResponse;
    if (!raw || typeof raw !== "object" || !raw.playerInfo) {
      return NextResponse.json(
        { error: "The showcase response was incomplete. Please try again later.", code: "INVALID_RESPONSE" },
        { status: 502 },
      );
    }

    const [textMap, relicStore] = await Promise.all([
      getEnglishTextMap().catch(() => ({} as TextMap)),
      getRelicStore().catch(() => ({} as EnkaRelicStore)),
    ]);
    const normalizedCharacters = await Promise.all(
      (raw.avatarInfoList ?? []).map((character) => normalizeCharacter(character, textMap, relicStore)),
    );
    const characters = normalizedCharacters.filter((character): character is ShowcaseCharacter => character !== null);

    if (!characters.length) {
      return NextResponse.json(
        {
          error: "No public showcase characters were found. Add characters to your in-game showcase and try again.",
          code: "EMPTY_SHOWCASE",
        },
        { status: 404 },
      );
    }

    const payload: PlayerShowcase = {
      uid,
      nickname: raw.playerInfo.nickname,
      adventureRank: readNumber(raw.playerInfo.level),
      worldLevel: readNumber(raw.playerInfo.worldLevel),
      signature: raw.playerInfo.signature,
      characters,
      fetchedAt: new Date().toISOString(),
    };

    const ttl = Math.min(Math.max(readNumber(raw.ttl) ?? CACHE_FALLBACK_SECONDS, 15), MAX_CACHE_SECONDS);
    cache.set(uid, { data: payload, expiresAt: Date.now() + ttl * 1000 });

    return NextResponse.json(payload, {
      headers: { "Cache-Control": "private, max-age=30", "X-Showcase-Cache": "MISS", "X-Upstream-TTL": String(ttl) },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The showcase request timed out. Please try again."
          : "Couldn't connect to the showcase service. Please try again later.",
        code: "UPSTREAM_ERROR",
      },
      { status: 502 },
    );
  } finally {
    clearTimeout(timeout);
  }
}
