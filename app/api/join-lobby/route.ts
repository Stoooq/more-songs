import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const lobbyId = data.lobbyId;

    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lobby = await prisma.lobby.findFirst({
      where: {
        id: lobbyId,
      },
    });

    if (!lobby) {
      return new NextResponse("No lobby", { status: 401 });
    }

    await prisma.user.update({
      where: {
        clerkId,
      },
      data: {
        lobbyId,
      }
    })

    return NextResponse.json({ lobbyId: lobbyId });
  } catch (err) {
    console.error("Error creating lobby:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
