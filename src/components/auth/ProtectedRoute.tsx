import { ReactNode, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { Box, Spinner, Center, VStack, Text } from "@chakra-ui/react";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Protected route wrapper component
 * Redirects unauthenticated users to sign-in page
 * Shows loading spinner while checking authentication
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/auth/signin",
  fallback,
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      fallback || (
        <Center h="100vh" bg="gray.50">
          <VStack spacing={4}>
            <Spinner size="xl" color="orange.500" thickness="4px" />
            <Text color="gray.600">Loading...</Text>
          </VStack>
        </Center>
      )
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
