import {Button, Card, Input, ScrollView, Text, View} from 'tamagui';
import * as React from 'react';
import {Dimensions} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {debounce} from 'tamagui';
import {
  useCancelTrip,
  useCreateTrip,
  useGetCurrentDriverRoute,
  useGetCurrentTrip,
  useGetTripSearchLocation,
} from '../../hooks/trip';
import Icon from 'react-native-vector-icons/FontAwesome';
import {Place, ResultLocation, TripStatus} from '../../models/trip';
import {useToast} from '../../hooks/toast';
import {decodeRoute, decodeRouteToPolyLines, sliceLine} from '../../utils/map';
import {DrivingUI} from './DrivingUI';
import {Rating} from './Rating';
import {usePrevious} from '../../hooks/utils';

export function HomeScreen() {
  const toast = useToast();
  const [map, setMap] = React.useState<null | MapView>(null);
  const [textValue, setTextValue] = React.useState('');
  const [searchText, setSearchText] = React.useState('');
  const searchTextDeferred = React.useDeferredValue(textValue);
  const [selectedLocation, setSelectedLocation] = React.useState<
    ResultLocation | Place | undefined
  >();
  const [position, setPosition] = React.useState<
    | {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }
    | undefined
  >();

  const [isOpenRating, setOpenRating] = React.useState<number | undefined>();

  const currentTrip = useGetCurrentTrip();

  const prevCurrentTrip = usePrevious(currentTrip.data);

  const driverRoute = useGetCurrentDriverRoute(
    {
      tripId: currentTrip.data?.id,
    },
    {
      enabled: Boolean(currentTrip.data?.id),
    },
  );

  const searchResults = useGetTripSearchLocation({
    search: searchText,
    enabled: !!searchTextDeferred && searchTextDeferred.length > 2,
  });

  const createTrip = useCreateTrip({
    onSuccess: () => {
      toast.show('Trip created');
      currentTrip.refetch();
    },
    onError: error => {
      toast.error(error);
    },
  });

  const cancelTrip = useCancelTrip({
    onSuccess: () => {
      toast.show('Trip canceled');
      currentTrip.refetch();
    },
    onError: error => {
      toast.error(error);
    },
  });

  function onChangeText(text: string) {
    setTextValue(text);
  }

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        p => {
          setPosition({
            latitude: p.coords.latitude,
            longitude: p.coords.longitude,
            latitudeDelta: 0.001,
            longitudeDelta: 0.001,
          });
        },
        error => {
          console.log(error.code, error.message);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const debouncedSearch = React.useCallback(
    debounce((text: string) => {
      setSearchText(text);
    }, 300),
    [],
  );

  React.useEffect(() => {
    if (textValue.length > 2) {
      debouncedSearch(textValue);
    }
  }, [debouncedSearch, textValue]);

  const isDriving =
    currentTrip.data?.status === TripStatus.DRIVING ||
    currentTrip.data?.status === TripStatus.ON_THE_WAY;

  const routeDecode = React.useMemo(() => {
    if (driverRoute.data?.route && driverRoute.data?.route.routes[0]) {
      return {
        raw: decodeRoute(
          driverRoute.data.route.routes[0]?.overview_polyline.points,
        ),
        route: decodeRouteToPolyLines(
          driverRoute.data.route.routes[0]?.overview_polyline.points,
        ),
      };
    }
  }, [driverRoute?.data?.route]);

  const slicedLine = React.useMemo(() => {
    if (routeDecode && driverRoute.data) {
      const result = sliceLine(
        [driverRoute.data?.location.lat, driverRoute.data?.location.lng],
        routeDecode.raw,
      );

      if (!result) {
        return;
      }

      return result.map(item => {
        return {
          latitude: item[0],
          longitude: item[1],
        };
      });
    }
    return;
  }, [driverRoute.data, routeDecode]);

  React.useEffect(() => {
    if (
      selectedLocation &&
      !isDriving &&
      !currentTrip.data &&
      !currentTrip.isFetching
    ) {
      map?.animateCamera({
        center: {
          latitude: selectedLocation.geometry.location.lat,
          longitude: selectedLocation.geometry.location.lng,
        },
        zoom: 18,
      });
    }
  }, [
    currentTrip.data,
    isDriving,
    map,
    selectedLocation,
    currentTrip.isFetching,
  ]);

  React.useEffect(() => {
    if (isDriving && driverRoute.data && driverRoute.data.location) {
      map?.animateCamera({
        center: {
          latitude: driverRoute.data.location.lat,
          longitude: driverRoute.data.location.lng,
        },
        zoom: 18,
      });
    }
  }, [driverRoute.data, isDriving, map]);

  React.useEffect(() => {
    console.log('prevCurrentTrip', prevCurrentTrip);
    if (
      prevCurrentTrip &&
      !currentTrip.data &&
      !currentTrip.isFetching &&
      prevCurrentTrip.status === TripStatus.DRIVING
    ) {
      setOpenRating(prevCurrentTrip.id);
    }
  }, [currentTrip.data, currentTrip.isFetching, prevCurrentTrip]);

  const isSelectingLocationStep = !currentTrip.data;
  const isWaitingForCustomer =
    currentTrip.data?.status === TripStatus.WAITING_FOR_CUSTOMER;

  return (
    <View position="relative">
      {isSelectingLocationStep && !selectedLocation && !currentTrip.data && (
        <Card elevate p="$4" bg="white" mb="$5">
          <View>
            <View display="flex" flexDirection="row" alignItems="center">
              <View h={10} w={10} borderRadius={5} bg="$blue10Light" />
              <Text ml="$3">From current location</Text>
            </View>
            <View display="flex" flexDirection="row" alignItems="center">
              <Icon name="map-marker" size={20} color="red" />
              <Input
                ml="$2"
                flex={1}
                mt="$2"
                placeholder="Where to?"
                onChangeText={onChangeText}
              />
            </View>
          </View>
          <ScrollView mt="$3">
            {textValue &&
              textValue.length > 2 &&
              searchResults.data?.geocodes?.map(item => {
                return (
                  <View
                    key={item.place_id}
                    mb="$2"
                    onPress={() => {
                      setSelectedLocation(item);
                    }}>
                    <Text>{item.formatted_address}</Text>
                  </View>
                );
              })}
            {textValue &&
              textValue.length > 2 &&
              searchResults.data?.places?.map(item => {
                return (
                  <View
                    key={item.place_id}
                    mb="$2"
                    onPress={() => {
                      setSelectedLocation(item);
                    }}>
                    <Text>
                      {item.name} {item.formatted_address}
                    </Text>
                  </View>
                );
              })}
          </ScrollView>
        </Card>
      )}

      {isSelectingLocationStep && selectedLocation && !currentTrip.data && (
        <Card elevate mt="$5" p="$4" bg="white" mb="$5">
          <View>
            <Text fontWeight="bold" fontSize="$5">
              Confirm go to this location
            </Text>
            <Text>
              {(selectedLocation as Place)?.name
                ? `${(selectedLocation as Place).name}, `
                : ''}
              {selectedLocation.formatted_address}{' '}
            </Text>
            <View
              style={{
                marginTop: 16,
                display: 'flex',
                flexDirection: 'row',
              }}>
              <Button
                disabled={createTrip.isPending}
                onPress={() => {
                  setSelectedLocation(undefined);
                }}
                theme="red"
                style={{
                  flex: 1,
                }}>
                Reject
              </Button>
              <Button
                disabled={createTrip.isPending}
                onPress={() => {
                  if (!position) {
                    return;
                  }
                  createTrip.mutate({
                    startCoords: [position.latitude, position.longitude],
                    toCoords: [
                      selectedLocation.geometry.location.lat,
                      selectedLocation.geometry.location.lng,
                    ],
                    toAddress: `${
                      (selectedLocation as Place)?.name
                        ? `${(selectedLocation as Place)?.name}, `
                        : ''
                    } ${selectedLocation.formatted_address}`,
                  });
                }}
                ml="$2"
                style={{
                  flex: 1,
                }}>
                Accept
              </Button>
            </View>
          </View>
        </Card>
      )}

      {/* {currentTrip.data && (
        <Card elevate mt="$2" p="$4" bg="white" mb="$2">
          <View>
            <View>
              <View>
                <Text fontWeight="bold" fontSize="$5">
                  {currentTrip.data.status === TripStatus.PENDING &&
                    'Waiting for driver accept...'}
                  {currentTrip.data.status === TripStatus.AVAILABLE &&
                    'Finding your driver...'}
                  {currentTrip.data.status === TripStatus.ON_THE_WAY &&
                    'The driver is on the way. Please frequently check your phone'}
                </Text>
              </View>
              {isDriving && (
                <ConfirmDialog
                  title="Cancel Trip"
                  cancelText="No"
                  confirmText="Cancel trip"
                  onConfirm={() => {
                    if (!currentTrip.data) {
                      return;
                    }
                    cancelTrip.mutate({
                      tripId: currentTrip.data?.id,
                    });
                  }}
                  description="Cancel trip will affect your rating">
                  <Button size="$2" ml="auto" theme="red">
                    Cancel trip
                  </Button>
                </ConfirmDialog>
              )}
            </View>

            {!isDriving && (
              <>
                <Text
                  style={{
                    marginTop: 8,
                  }}>
                  Trip: {((currentTrip.data.distance || 0) / 1000).toFixed(2)}{' '}
                  km
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                  }}>
                  Trip time: {(currentTrip.data.estimated / 60).toFixed(0)}{' '}
                  minutes
                </Text>
                <Text
                  fontWeight="bold"
                  style={{
                    marginTop: 8,
                  }}>
                  Price: {currentTrip.data.pricePaid.toLocaleString()} vnd
                </Text>
                <View
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    flexDirection: 'row',
                  }}>
                  <ConfirmDialog
                    title="Cancel Trip"
                    cancelText="No"
                    confirmText="Cancel trip"
                    onConfirm={() => {
                      if (!currentTrip.data) {
                        return;
                      }
                      cancelTrip.mutate({
                        tripId: currentTrip.data?.id,
                      });
                    }}
                    description="Cancel trip will affect your rating">
                    <Button
                      theme="red"
                      style={{
                        flex: 1,
                      }}>
                      Cancel
                    </Button>
                  </ConfirmDialog>
                </View>
              </>
            )}
          </View>
        </Card>
      )} */}

      <View position="relative">
        <MapView
          ref={mapRef => {
            setMap(mapRef);
          }}
          zoomTapEnabled
          region={position}
          style={{
            // minHeight: Dimensions.get('window').height - 350,
            minHeight:
              isWaitingForCustomer || isDriving
                ? Dimensions.get('window').height
                : Dimensions.get('window').height - 350,
            flex: 1,
          }}
          provider={PROVIDER_GOOGLE}
          // followsUserLocation={isDriving}
          showsUserLocation={!currentTrip.data}>
          {selectedLocation && !isDriving && (
            <Marker
              coordinate={{
                latitude: selectedLocation.geometry.location.lat,
                longitude: selectedLocation.geometry.location.lng,
              }}
              title="Destination"
              description="This is the destination">
              <Icon name="map-marker" size={30} color="red" />
            </Marker>
          )}
          {currentTrip.data && (
            <Marker
              coordinate={{
                latitude: currentTrip.data.startLat,
                longitude: currentTrip.data.startLng,
              }}
              title="Destination"
              description="This is the destination">
              <Icon name="map-marker" size={30} color="blue" />
            </Marker>
          )}
          {currentTrip.data && (
            <Marker
              coordinate={{
                latitude: currentTrip.data.toLat,
                longitude: currentTrip.data.toLng,
              }}
              title="Destination"
              description="This is the destination">
              <Icon name="map-marker" size={30} color="red" />
            </Marker>
          )}
          {slicedLine && (
            <Polyline
              coordinates={slicedLine}
              strokeWidth={5}
              strokeColor="#000"
            />
          )}
          {driverRoute.data && driverRoute.data.location && (
            <Marker
              coordinate={{
                latitude: driverRoute.data.location.lat,
                longitude: driverRoute.data.location.lng,
              }}
              title="Driver"
              description="This is the driver location">
              <View>
                <Icon name="car" size={20} color="red" />
              </View>
            </Marker>
          )}
        </MapView>
        <DrivingUI
          onCancelTrip={() => {
            if (!currentTrip.data) {
              return;
            }
            cancelTrip.mutate({
              tripId: currentTrip.data?.id,
            });
          }}
          trip={currentTrip.data}
          isDriving={isDriving}
        />
      </View>

      {isOpenRating && (
        <Rating
          tripId={isOpenRating}
          onClose={() => {
            setOpenRating(undefined);
          }}
        />
      )}
    </View>
  );
}
