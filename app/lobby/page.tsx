"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@clerk/nextjs";
import { User } from "../generated/prisma/client";

export default function Lobby() {
  const [lobbyId, setLobbyId] = useState<string>("");
  const [players, setPlayers] = useState<User[]>([]);
  const { userId } = useAuth();
  const socket = getSocket();
  const router = useRouter();

  const getLobby = async () => {
    const response = await fetch("/api/get-lobbyid", { method: "GET" });
    const data = await response.json();
    if (data.lobbyId) setLobbyId(String(data.lobbyId));
  };

  useEffect(() => {
    getLobby();
  }, []);

  useEffect(() => {
    if (!lobbyId || !userId) return;

    socket.emit("join-lobby", { lobbyId, userId });
    socket.on(
      "lobby-updated",
      ({ players }: { lobbyId: string; players: User[] }) => {
        setPlayers(players);
      }
    );
    socket.on("leave-lobby", () => {
      socket.emit("leave-lobby", { lobbyId, userId });
      router.push("/")
    });

    return () => {
      socket.off("lobby-updated");
      socket.off("leave-lobby");
    };
  }, [lobbyId, userId, socket]);

  const handleBackToMenu = () => {
    if (lobbyId && userId) socket.emit("leave-lobby", { lobbyId, userId });
    router.push("/");
  };

  return (
    <div className="w-250 mx-auto flex flex-col gap-12">
      <div className="text-7xl font-bold">Lobby</div>

      <div className="flex flex-col gap-6 p-8 border rounded-xl bg-card text-card-foreground shadow-s">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold opacity-70">Game Code</h2>
          <div className="text-6xl font-mono font-bold tracking-widest text-primary">
            {lobbyId || (
              <span className="text-muted-foreground animate-pulse">...</span>
            )}
          </div>
        </div>

        <div className="text-xl opacity-80">
          Waiting for other players to join...
        </div>
      </div>

      <div className="flex w-full gap-12">
        <Button className="flex-1 text-xl font-bold p-8" disabled={!lobbyId}>
          Start Game
        </Button>
        <Button
          className="flex-1 text-xl font-bold p-8"
          variant="outline"
          onClick={handleBackToMenu}
        >
          Back to Menu
        </Button>
      </div>

      <div className="mt-8 text-lg">
        <h3 className="font-bold mb-2">Players:</h3>
        <ul className="list-disc pl-5 opacity-70">
          {players.map((player) => (
            <div key={player.id}>{player.name}</div>
          ))}
        </ul>
      </div>
    </div>
  );
}
