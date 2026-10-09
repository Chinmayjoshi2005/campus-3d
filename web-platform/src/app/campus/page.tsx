import { Suspense } from "react";
import { CampusExperience } from "@/components/campus/campus-experience";

export default function CampusPage() {
  return (
    <main className="w-full min-h-[calc(100vh-80px)] bg-slate-900">
      <Suspense
        fallback={
          <div className="w-full h-[calc(100vh-80px)] bg-slate-950 flex items-center justify-center text-white font-black uppercase text-sm">
            Loading Campus Experience...
          </div>
        }
      >
        <CampusExperience />
      </Suspense>
    </main>
  );
}
