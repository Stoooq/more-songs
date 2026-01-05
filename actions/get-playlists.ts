"use server";

import { getYouTubePlaylists } from "@/lib/getYouTubePlaylists";
import { getYouTubeVideos } from "@/lib/getYoutubeVideos";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getPlaylists = async () => {
    const { userId: clerkId } = await auth();
    if (!clerkId) return new Response("Unauthorized", { status: 401 });

    const user = await prisma.user.findFirst({
        where: {
            clerkId: clerkId,
        },
    })

    if (!user) return new Response("No user", { status: 401 });

    const playlists = user.access_token
		? await getYouTubePlaylists({
				access_token: user.access_token,
		  })
		: null;

    const playlistId = playlists && playlists.items[0].id

    const videos = playlistId && user.access_token
    ? await getYouTubeVideos({
				access_token: user.access_token,
        playlistId: playlistId,
		  })
    : null;

    if (videos?.items) {
        videos.items.forEach((video) => {
            const title = video.snippet.title;
            const videoId = video.snippet.resourceId.videoId;
            console.log(`Tytuł: ${title}, ID: ${videoId}`);
        });
    }

    return { videoId: videos ? videos.items[0].snippet.resourceId.videoId : '' }
}