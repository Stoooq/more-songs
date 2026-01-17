"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "@clerk/nextjs";
import { AudioPlayer } from "@/components/audio-player";

type PlayerScore = {
  id: string;
  name: string;
  points: number;
};

type GamePhase = "waiting" | "playing" | "revealing" | "finished";

export default function Game() {
  const router = useRouter();
  const socket = getSocket();
  const { userId } = useAuth();

  const [lobbyId, setLobbyId] = useState<string>("");

  const [phase, setPhase] = useState<GamePhase>("waiting");
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [musicId, setMusicId] = useState<string>("");
  const [musicTitle, setMusicTitle] = useState<string>("");
  const [musicsTitles, setMusicsTitles] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const [guess, setGuess] = useState("");
  const [lastAnswer, setLastAnswer] = useState<string | null>(null);

  const [scores, setScores] = useState<PlayerScore[]>([]);

  const sortedScores = useMemo(
    () => [...scores].sort((a, b) => b.points - a.points),
    [scores],
  );

  const suggestions = useMemo(() => {
    if (!guess.trim()) return [];
    const parts = guess
      .toLowerCase()
      .split(" ")
      .filter((p) => p.length > 0);
    if (parts.length === 0) return [];

    return musicsTitles.filter((title) => {
      const lowerTitle = title.toLowerCase();
      return (
        parts.every((part) => lowerTitle.includes(part)) &&
        title.toLowerCase() !== guess.toLowerCase()
      );
    });
  }, [guess, musicsTitles]);

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

    const onGameStarted = (payload: {
      lobbyId: string;
      round: number;
      timeLeft: number;
      scores: PlayerScore[];
      musicId: string;
      musicTitle: string;
      musicsTitles: string[];
    }) => {
      setPhase("playing");
      setRound(payload.round);
      setTimeLeft(payload.timeLeft);
      setScores(payload.scores);
      setLastAnswer(null);
      setGuess("");
      setMusicId(payload.musicId);
      setMusicTitle(payload.musicTitle);
      setMusicsTitles(payload.musicsTitles);
    };

    const onTick = (payload: {
      lobbyId: string;
      round: number;
      timeLeft: number;
    }) => {
      setTimeLeft(payload.timeLeft);
    };

    const onRoundReveal = (payload: {
      lobbyId: string;
      round: number;
      answer: string;
    }) => {
      setPhase("revealing");
      setLastAnswer(payload.answer);
    };

    const onScoresUpdated = (payload: {
      lobbyId: string;
      scores: PlayerScore[];
    }) => {
      setScores(payload.scores);
    };

    const onGameFinished = (payload: {
      lobbyId: string;
      scores: PlayerScore[];
    }) => {
      setPhase("finished");
      setScores(payload.scores);
      router.push("/lobby");
    };

    socket.on("game-started", onGameStarted);
    socket.on("game-tick", onTick);
    socket.on("round-reveal", onRoundReveal);
    socket.on("scores-updated", onScoresUpdated);
    socket.on("game-finished", onGameFinished);

    return () => {
      socket.off("game-started", onGameStarted);
      socket.off("game-tick", onTick);
      socket.off("round-reveal", onRoundReveal);
      socket.off("scores-updated", onScoresUpdated);
      socket.off("game-finished", onGameFinished);
    };
  }, [lobbyId, userId, socket, router]);

  const submitGuess = () => {
    const value = guess.trim();
    if (!value || !lobbyId || !userId) return;

    socket.emit("submit-guess", {
      lobbyId,
      userId,
      guess: value,
      correctAnswer: musicTitle,
    });

    setGuess("");
  };

  return (
    <div className="w-250 mx-auto flex flex-col gap-12">
      <div className="text-7xl font-bold">Game</div>

      <div className="flex flex-col gap-6 p-8 border rounded-xl bg-card text-card-foreground shadow-s">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold opacity-70">Round</h2>
            <div className="text-6xl font-mono font-bold tracking-widest text-primary">
              {round}
            </div>
          </div>

          <div className="flex flex-col gap-2 text-right">
            <h2 className="text-2xl font-bold opacity-70">Time left</h2>
            <div className="text-6xl font-mono font-bold tracking-widest">
              {phase === "playing" ? timeLeft : "—"}
            </div>
          </div>
        </div>

        <div className="text-xl opacity-80">
          {phase === "waiting" && "Waiting for the host to start the game..."}
          {phase === "playing" && "Listen to the snippet and type your guess."}
          {phase === "revealing" && "Round ended. Answer revealed below."}
          {phase === "finished" && "Game finished. Final scores below."}
        </div>
      </div>

      <div>
        {musicId && (
          <AudioPlayer
            videoId={musicId}
            duration={30}
            timeLeft={timeLeft}
            setIsPlaying={setIsPlaying}
          />
        )}
      </div>

      <div className="flex flex-col gap-6 p-8 border rounded-xl bg-card text-card-foreground shadow-s">
        <h3 className="text-2xl font-bold opacity-70">Your guess</h3>

        <div className="flex gap-4">
          <div className="relative w-full">
            <input
              className="border p-4 w-full text-lg rounded-md"
              placeholder={
                phase === "playing"
                  ? "Type song title / artist..."
                  : "Round is not active"
              }
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitGuess();
              }}
              disabled={phase !== "playing"}
              autoComplete="off"
            />
            {suggestions.length > 0 && phase === "playing" && (
              <ul className="absolute top-full left-0 w-full bg-card text-card-foreground border border-border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto mt-1">
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 hover:bg-muted cursor-pointer"
                    onClick={() => setGuess(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Button
            className="text-xl font-bold px-8"
            onClick={submitGuess}
            disabled={phase !== "playing" || !guess.trim()}
          >
            Submit
          </Button>
        </div>

        {lastAnswer && (
          <div className="text-lg">
            <div className="opacity-70">Answer:</div>
            <div className="text-2xl font-bold">{musicTitle}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-6 p-8 border rounded-xl bg-card text-card-foreground shadow-s">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold opacity-70">Scoreboard</h3>
          <div className="opacity-70 text-sm">Highest score wins</div>
        </div>

        <ul className="flex flex-col gap-3">
          {sortedScores.map((p, idx) => (
            <li
              key={p.id}
              className="flex items-center justify-between border rounded-md p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 text-center font-mono text-xl opacity-70">
                  {idx + 1}
                </div>
                <div className="text-xl font-bold">{p.name}</div>
              </div>
              <div className="text-2xl font-mono font-bold">{p.points}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
