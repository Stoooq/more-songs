"use client";

import { getPlaylists } from "@/actions/get-playlists";
import { AudioPlayer } from "@/components/audio-player";
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
    <div>
      <button onClick={handleVideoId}>Pobierz Video ID</button>

      {videoId && (
        <AudioPlayer
          videoId={videoId}
          duration={100}
          timeLeft={100}
          setIsPlaying={setIsPlaying}
        />
      )}
    </div>
  );
}
