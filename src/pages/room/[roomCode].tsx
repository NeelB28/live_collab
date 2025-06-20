import { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PDFViewer from "@/components/pdf/PDFViewer";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface RoomPageProps {
  documentId?: string;
}

const RoomPage: NextPage<RoomPageProps> = ({ documentId }) => {
  const router = useRouter();
  const { roomCode } = router.query;
  const { user, session } = useAuth();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the actual document from your API
  useEffect(() => {
    const docId = router.query.doc as string;
    if (docId && user && session) {
      fetchDocument(docId);
    } else if (!docId) {
      setError("No document specified");
      setLoading(false);
    }
  }, [router.query.doc, user, session]);

  const fetchDocument = async (docId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the document from your API
      const response = await fetch(`/api/documents/${docId}`, {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Document not found");
        }
        throw new Error("Failed to fetch document");
      }

      const result = await response.json();
      setDocument(result.data);

      console.log("📄 Document loaded:", result.data.title);
      console.log("🔗 File URL:", result.data.fileUrl);
    } catch (err) {
      console.error("Error fetching document:", err);
      setError(err instanceof Error ? err.message : "Failed to load document");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <Container maxW="container.xl" py={8}>
          <VStack spacing={4}>
            <Spinner size="lg" color="orange.500" />
            <Text>Loading document...</Text>
          </VStack>
        </Container>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <Container maxW="container.xl" py={8}>
          <Alert status="error">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">Error loading document</Text>
              <Text fontSize="sm">{error}</Text>
              <Button size="sm" onClick={handleBackToDashboard} mt={2}>
                Back to Dashboard
              </Button>
            </VStack>
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Head>
        <title>
          {document ? document.title : `Room ${roomCode}`} | LiveCollab
        </title>
        <meta
          name="description"
          content={`Collaborative PDF viewing room ${roomCode}`}
        />
      </Head>

      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
          <Container maxW="container.xl">
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <HStack>
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToDashboard}
                  >
                    Dashboard
                  </Button>
                </HStack>
                <Heading size="md" color="gray.700">
                  Room: {roomCode}
                </Heading>
                {document && (
                  <Text fontSize="sm" color="gray.600">
                    {document.title} • {document.fileName}
                  </Text>
                )}
              </VStack>

              <HStack spacing={3}>
                <Text fontSize="sm" color="gray.500">
                  Viewing Mode
                </Text>
              </HStack>
            </HStack>
          </Container>
        </Box>

        {/* PDF Viewer */}
        <Container maxW="container.xl" py={6}>
          {document ? (
            <PDFViewer
              fileUrl={document.fileUrl}
              height="80vh"
              onPageChange={(page) => {
                console.log("Page changed to:", page);
                // Later we'll sync this with other users via Socket.IO
              }}
            />
          ) : (
            <Alert status="info">
              <AlertIcon />
              No document loaded in this room
            </Alert>
          )}
        </Container>
      </Box>
    </ProtectedRoute>
  );
};

export default RoomPage;
