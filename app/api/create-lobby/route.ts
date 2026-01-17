import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    const { playlistId, rounds } = await request.json();
    const { userId: clerkId } = await auth();
    console.log(clerkId)
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkId,
      },
    });
    console.log(user)
    if (!user) {
      return new NextResponse("User not found", { status: 401 });
    }

    const lobby = await prisma.lobby.create({
      data: {
        hostId: user.clerkId,
        playlistId: playlistId || null,
        rounds: rounds
      },
    });
    console.log(lobby)

    await prisma.user.update({
      where: { clerkId },
      data: { lobbyId: lobby.id },
    });
    console.log("Lobby created and user updated");

    return NextResponse.json({ lobbyId: lobby.id });
  } catch (err) {
    console.error("Error creating lobby:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
