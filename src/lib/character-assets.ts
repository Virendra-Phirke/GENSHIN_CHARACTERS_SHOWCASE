type EnkaAvatarRecord = {
  Element?: string;
  QualityType?: string;
  NameTextMapHash?: number;
  SideIconName?: string;
  SkillOrder?: number[];
  Skills?: Record<string, string>;
  Consts?: string[];
};

type EnkaAvatarStore = Record<string, EnkaAvatarRecord>;
type EnkaLocaleStore = { en?: Record<string, string> };

export type SkillAsset = {
  id: number;
  icon: string;
  fallbackIcon: string;
};

export type ConstellationAsset = {
  index: number;
  icon: string;
  fallbackIcon: string;
};

export type CharacterAssetMetadata = {
  name: string;
  element?: string;
  rarity?: number;
  splashUrl: string;
  fallbackUrl: string;
  skills?: SkillAsset[];
  constellations?: ConstellationAsset[];
};

const AVATARS_URL = "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/avatars.json";
const LOCALES_URL = "https://raw.githubusercontent.com/EnkaNetwork/API-docs/master/store/gi/locs.json";

const ELEMENT_NAMES: Record<string, string> = {
  Fire: "Pyro",
  Water: "Hydro",
  Electric: "Electro",
  Wind: "Anemo",
  Ice: "Cryo",
  Rock: "Geo",
  Grass: "Dendro",
};

function formatAssetUrl(rawPath: string | undefined): { webp: string; png: string } | undefined {
  if (!rawPath) return undefined;
  const filename = rawPath.split("/").pop()?.replace(/\.png$/i, "");
  if (!filename) return undefined;
  return {
    webp: `https://static.nanoka.cc/assets/gi/${filename}.webp`,
    png: `https://enka.network/ui/${filename}.png`,
  };
}

let metadataPromise: Promise<Map<number, CharacterAssetMetadata>> | null = null;
let metadataExpiresAt = 0;
const METADATA_TTL_MS = 6 * 60 * 60 * 1000;

async function loadCharacterMetadata(): Promise<Map<number, CharacterAssetMetadata>> {
  if (metadataPromise && Date.now() < metadataExpiresAt) return metadataPromise;

  metadataPromise = (async () => {
    const [avatarsResponse, localesResponse] = await Promise.all([
      fetch(AVATARS_URL, { next: { revalidate: 21600 } }),
      fetch(LOCALES_URL, { next: { revalidate: 21600 } }),
    ]);

    if (!avatarsResponse.ok || !localesResponse.ok) {
      throw new Error("Character metadata is temporarily unavailable.");
    }

    const [avatars, locales] = (await Promise.all([
      avatarsResponse.json(),
      localesResponse.json(),
    ])) as [EnkaAvatarStore, EnkaLocaleStore];

    const english = locales.en ?? {};
    const result = new Map<number, CharacterAssetMetadata>();

    for (const [rawId, avatar] of Object.entries(avatars)) {
      const id = Number(rawId);
      const name = avatar.NameTextMapHash
        ? english[String(avatar.NameTextMapHash)]
        : undefined;
      const sideIcon = avatar.SideIconName;

      if (!Number.isSafeInteger(id) || !name || !sideIcon) continue;

      const sideIconFile = sideIcon.split("/").pop();
      if (!sideIconFile) continue;

      const internalName = sideIconFile
        .replace(/^UI_AvatarIcon_Side_/, "")
        .replace(/\.png$/i, "");

      const skills: SkillAsset[] = (avatar.SkillOrder ?? [])
        .map((skillId) => {
          const rawIcon = avatar.Skills?.[String(skillId)];
          const urls = formatAssetUrl(rawIcon);
          if (!urls) return null;
          return {
            id: skillId,
            icon: urls.webp,
            fallbackIcon: urls.png,
          };
        })
        .filter((skill): skill is SkillAsset => skill !== null);

      const constellations: ConstellationAsset[] = (avatar.Consts ?? [])
        .map((constIcon, index) => {
          const urls = formatAssetUrl(constIcon);
          if (!urls) return null;
          return {
            index: index + 1,
            icon: urls.webp,
            fallbackIcon: urls.png,
          };
        })
        .filter((item): item is ConstellationAsset => item !== null);

      result.set(id, {
        name,
        element: avatar.Element ? ELEMENT_NAMES[avatar.Element] : undefined,
        rarity: avatar.QualityType === "QUALITY_ORANGE" ? 5 : avatar.QualityType === "QUALITY_PURPLE" ? 4 : undefined,
        splashUrl: `https://static.nanoka.cc/assets/gi/UI_Gacha_AvatarImg_${internalName}.webp`,
        fallbackUrl: `https://enka.network/ui/UI_Gacha_AvatarImg_${internalName}.png`,
        skills,
        constellations,
      });
    }

    return result;
  })();

  metadataExpiresAt = Date.now() + METADATA_TTL_MS;

  try {
    return await metadataPromise;
  } catch (error) {
    metadataPromise = null;
    metadataExpiresAt = 0;
    throw error;
  }
}

export async function getCharacterAssetMetadata(
  avatarId: number,
): Promise<CharacterAssetMetadata | undefined> {
  try {
    const map = await loadCharacterMetadata();
    return map.get(avatarId);
  } catch {
    return undefined;
  }
}
