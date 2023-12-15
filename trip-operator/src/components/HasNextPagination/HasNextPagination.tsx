import React from "react";
import { Box, IconButton, Text } from "@chakra-ui/react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

export interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onPageChange: (pageNumber: number) => void;
}

export function HasNextPagination({
  currentPage,
  hasNextPage,
  onPageChange,
}: PaginationProps) {
  function handlePageClick(pageNumber: number) {
    onPageChange(pageNumber);
  }

  return (
    <Box mt={4} display="flex" alignItems="center" justifyContent="flex-end">
      <IconButton
        variant="outline"
        hidden={currentPage === 1}
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        aria-label="Previous page"
      >
        <FiArrowLeft />
      </IconButton>
      <Text
        mx={2}
        bg="gray.50"
        borderRadius="50%"
        textAlign="center"
        display="inline-flex"
        justifyContent="center"
        alignItems="center"
        w={4}
        h={4}
        p={6}
      >
        {currentPage}
      </Text>
      {hasNextPage && (
        <IconButton
          variant="outline"
          onClick={() => handlePageClick(currentPage + 1)}
          aria-label="Next page"
        >
          <FiArrowRight />
        </IconButton>
      )}
    </Box>
  );
}
