import { NextPage } from "next";
import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { useRouter } from "next/router";
import SignUpForm from "@/components/auth/SignUpForm";

const SignUpPage: NextPage = () => {
  const router = useRouter();

  const handleSwitchToSignIn = () => {
    router.push("/auth/signin");
  };

  return (
    <>
      <Head>
        <title>Sign Up | LiveCollab</title>
        <meta name="description" content="Create your LiveCollab account" />
      </Head>

      <Box minH="100vh" bg="gray.50" py={8}>
        <SignUpForm onSwitchToSignIn={handleSwitchToSignIn} />
      </Box>
    </>
  );
};

export default SignUpPage;
