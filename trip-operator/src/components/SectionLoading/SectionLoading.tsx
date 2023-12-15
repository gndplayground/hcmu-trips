import { Box, Spinner } from "@chakra-ui/react";
import React from "react";

export function SectionLoading() {
  return (
    <Box
      minH="150px"
      maxW="lg"
      mx="auto"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Box>
  );
}
