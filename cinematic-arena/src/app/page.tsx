import { Hero } from "@/components/Hero";
import { StorySection } from "@/components/StorySection";
import { TournamentSection } from "@/components/TournamentSection";
import { LiveCommandCenter } from "@/components/LiveCommandCenter";
import { LeaderboardSection } from "@/components/LeaderboardSection";
import { ChampionsSection } from "@/components/ChampionsSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <StorySection />
      <TournamentSection />
      <LiveCommandCenter />
      <LeaderboardSection />
      <ChampionsSection />
      <Footer />
    </main>
  );
}
