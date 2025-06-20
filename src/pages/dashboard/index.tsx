import { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  GridItem,
  Badge,
  IconButton,
  useToast,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { AddIcon, ExternalLinkIcon, DownloadIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/supabase/auth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useFileUpload } from "@/hooks/useFileUpload";
import FileUpload from "@/components/ui/FileUpload";
import { useState, useEffect } from "react";
import { getFileUrl } from "@/lib/firebase/storage";

interface Document {
  id: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

const DashboardPage: NextPage = () => {
  const { user, session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { uploading } = useFileUpload();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's session token
      const response = await fetch("/api/documents", {
        headers: {
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }

      const result = await response.json();
      setDocuments(result.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleUploadSuccess = async (
    filePath: string,
    fileName: string,
    fileSize: number
  ) => {
    if (!user) return;

    try {
      // Get Firebase download URL
      const { url: fileUrl, error: urlError } = await getFileUrl(filePath);

      if (urlError || !fileUrl) {
        throw new Error(urlError || "Failed to get file URL");
      }

      // Create document record in database
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || ""}`,
        },
        body: JSON.stringify({
          title: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
          fileName: fileName,
          fileUrl: fileUrl, // Firebase download URL
          fileSize: fileSize, // This would need to be passed from the upload
          mimeType: "application/pdf",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save document");
      }

      toast({
        title: "Document uploaded successfully!",
        status: "success",
        duration: 5000,
      });

      // Refresh documents list
      fetchDocuments();
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error saving document",
        description: error instanceof Error ? error.message : "Unknown error",
        status: "error",
        duration: 5000,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <Head>
        <title>Dashboard | LiveCollab</title>
        <meta name="description" content="Your LiveCollab dashboard" />
      </Head>

      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <Box bg="white" borderBottom="1px" borderColor="gray.200" py={4}>
          <Container maxW="container.xl">
            <HStack justify="space-between">
              <Box>
                <Heading size="lg" color="gray.700">
                  Dashboard
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Welcome back, {user?.user_metadata?.full_name || user?.email}!
                </Text>
              </Box>
              <HStack spacing={3}>
                <Button
                  leftIcon={<AddIcon />}
                  colorScheme="orange"
                  onClick={onOpen}
                  size="md"
                >
                  Upload PDF
                </Button>
                <Button variant="outline" onClick={handleSignOut} size="md">
                  Sign Out
                </Button>
              </HStack>
            </HStack>
          </Container>
        </Box>

        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Stats */}
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={6}
            >
              <GridItem>
                <Box
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Stat>
                    <StatLabel>Total Documents</StatLabel>
                    <StatNumber color="orange.500">
                      {documents.length}
                    </StatNumber>
                    <StatHelpText>PDF files uploaded</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>
              <GridItem>
                <Box
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <Stat>
                    <StatLabel>Member Since</StatLabel>
                    <StatNumber fontSize="lg">
                      {formatDate(user?.created_at || "")}
                    </StatNumber>
                    <StatHelpText>Account created</StatHelpText>
                  </Stat>
                </Box>
              </GridItem>
            </Grid>

            <Divider />

            {/* Documents Section */}
            <Box>
              <HStack justify="space-between" mb={6}>
                <Heading size="md" color="gray.700">
                  Your Documents
                </Heading>
                {documents.length > 0 && (
                  <Button
                    leftIcon={<AddIcon />}
                    variant="outline"
                    colorScheme="orange"
                    onClick={onOpen}
                    size="sm"
                  >
                    Upload New
                  </Button>
                )}
              </HStack>

              {loading ? (
                <Text>Loading documents...</Text>
              ) : documents.length === 0 ? (
                <Box
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  shadow="sm"
                  border="1px"
                  borderColor="gray.200"
                >
                  <VStack spacing={4}>
                    <Text fontSize="lg" color="gray.600">
                      No documents yet
                    </Text>
                    <Text color="gray.500">
                      Upload your first PDF to start collaborating
                    </Text>
                    <Button
                      leftIcon={<AddIcon />}
                      colorScheme="orange"
                      onClick={onOpen}
                    >
                      Upload Your First PDF
                    </Button>
                  </VStack>
                </Box>
              ) : (
                <Grid
                  templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
                  gap={6}
                >
                  {documents.map((doc) => (
                    <GridItem key={doc.id}>
                      <Box
                        _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        bg="white"
                        p={6}
                        borderRadius="lg"
                        shadow="sm"
                        border="1px"
                        borderColor="gray.200"
                      >
                        <HStack justify="space-between">
                          <Text fontWeight="semibold" noOfLines={1}>
                            {doc.title}
                          </Text>
                          <IconButton
                            aria-label="Open document"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            // Navigate to the room with document
                            onClick={() => {
                              router.push(`/room/temp-room?doc=${doc.id}`);
                            }}
                          />
                        </HStack>
                        <VStack align="start" spacing={2} mt={4}>
                          <HStack spacing={2}>
                            <Badge colorScheme="orange" variant="subtle">
                              PDF
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {formatFileSize(doc.fileSize)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" noOfLines={1}>
                            {doc.fileName}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Uploaded {formatDate(doc.uploadedAt)}
                          </Text>
                        </VStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              )}
            </Box>
          </VStack>
        </Container>

        {/* Upload Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Upload PDF Document</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                disabled={uploading}
                onUploadError={(error) => {
                  toast({
                    title: "Upload failed",
                    description: error,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                  });
                }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </ProtectedRoute>
  );
};

export default DashboardPage;
