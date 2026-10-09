import Link from "next/link";
import { NeoButton } from "@/components/neo-brutal/neo-button";
import { NeoCard } from "@/components/neo-brutal/neo-card";
import { Compass, Gamepad2, Search, Building2, Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="page-content min-h-screen bg-[#dff4ff] flex items-center">
      <section className="mx-auto max-w-6xl w-full px-6 py-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-stretch">
          {/* Left Column - Hero Card */}
          <NeoCard className="neo-card-orange p-8 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles className="w-3.5 h-3.5 text-[#ffe600]" />
                Blender Digital Campus Twin
              </span>
              <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tight text-black leading-none mb-6">
                Explore Campus.
                <br />
                Play The Game.
              </h1>
              <p className="max-w-lg text-base font-bold text-gray-900 leading-relaxed">
                Step into the 3D Blender digital twin of the college campus.
                Explore grounds cinematically, navigate rooms and departments,
                or switch to Game Mode for interactive 3D gameplay.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/campus?mode=explore">
                <NeoButton size="lg" className="bg-[#ffe600] text-black border-4 border-black hover:bg-yellow-300 flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  Explore Campus
                </NeoButton>
              </Link>
              <Link href="/campus?mode=game">
                <NeoButton size="lg" variant="secondary" className="bg-[#4ecdc4] text-black border-4 border-black hover:bg-teal-300 flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5" />
                  Play Game Mode
                </NeoButton>
              </Link>
            </div>
          </NeoCard>

          {/* Right Column - Features Card */}
          <NeoCard className="neo-card-purple p-8">
            <h2 className="text-xl font-black uppercase text-white mb-6 tracking-wide">
              Campus Features
            </h2>
            <div className="grid grid-cols-2 gap-4 h-[calc(100%-3rem)]">
              {[
                {
                  icon: Compass,
                  label: "3D Explore",
                  desc: "Blender campus digital twin",
                  bgClass: "neo-card-yellow",
                  href: "/campus?mode=explore",
                },
                {
                  icon: Gamepad2,
                  label: "Game Mode",
                  desc: "Third-person character physics",
                  bgClass: "neo-card-pink",
                  href: "/campus?mode=game",
                },
                {
                  icon: Search,
                  label: "Smart Directory",
                  desc: "Rooms, labs & departments",
                  bgClass: "neo-card-blue",
                  href: "/campus?mode=directory",
                },
                {
                  icon: Building2,
                  label: "Pathfinding",
                  desc: "Entrance-to-room navigation",
                  bgClass: "neo-card-green",
                  href: "/campus?mode=directory",
                },
              ].map(({ icon: Icon, label, desc, bgClass, href }) => (
                <Link key={label} href={href} className="block group">
                  <div className={`${bgClass} p-4 flex flex-col justify-between h-full group-hover:-translate-y-1 transition-transform`}>
                    <div>
                      <Icon className="mb-2 h-8 w-8 text-black" />
                      <p className="font-black uppercase text-xs text-black tracking-tight">{label}</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-900 mt-2 leading-snug">{desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </NeoCard>
        </div>
      </section>
    </main>
  );
}
