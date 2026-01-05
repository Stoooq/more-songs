import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const { id } = evt.data;
    const provider = 'external_accounts' in evt.data 
      ? evt.data.external_accounts[0]?.provider 
      : null;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );

    const client = await clerkClient()

    let accessToken = null;
    try {
      if (id && provider) {
        const clerkResponse = await client.users.getUserOauthAccessToken(id, provider as any);
        accessToken = clerkResponse.data[0]?.token || null;
      }
    } catch (tokenError) {
      console.warn("Could not fetch OAuth token immediately (this is normal for new users):", tokenError);
    }
    console.log("Access token", accessToken)

    if (eventType === "user.created") {
      const { id, email_addresses, first_name } = evt.data;
      // console.log(evt.data)
      await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          access_token: accessToken,
          name: first_name,
          email: email_addresses[0].email_address
        },
        create: {
          clerkId: id,
          email: email_addresses[0].email_address,
          name: first_name,
          access_token: accessToken,
        },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", { status: 400 });
  }
}