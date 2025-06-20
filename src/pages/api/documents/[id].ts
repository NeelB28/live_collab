import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/client";
import { prisma, handlePrismaError } from "@/lib/database/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["GET"],
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

    // Get document ID from URL params
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ error: "Document ID is required" });
    }

    // Fetch the document from database
    const document = await prisma.document.findFirst({
      where: {
        id: id,
        userId: user.id, // Ensure user owns the document
      },
    });

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    console.log("📄 Document fetched:", document.title);

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({
      error: handlePrismaError(error),
      timestamp: new Date().toISOString(),
    });
  }
}
