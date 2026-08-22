import { Hero } from "@/components/Hero";
import { StorySection } from "@/components/StorySection";
import { TournamentSection } from "@/components/TournamentSection";
import { LiveStreamSection } from "@/components/LiveStreamSection";
import { LiveCommandCenter } from "@/components/LiveCommandCenter";
import { LeaderboardSection } from "@/components/LeaderboardSection";
import { ChampionsSection } from "@/components/ChampionsSection";
import { NewsSection } from "@/components/NewsSection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <StorySection />
      <TournamentSection />
      <LiveStreamSection />
      <LiveCommandCenter />
      <LeaderboardSection />
      <NewsSection />
      <ChampionsSection />
      <Footer />
    </main>
  );
}
