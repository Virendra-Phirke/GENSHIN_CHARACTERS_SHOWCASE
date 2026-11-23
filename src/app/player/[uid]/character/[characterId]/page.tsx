import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UnifiedShowcaseView from "@/components/player/unified-showcase-view";
import { SHOWCASE_UID } from "@/lib/constants";

export default async function CharacterPage({
  params,
}: {
  params: Promise<{ uid: string; characterId: string }>;
}) {
  const { uid, characterId } = await params;
  const parsedCharacterId = Number(characterId);

  if (uid !== SHOWCASE_UID || !/^\d+$/.test(characterId) || !Number.isSafeInteger(parsedCharacterId) || parsedCharacterId <= 0) {
    return (
      <main className="profile-page min-h-screen bg-[#0b0f16] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded border border-white/10 bg-[#121824]">
          <Link href="/" className="back-link inline-flex items-center gap-2 mb-4 text-xs text-[#a6acb8] hover:text-[#c8a96e]">
            <ArrowLeft size={14} /> Back to Astra
          </Link>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#e3a5a0] block mb-2">
            INVALID CHARACTER ROUTE
          </span>
          <h1 className="text-2xl font-semibold mb-2">Character Link Unavailable</h1>
          <p className="text-xs text-[#929baa] mb-6">Return to the configured player archive and select a character from its public showcase.</p>
          <Link href="/" className="primary-button">
            Go to showcase
          </Link>
        </div>
      </main>
    );
  }

  return <UnifiedShowcaseView initialCharacterId={parsedCharacterId} />;
}
