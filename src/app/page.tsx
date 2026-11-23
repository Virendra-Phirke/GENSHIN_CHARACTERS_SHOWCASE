import UnifiedShowcaseView from "@/components/player/unified-showcase-view";

export default function RootPage() {
  // Directly opens the character showcase starting with Skirk (ID 10000114)
  return <UnifiedShowcaseView initialCharacterId={10000114} />;
}
