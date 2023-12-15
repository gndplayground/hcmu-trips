import { Box, Button, Card, Heading, IconButton } from "@chakra-ui/react";
import { config } from "@configs";
import { useGetTrip } from "@hooks/trips";
import GoogleMap from "google-maps-react-markers";
import React from "react";
import { FiArrowLeft, FiUser, FiActivity } from "react-icons/fi";
import { NavLink, useParams } from "react-router-dom";

const defaultProps = {
  center: {
    lat: 10.824863616860624,
    lng: 106.62824239703451,
  },
  zoom: 12,
};

const Point = (props: {
  lat: number;
  lng: number;
  address?: string;
  isEnd?: boolean;
}) => {
  const { onClear, onSet, address } = props;
  return (
    <Box
      borderRadius="50%"
      display="inline-flex"
      justifyItems="center"
      alignItems="center"
      p={2}
      bgColor="white"
      color="red"
      fontSize="24px"
    >
      {props.isEnd ? <FiActivity /> : <FiUser />}
    </Box>
  );
};

export function TripDetail() {
  const params = useParams();

  const id = Number(params.id);

  const trip = useGetTrip({
    id,
  });

  const mapRef = React.useRef<google.maps.Map>(null);
  const mapsRef = React.useRef<typeof google.maps>(null);

  const tripData = trip.data?.data?.trip;
  const tripPointsStart = trip.data?.data?.start;
  const tripPointsTo = trip.data?.data?.to;

  const onGoogleApiLoaded = ({
    map,
    maps,
  }: {
    map: google.maps.Map;
    maps: typeof google.maps;
  }) => {
    mapRef.current = map;
    mapsRef.current = maps;
  };

  return (
    <Card px={8} py={4}>
      <Box display="flex" alignItems="center" mb={4}>
        <Box mr="8px" display="flex">
          <Box as={NavLink} to="/">
            <IconButton
              aria-label="Add campaign"
              icon={<FiArrowLeft />}
              variant="outline"
            />
          </Box>
        </Box>
        <Heading as="h1" size="xl">
          Trip detail
        </Heading>
      </Box>
      {tripData && (
        <>
          <p>
            <b>To</b>: {tripData.toAddress}
          </p>
          <p>
            <b>Trip</b>: {((tripData.distance || 0) / 1000).toFixed(2)} km
          </p>
          <p>
            <b>Price</b>: {tripData.pricePaid.toLocaleString()} VND
          </p>
          <p>
            <b>Driver earn</b>: {tripData.driverEarn.toLocaleString()} VND
          </p>
          {tripData.rating && (
            <p>
              <b>Rating</b>: {tripData.rating}
            </p>
          )}
          {tripData.ratingComment && (
            <p>
              <b>Rating comment</b>: {tripData.ratingComment}
            </p>
          )}

          <Box h={600} mt={4} pos="relative">
            <GoogleMap
              apiKey={config.GOOGLE_MAP_API_KEY}
              defaultCenter={{
                lat: defaultProps.center.lat,
                lng: defaultProps.center.lng,
              }}
              defaultZoom={defaultProps.zoom}
              onGoogleApiLoaded={onGoogleApiLoaded}
            >
              {tripPointsStart && (
                <Point lat={tripPointsStart.lat} lng={tripPointsStart.lng} />
              )}
              {tripPointsTo && (
                <Point lat={tripPointsTo.lat} lng={tripPointsTo.lng} isEnd />
              )}
            </GoogleMap>
          </Box>
        </>
      )}
    </Card>
  );
}
