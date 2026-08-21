import { navLinks } from "@/data/arena";

export function Footer() {
  return (
    <footer className="relative border-t border-[#1a2134] py-14">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rotate-45 border-2 border-cyan-400 flex items-center justify-center">
                <div className="h-1.5 w-1.5 -rotate-45 bg-cyan-400" />
              </div>
              <span className="font-display text-sm font-black tracking-[0.25em] text-white">
                CINEMATIC <span className="text-cyan-400">ARENA</span>
              </span>
            </div>
            <p className="mt-4 max-w-xs font-body text-xs leading-relaxed text-slate-500">
              The next generation of mobile esports. Live tournaments, real-time leaderboards, verified players and
              competitive BGMI events.
            </p>
          </div>

          <div>
            <p className="mb-4 font-body text-[10px] font-semibold tracking-[0.3em] text-slate-600">NAVIGATION</p>
            <div className="flex flex-col gap-2.5">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-4 font-body text-[10px] font-semibold tracking-[0.3em] text-slate-600">COMMUNITY</p>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Discord</a>
              <a href="#" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Telegram</a>
              <a href="#" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">YouTube</a>
              <a href="#" className="font-body text-xs tracking-[0.15em] text-slate-400 transition-colors hover:text-cyan-400">Instagram</a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1a2134] pt-6 sm:flex-row">
          <p className="font-body text-[10px] tracking-[0.2em] text-slate-600">
            © 2024 CINEMATIC ARENA · ALL RIGHTS RESERVED
          </p>
          <p className="font-body text-[10px] tracking-[0.2em] text-slate-600">
            BUILT FOR THE NEXT GENERATION OF <span className="text-cyan-400">MOBILE ESPORTS</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
