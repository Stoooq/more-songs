export interface Playlists {
		kind: string;
		etag: string;
		nextPageToken?: string;
		pageInfo: {
			totalResults: number;
			resultsPerPage: number;
		};
		items: Array<{
			kind: string;
			etag: string;
			id: string;
			snippet: {
				publishedAt: string;
				channelId: string;
				title: string;
				description: string;
				thumbnails: {
					default: {
						url: string;
						width: number;
						height: number;
					};
					medium: {
						url: string;
						width: number;
						height: number;
					};
					high: {
						url: string;
						width: number;
						height: number;
					};
					standard?: {
						url: string;
						width: number;
						height: number;
					};
					maxres?: {
						url: string;
						width: number;
						height: number;
					};
				};
				channelTitle: string;
				localized: {
					title: string;
					description: string;
				};
			};
			contentDetails: {
				itemCount: number;
			};
		}>;
}

export async function getYouTubePlaylists({
	access_token,
}: {
	access_token: string;
}): Promise<Playlists | null> {
	try {
		const res = await fetch(
			`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=5`,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
					"Content-Type": "application/json",
				},
			}
		);

		if (!res.ok) {
			const err = await res.text();
			console.error("Fetch playlists failed:", err);
			return null;
		}

		return res.json();
	} catch (error) {
		console.error("Something went wrong:", error);
		return null;
	}
}
