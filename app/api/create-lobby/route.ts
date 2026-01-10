import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        clerkId,
      },
    });

    if (!user) {
      return new NextResponse("user not found", { status: 401 });
    }

    const lobby = await prisma.lobby.create({
      data: {
        hostId: user.clerkId,
      },
    });

    await prisma.user.update({
      where: { clerkId },
      data: { lobbyId: lobby.id },
    });

    return NextResponse.json({ lobbyId: lobby.id });
  } catch (err) {
    console.error("Error creating lobby:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
