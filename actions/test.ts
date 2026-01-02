"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// export const createuser = async () => {
//   const { userId: clerkId } = await auth();
//   if (!clerkId) return new Response("Unauthorized", { status: 401 });

//   const user = await prisma.user.findUnique({
//     where: { clerkId },
//   });


//   return new Response(JSON.stringify(post), { status: 201 });
// }

// export const createuser = async () => {
//     await prisma.user.create({
//         data: {
//             name: "admin",
//             email: "admin@gmail.com"
//         }
//     })

//     return { success: "test" }
// }