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
import { SignUpFormData } from "@/types/auth";

interface SignUpFormProps {
  onSwitchToSignIn?: () => void;
}

/**
 * Sign up form component with email/password authentication
 * Uses Supabase for authentication backend with orange theme
 */
const SignUpForm: React.FC<SignUpFormProps> = ({ onSwitchToSignIn }) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, error, clearError } = useSupabaseAuth();
  const router = useRouter();
  const toast = useToast();

  const handleInputChange =
    (field: keyof SignUpFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (error) clearError();
    };

  const validateForm = (): boolean => {
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (result.user) {
        toast({
          title: "Account created! 🎉",
          description: "Please check your email to verify your account.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);

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
              Create account
            </Heading>
            <Text color="gray.500">
              Join LiveCollab and start collaborating
            </Text>
          </Box>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Text fontSize="sm">{error}</Text>
            </Alert>
          )}

          <FormControl isRequired>
            <FormLabel color="gray.600" fontWeight="medium">
              Full name
            </FormLabel>
            <Input
              value={formData.fullName}
              onChange={handleInputChange("fullName")}
              placeholder="Enter your full name"
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

          <FormControl isRequired>
            <FormLabel color="gray.600" fontWeight="medium">
              Confirm password
            </FormLabel>
            <InputGroup size="lg">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                placeholder="Confirm your password"
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
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  icon={showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={toggleConfirmPassword}
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
            loadingText="Creating account..."
            bg="orange.500"
            color="white"
            _hover={{ bg: "orange.600" }}
            _active={{ bg: "orange.700" }}
            borderRadius="lg"
            fontWeight="semibold"
          >
            Create Account
          </Button>

          <Divider />

          <Box textAlign="center">
            <Text color="gray.600" fontSize="sm">
              Already have an account?{" "}
              <Link
                color="orange.500"
                fontWeight="medium"
                onClick={onSwitchToSignIn}
                _hover={{ textDecoration: "underline", color: "orange.600" }}
                cursor="pointer"
              >
                Sign in
              </Link>
            </Text>
          </Box>
        </VStack>
      </Box>
    </Container>
  );
};

export default SignUpForm;
