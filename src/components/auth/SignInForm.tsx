import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Heading,
  Link,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Container,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useRouter } from "next/router";
import { SignInFormData } from "@/types/auth";

interface SignInFormProps {
  onSwitchToSignUp?: () => void;
}

/**
 * Sign in form component with email/password authentication
 * Uses Supabase for authentication backend with orange theme
 */
const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToSignUp }) => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, error, clearError } = useSupabaseAuth();
  const router = useRouter();
  const toast = useToast();

  const handleInputChange =
    (field: keyof SignInFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) clearError();
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(formData.email, formData.password);

      if (result.user) {
        toast({
          title: "Welcome back! 👋",
          description: "You have successfully signed in.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <Container maxW="md" py={8}>
      <Box
        bg="white"
        p={8}
        borderRadius="xl"
        boxShadow="xl"
        border="1px"
        borderColor="gray.100"
      >
        <VStack spacing={6} as="form" onSubmit={handleSubmit}>
          <Box textAlign="center">
            <Heading size="lg" color="gray.700" mb={2}>
              Welcome back
            </Heading>
            <Text color="gray.500">Sign in to your LiveCollab account</Text>
          </Box>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel color="gray.600" fontWeight="medium">
              Email address
            </FormLabel>
            <Input
              type="email"
              value={formData.email}
              onChange={handleInputChange("email")}
              placeholder="Enter your email"
              size="lg"
              bg="gray.50"
              border="1px"
              borderColor="gray.200"
              _hover={{ borderColor: "orange.300" }}
              _focus={{
                borderColor: "orange.500",
                boxShadow: "0 0 0 1px orange.500",
                bg: "white",
              }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel color="gray.600" fontWeight="medium">
              Password
            </FormLabel>
            <InputGroup size="lg">
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange("password")}
                placeholder="Enter your password"
                bg="gray.50"
                border="1px"
                borderColor="gray.200"
                _hover={{ borderColor: "orange.300" }}
                _focus={{
                  borderColor: "orange.500",
                  boxShadow: "0 0 0 1px orange.500",
                  bg: "white",
                }}
              />
              <InputRightElement>
                <IconButton
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={togglePassword}
                  variant="ghost"
                  size="sm"
                  color="gray.500"
                  _hover={{ color: "orange.500" }}
                />
              </InputRightElement>
            </InputGroup>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            width="full"
            isLoading={isLoading}
            loadingText="Signing in..."
            bg="orange.500"
            color="white"
            _hover={{ bg: "orange.600" }}
            _active={{ bg: "orange.700" }}
            borderRadius="lg"
            fontWeight="semibold"
          >
            Sign In
          </Button>

          <Divider />

          <Box textAlign="center">
            <Text color="gray.600" fontSize="sm">
              Don't have an account?{" "}
              <Link
                color="orange.500"
                fontWeight="medium"
                onClick={onSwitchToSignUp}
                _hover={{ textDecoration: "underline", color: "orange.600" }}
                cursor="pointer"
              >
                Sign up
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default SignInForm;
