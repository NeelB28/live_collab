import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/lib/supabase/client";
import { prisma, handlePrismaError } from "@/lib/database/prisma";

interface DocumentData {
  title: string;
  fileName: string;
  fileUrl: string; // Firebase download URL
  fileSize: number;
  mimeType: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    return handleCreateDocument(req, res);
  } else if (req.method === "GET") {
    return handleGetDocuments(req, res);
  } else {
    return res.status(405).json({
      error: "Method not allowed",
      allowedMethods: ["POST", "GET"],
    });
  }
}

/**
 * Create a new document record
 */
async function handleCreateDocument(req: NextApiRequest, res: NextApiResponse) {
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

    // Validate request body
    const { title, fileName, fileUrl, fileSize, mimeType }: DocumentData =
      req.body;

    if (!title || !fileName || !fileUrl || !mimeType) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["title", "fileName", "fileUrl", "mimeType"],
      });
    }

    // Validate that fileUrl is a valid Firebase Storage URL
    if (!fileUrl.includes("firebase") && !fileUrl.includes("googleapis.com")) {
      return res.status(400).json({
        error: "Invalid file URL. Must be a Firebase Storage URL.",
      });
    }

    // Create document in database
    const document = await prisma.document.create({
      data: {
        title,
        fileName,
        fileUrl, // Firebase download URL
        fileSize: fileSize || 0,
        mimeType,
        userId: user.id,
      },
    });

    console.log("✅ Document created with Firebase URL:", {
      id: document.id,
      title: document.title,
      fileUrl: document.fileUrl,
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document created successfully",
    });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({
      error: handlePrismaError(error),
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Get user's documents
 */
async function handleGetDocuments(req: NextApiRequest, res: NextApiResponse) {
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

    // Get user's documents
    const documents = await prisma.document.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({
      error: handlePrismaError(error),
      timestamp: new Date().toISOString(),
    });
  }
}
