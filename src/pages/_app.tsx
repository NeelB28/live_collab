import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { AuthProvider } from "@/context/AuthContext";

// Custom theme to match the clean design from your mockups
const theme = extendTheme({
  colors: {
    brand: {
      50: "#fff5f5",
      100: "#fed7d7",
      200: "#feb2b2",
      300: "#fc8181",
      400: "#f56565",
      500: "#e53e3e",
      600: "#c53030",
      700: "#9b2c2c",
      800: "#822727",
      900: "#63171b",
    },
    orange: {
      50: "#fffaf0",
      100: "#feebc8",
      200: "#fbd38d",
      300: "#f6ad55",
      400: "#ed8936",
      500: "#dd6b20", // Main orange color from mockups
      600: "#c05621",
      700: "#9c4221",
      800: "#7b341e",
      900: "#652b19",
    },
  },
  fonts: {
    heading: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
    body: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "orange",
      },
      variants: {
        solid: {
          bg: "orange.500",
          color: "white",
          _hover: {
            bg: "orange.600",
          },
        },
      },
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default MyApp;
