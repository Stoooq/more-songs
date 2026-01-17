import HomeClient from "@/components/home-client";
import LeaderboardTable from "@/components/leaderboard-table";

export const dynamic = "force-dynamic";

export default async function Home() {
  return (
    <div className="w-250 mx-auto flex flex-col gap-12">
      <HomeClient />
      <LeaderboardTable />
    </div>
  );
}
