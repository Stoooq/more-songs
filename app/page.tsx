"use client";

import { getPlaylists } from "@/actions/get-playlists";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(true);
  const router = useRouter()

  const handleVideoId = async () => {
    const data = await getPlaylists();
    if ("videoId" in data && data.videoId) {
      setVideoId(data.videoId);
    }
  };

  const createLobby = async () => {
    console.log("xxxx")
    try {
      const response = await fetch("/api/create-lobby", {
        method: "POST",
      });
      const data = await response.json();
      if (data.lobbyId) {
        console.log("Lobby created:", data.lobbyId);
        router.push("/lobby")
      }
    } catch (error) {
      console.error("Failed to create lobby:", error);
    }
  };

  return (
    <>
      <div className="w-250 mx-auto flex flex-col gap-12">
        <div className="text-7xl font-bold">More songs</div>
        <div className="flex w-full gap-12">
          <Button className="flex-1 text-xl font-bold p-8" onClick={createLobby}>Create lobby</Button>
          <Button className="flex-1 text-xl font-bold p-8">Join lobby</Button>
        </div>
        {/* <button onClick={handleVideoId}>Pobierz Video ID</button> */}

        {videoId && (
          <AudioPlayer
            videoId={videoId}
            duration={100}
            timeLeft={100}
            setIsPlaying={setIsPlaying}
          />
        )}

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

        <div className="mt-8 text-lg">
          <h3 className="font-bold mb-2">Coming soon:</h3>
          <ul className="list-disc pl-5">
            <li>Global leaderboards</li>
            <li>Custom playlist support</li>
            <li>Voice chat integration</li>
            <li>Tournament mode</li>
          </ul>
        </div>
      </div>
    </>
  );
}
