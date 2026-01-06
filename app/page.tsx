"use client";

import { getPlaylists } from "@/actions/get-playlists";
import { AudioPlayer } from "@/components/audio-player";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Home() {
  const [videoId, setVideoId] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(true);

  const handleVideoId = async () => {
    const data = await getPlaylists();
    if ("videoId" in data && data.videoId) {
      setVideoId(data.videoId);
    }
  };

  return (
    <>
      <div className="w-250 mx-auto flex flex-col gap-12">
        <div className="text-7xl font-bold">More songs</div>
        <div className="flex w-full gap-12">
          <Button className="flex-1 text-xl font-bold p-8">Create lobby</Button>
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
