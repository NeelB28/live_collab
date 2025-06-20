import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/client";
import { prisma, handlePrismaError } from "@/lib/database/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST"],
    });
  }

  try {
    // Get user from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verify the token with Supabase
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Check if user already exists in Prisma database
    let dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    // If user doesn't exist, create them
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id, // Use the same ID from Supabase
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name,
        },
      });
      console.log("✅ User created in database:", dbUser.id);
    } else {
      console.log("👤 User already exists in database:", dbUser.id);
    }

    res.status(200).json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
      },
      message: "User synchronized successfully",
    });
  } catch (error) {
    console.error("Error synchronizing user:", error);
    res.status(500).json({
      error: handlePrismaError(error),
      timestamp: new Date().toISOString(),
    });
  }
}
