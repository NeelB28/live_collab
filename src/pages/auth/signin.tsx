import { NextPage } from "next";
import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import SignInForm from "@/components/auth/SignInForm";

const SignInPage: NextPage = () => {
  const router = useRouter();

  const handleSwitchToSignUp = () => {
    router.push("/auth/signup");
  };

  return (
    <>
      <Head>
        <title>Sign In | LiveCollab</title>
        <meta name="description" content="Sign in to your LiveCollab account" />
      </Head>

      <Box minH="100vh" bg="gray.50" py={8}>
        <SignInForm onSwitchToSignUp={handleSwitchToSignUp} />
      </Box>
    </>
  );
};

export default SignInPage;
