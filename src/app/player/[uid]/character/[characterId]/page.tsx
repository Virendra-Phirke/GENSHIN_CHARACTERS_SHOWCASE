import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CharacterBuildPage from "@/components/player/character-build-page";
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
      <main className="profile-page">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to Astra</Link>
        <section className="profile-empty">
          <span className="eyebrow">INVALID CHARACTER ROUTE</span>
          <h1>This character link is invalid.</h1>
          <p>Return to the configured player archive and select a character from its public showcase.</p>
        </section>
      </main>
    );
  }

  return <CharacterBuildPage uid={uid} characterId={parsedCharacterId} />;
}
