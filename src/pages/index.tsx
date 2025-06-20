import type { NextPage } from "next";
import Head from "next/head";
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack,
  useColorModeValue
} from "@chakra-ui/react";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const router = useRouter();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <>
      <Head>
        <title>LiveCollab - Collaborative PDF Viewer</title>
        <meta name="description" content="Collaborate on PDFs in real-time with LiveCollab" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container maxW="container.xl" minH="100vh" bg={bgColor}>
        <VStack spacing={12} py={20} textAlign="center">
          <Box>
            <Heading size="2xl" mb={6} color="gray.700">
              Welcome to LiveCollab
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Collaborate on PDF documents in real-time. Upload, share, comment, 
              and work together seamlessly with your team.
            </Text>
          </Box>

          <HStack spacing={4}>
            <Button
              size="lg"
              colorScheme="orange"
              onClick={() => router.push('/auth/signup')}
              bg="orange.500"
              _hover={{ bg: 'orange.600' }}
          >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              colorScheme="orange"
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </Button>
          </HStack>

          <Box pt={8}>
            <Text color="gray.500" fontSize="sm">
              Ready to revolutionize your PDF collaboration workflow?
            </Text>
          </Box>
        </VStack>
      </Container>
    </>
  );
};

export default Home;
