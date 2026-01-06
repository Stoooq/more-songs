import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";
import type { Server as HTTPServer } from "node:http";
import dotenv from "dotenv";

dotenv.config();

const PORT = parseInt(process.env.PORT || "3001");

const app = new Hono();

const httpServer = serve({
    fetch: app.fetch,
    port: PORT,
});

const io = new Server(httpServer as HTTPServer, {
    cors: {
        origin: "*",
    },
});

io.on("connection", async (socket) => {
    console.log("connected", socket.id);

    setInterval(() => {
        socket.emit("ping", { message: "ping" });
    }, 30000);

    socket.on(
        "join-lobby",
        async (payload: { lobbyId: string; userId: string; userName: string }) => {
            const { lobbyId, userId, userName } = payload;
            const user = { userId, userName, points: 0 };
            const key = `lobby:${lobbyId}`;

            console.log("USER", userName, "JOINED LOBBY", lobbyId);
            

            socket.join(lobbyId);
            io.to(lobbyId).emit("lobby-updated", { lobbyId });
        }
    );

    socket.on("disconnect", async () => {
        console.log("disconected", socket.id);
    });
});

httpServer.on("listening", async () => {
    console.log(`Hono server listening on http://localhost:${PORT}`);
});