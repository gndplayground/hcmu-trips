import {
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Card,
  Box,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { ConfirmModal, HasNextPagination } from "@components";
import { useCancelTrip, useGetListTrip } from "@hooks/trips";
import { TripStatus } from "@models/trip";
import React from "react";
import { FiPlus } from "react-icons/fi";
import { NavLink } from "react-router-dom";

export function Trips() {
  const trips = useGetListTrip();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [cancelId, setCancel] = React.useState<number | undefined>();
  const cancelStrip = useCancelTrip();
  React.useEffect(() => {
    if (currentPage > 1 && trips.data?.data.length === 0) {
      setCurrentPage(1);
    }
  }, [trips.data?.data.length, currentPage]);

  function waitFor(arg0: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, arg0);
    });
  }

  return (
    <Card px={8} py={4}>
      {cancelId && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setCancel(undefined);
          }}
          title="Cancel Trip"
          message="Are you sure you want to cancel this trip?"
          onConfirm={async () => {
            await cancelStrip.mutateAsync({ id: cancelId });
            waitFor(1000);
            await trips.refetch();
            setCancel(undefined);
          }}
        />
      )}

      <Box display="flex" alignItems="center">
        <Heading as="h1" size="xl" mb={4}>
          Trips
        </Heading>
        <Box ml="auto" display="flex">
          {/* <Input placeholder="Search" onChange={handleOnChange} /> */}
          <Box as={NavLink} ml={4} to="/trips/add">
            <IconButton
              aria-label="Add campaign"
              icon={<FiPlus />}
              variant="outline"
            />
          </Box>
        </Box>
      </Box>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Status</Th>
            <Th>Customer</Th>
            <Th>Driver</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {trips.data?.data?.map((trip) => {
            return (
              <Tr key={trip.id}>
                <Td>{trip.id}</Td>
                <Td>{trip.status}</Td>
                <Td>
                  <span>
                    {trip.customer?.name || trip.outsideCustomerFullname} -{" "}
                    {trip.customer?.phone || trip.outsideCustomerPhone}
                  </span>
                  {(trip.customer || trip.outsideCustomerFullname) && (
                    <Box
                      bg={trip.customer ? "blue.500" : "red.500"}
                      color="white"
                      display="flex"
                      w="200px"
                      p="2"
                      borderRadius={4}
                    >
                      {trip.customer ? "App" : "Outside"} Customer
                    </Box>
                  )}
                </Td>
                <Td>
                  {trip.driver?.name} - {trip.driver?.phone}
                </Td>
                <Td>
                  <Box display="flex" gap="$2">
                    <Box as={NavLink} to={`/trips/${trip.id}`}>
                      View
                    </Box>
                    {!trip.customerId &&
                      ![TripStatus.CANCELED, TripStatus.FINISHED].includes(
                        trip.status
                      ) && (
                        <Button
                          size="xs"
                          onClick={() => {
                            setCancel(trip.id);
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                  </Box>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <HasNextPagination
        currentPage={currentPage}
        hasNextPage={trips.data?.meta?.hasNextPage || false}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </Card>
  );
}
