import "dotenv/config";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import prisma from "@/lib/prisma";

console.log("[socket] DATABASE_URL =", process.env.DATABASE_URL);

const PORT = parseInt(process.env.PORT || "3001");

const app = new Hono();

const httpServer = serve({
  fetch: app.fetch,
  port: PORT,
});

const io = new Server(httpServer as HTTPServer, {
  cors: { origin: "*" },
});

async function handleLeave(opts: { lobbyId: string; userId: string }) {
  const { lobbyId, userId } = opts;
  const lobbyIdNum = Number(lobbyId);
  if (!Number.isInteger(lobbyIdNum)) return;

  const key = `lobby:${lobbyId}`;

  console.log("USER", userId, "LEFT LOBBY", lobbyId);

  const user = await prisma.user.update({
    where: { clerkId: userId },
    data: { lobbyId: null },
  });

  const lobby = await prisma.lobby.findFirst({
    where: { id: lobbyIdNum },
  });

  const updatedPlayers = await prisma.user.findMany({
    where: { lobbyId: lobbyIdNum },
  });

  if (updatedPlayers.length === 0) {
    await prisma.lobby.delete({ where: { id: lobbyIdNum } });
    console.log("LOBBY", { lobbyId }, "IS DELETED");
  }

  if (lobby?.hostId === user?.clerkId) {
    io.to(key).emit("leave-lobby");
  } else {
    io.to(key).emit("lobby-updated", { lobbyId, players: updatedPlayers });
  }
}

io.on("connection", async (socket) => {
  console.log("connected", socket.id);

  const pingTimer = setInterval(() => {
    socket.emit("ping", { message: "ping" });
  }, 30000);

  socket.on(
    "join-lobby",
    async (payload: { lobbyId: string; userId: string }) => {
      const { lobbyId, userId } = payload;
      const key = `lobby:${lobbyId}`;

      socket.data.lobbyId = lobbyId;
      socket.data.userId = userId;

      console.log("USER", userId, "JOINED LOBBY", lobbyId);

      const players = await prisma.user.findMany({
        where: { lobbyId: Number(lobbyId) },
      });

      socket.join(key);
      io.to(key).emit("lobby-updated", { lobbyId, players });
    }
  );

  socket.on(
    "leave-lobby",
    async (payload: { lobbyId: string; userId: string }) => {
      const { lobbyId, userId } = payload;

      const key = `lobby:${lobbyId}`;
      socket.leave(key);

      await handleLeave({ lobbyId, userId });
    }
  );

  socket.on("disconnect", async () => {
    clearInterval(pingTimer);

    const lobbyId = socket.data.lobbyId as string | undefined;
    const userId = socket.data.userId as string | undefined;

    console.log("disconnected", socket.id, lobbyId, userId);

    if (!lobbyId || !userId) return;

    await handleLeave({ lobbyId, userId });
  });
});

httpServer.on("listening", async () => {
  console.log(`Hono server listening on http://localhost:${PORT}`);
});
