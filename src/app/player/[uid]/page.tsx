import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PlayerShowcase from "@/components/player/player-showcase";
import { SHOWCASE_UID } from "@/lib/constants";

export default async function PlayerPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;

  if (uid !== SHOWCASE_UID) {
    return (
      <main className="profile-page">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to Astra</Link>
        <div className="profile-empty">
          <span className="eyebrow">INVALID UID</span>
          <h1>That UID doesn&apos;t look right.</h1>
          <p>This archive is dedicated to its configured public showcase.</p>
        </div>
      </main>
    );
  }

  return <PlayerShowcase uid={uid} />;
}