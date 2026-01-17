import prisma from "@/lib/prisma";

type LeaderboardRow = {
  name: string | null;
  globalPoints: number;
};

export default async function LeaderboardTable() {
  const users: LeaderboardRow[] = await prisma.user.findMany({
    select: {
      name: true,
      globalPoints: true,
    },
    orderBy: [{ globalPoints: "desc" }, { name: "asc" }],
  });

  return (
    <div className="mt-8">
      <h3 className="font-bold mb-2 text-lg">Ranking</h3>
      <div className="border rounded">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 w-16">#</th>
              <th className="text-left p-3">Username</th>
              <th className="text-right p-3 w-40">Global points</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={`${user.name ?? "anon"}-${index}`}
                className="border-b last:border-b-0"
              >
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{user.name ?? "—"}</td>
                <td className="p-3 text-right">{user.globalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
