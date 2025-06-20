import { useState } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Heading,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Divider,
  Code,
} from "@chakra-ui/react";

export default function TestAuth() {
  const { user, loading, error, signUp, signIn, signOut, clearError } =
    useSupabaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Debug info
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const handleSubmit = async () => {
    if (mode === "signup") {
      await signUp(email, password, fullName);
    } else {
      await signIn(email, password);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setEmail("");
    setPassword("");
    setFullName("");
  };

  if (loading) {
    return (
      <Box p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" p={8}>
      <Heading mb={6}>🔐 Auth Test</Heading>

      {/* Debug Information */}
      <Alert status="info" mb={4}>
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontSize="sm">Debug Info:</Text>
          <Text fontSize="xs">
            Supabase URL:{" "}
            {supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "❌ Missing"}
          </Text>
          <Text fontSize="xs">
            Anon Key:{" "}
            {supabaseAnonKey
              ? `${supabaseAnonKey.substring(0, 20)}...`
              : "❌ Missing"}
          </Text>
        </VStack>
      </Alert>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
          <Button size="sm" ml={2} onClick={clearError}>
            Clear
          </Button>
        </Alert>
      )}

      {user ? (
        <VStack spacing={4}>
          <Alert status="success">
            <AlertIcon />✅ Signed in as: {user.email}
          </Alert>

          <Text>User ID: {user.id}</Text>
          <Text>Name: {user.user_metadata?.full_name || "Not set"}</Text>

          <Button colorScheme="red" onClick={handleSignOut}>
            Sign Out
          </Button>
        </VStack>
      ) : (
        <VStack spacing={4}>
          <Box>
            <Button
              variant={mode === "signin" ? "solid" : "ghost"}
              onClick={() => setMode("signin")}
              mr={2}
            >
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "solid" : "ghost"}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </Button>
          </Box>

          <Divider />

          {mode === "signup" && (
            <FormControl>
              <FormLabel>Full Name</FormLabel>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </FormControl>
          )}

          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </FormControl>

          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </FormControl>

          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={!email || !password || (mode === "signup" && !fullName)}
            width="full"
          >
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </VStack>
      )}
    </Box>
  );
}
