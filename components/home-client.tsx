"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomeClient() {
  const [lobbyId, setLobbyId] = useState<string>("");
  const [playlistUrl, setPlaylistUrl] = useState<string>("");
  const [rounds, setRounds] = useState<number>(3);
  const router = useRouter();

  const createLobby = async () => {
    console.log("create lobby");
    let playlistId: string | null = null;

    if (playlistUrl.trim()) {
      try {
        const urlObj = new URL(playlistUrl);
        playlistId = urlObj.searchParams.get("list");
      } catch {
        console.error("Invalid playlist URL");
      }
    }

    try {
      const response = await fetch("/api/create-lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlistId,
          rounds
        }),
      });
      const data = await response.json();
      if (data.lobbyId) {
        console.log("Lobby created:", data.lobbyId);
        router.push("/lobby");
      }
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  };

  const joinLobby = async () => {
    console.log("join lobby");
    try {
      const response = await fetch("/api/join-lobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lobbyId: Number(lobbyId),
        }),
      });
      const data = await response.json();
      if (data.lobbyId) {
        console.log("Joining lobby:", data.lobbyId);
        router.push("/lobby");
      }
    } catch (error) {
      console.error("Failed to join lobby:", error);
    }
  };

  return (
    <>
      <div className="text-7xl font-bold">More songs</div>
      <div className="flex w-full gap-12">
        <div className="flex-1">
          <div className="flex flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Playlist URL (optional)"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="number"
              placeholder="Enter number of rounds"
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="border p-2 w-full mb-2"
            />
          </div>
          <Button
            className="w-full text-xl font-bold p-8"
            onClick={createLobby}
          >
            Create lobby
          </Button>
        </div>
        <div className="flex-1">
          <input
            type="number"
            placeholder="Enter Lobby ID"
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
            className="border p-2 w-full"
          />
          <Button
            className="w-full text-xl font-bold p-8 mt-2"
            onClick={joinLobby}
          >
            Join lobby
          </Button>
        </div>
      </div>

      <div className="text-xl">
        <p>
          Welcome to <span className="font-bold">More Songs</span>! This is a
          multiplayer game where you compete to guess the song first.
        </p>
        <p className="mt-4">
          Create a lobby to start a new game with friends, or join an existing
          one with a code. Correctly identify tracks from your favorite
          playlists to earn points and win!
        </p>
      </div>
    </>
  );
}
