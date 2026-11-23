import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import UnifiedShowcaseView from "@/components/player/unified-showcase-view";
import { SHOWCASE_UID } from "@/lib/constants";

export default async function PlayerPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;

  if (uid !== SHOWCASE_UID) {
    return (
      <main className="profile-page min-h-screen bg-[#0b0f16] flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded border border-white/10 bg-[#121824]">
          <Link href="/" className="back-link inline-flex items-center gap-2 mb-4 text-xs text-[#a6acb8] hover:text-[#c8a96e]">
            <ArrowLeft size={14} /> Back to Astra
          </Link>
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#e3a5a0] block mb-2">
            INVALID UID
          </span>
          <h1 className="text-2xl font-semibold mb-2">Showcase Not Found</h1>
          <p className="text-xs text-[#929baa] mb-6">This archive is dedicated to its configured public showcase.</p>
          <Link href="/" className="primary-button">
            Go to showcase
          </Link>
        </div>
      </main>
    );
  }

  return <UnifiedShowcaseView initialCharacterId={10000114} />;
}
