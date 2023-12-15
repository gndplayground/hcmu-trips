import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { CSSReset } from "@chakra-ui/css-reset";
import { ChakraProvider } from "@chakra-ui/react";

import { theme } from "../theme";

export interface AppProviderProps {
  children?: React.ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 5,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      refetchOnWindowFocus: false,
    },
  },
});

function AppProvider(props: AppProviderProps) {
  const { children } = props;
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider
        theme={{
          ...theme,
        }}
        toastOptions={{
          defaultOptions: {
            position: "top-right",
            duration: 6000,
            isClosable: true,
          },
        }}
      >
        <CSSReset />
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default AppProvider;
