"use client";

import { useEffect, useRef } from "react";
import YouTube, { YouTubeProps } from "react-youtube";
import { Slider } from "./ui/slider";

export function AudioPlayer({
  videoId,
  duration,
  timeLeft,
  setIsPlaying,
}: {
  videoId: string;
  duration: number;
  timeLeft: number;
  setIsPlaying: (isPlaying: boolean) => void;
}) {
  const playerRef = useRef<YT.Player | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasStartedFadeOut = useRef(false);

  const onPlayerReady: YouTubeProps["onReady"] = (event) => {
    playerRef.current = event.target;
    event.target.playVideo();
    setIsPlaying(true);
  };

  const startFadeOut = () => {
    if (!playerRef.current) return;

    let currentVolume = 100;
    const fadeSteps = 20;
    const fadeInterval = 2000 / fadeSteps;
    const volumeDecrement = currentVolume / fadeSteps;

    fadeIntervalRef.current = setInterval(() => {
      currentVolume -= volumeDecrement;

      if (currentVolume <= 0) {
        currentVolume = 0;
        if (playerRef.current) {
          playerRef.current.setVolume(0);
        }
        clearFadeInterval();
      } else {
        if (playerRef.current) {
          playerRef.current.setVolume(Math.round(currentVolume));
        }
      }
    }, fadeInterval);
  };

  const clearFadeInterval = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }
  };

  useEffect(() => {
    if (timeLeft <= 2 && !hasStartedFadeOut.current) {
      hasStartedFadeOut.current = true;
      startFadeOut();
    }
  }, [timeLeft]);

  useEffect(() => {
    hasStartedFadeOut.current = false;
  }, [videoId]);

  useEffect(() => {
    return () => {
      clearFadeInterval();
    };
  }, []);

  const opts: YouTubeProps["opts"] = {
    height: "0",
    width: "0",
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      rel: 0,
    },
  };

  const progressPercentage = ((duration - timeLeft) / duration) * 100;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-6xl">Music is playing</div>

      <div className="w-full max-w-md">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <Slider
            value={[progressPercentage]}
            min={0}
            max={100}
            disabled={true}
          />
        </div>
      </div>

      <div className="text-sm">Time: {timeLeft}</div>

      <div className="rounded-lg">
        <YouTube videoId={videoId} opts={opts} onReady={onPlayerReady} />
      </div>
    </div>
  );
}
