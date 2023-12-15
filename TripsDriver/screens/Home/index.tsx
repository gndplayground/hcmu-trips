import * as React from 'react';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {Button, Card, H3, Text, View} from 'tamagui';
import {Dimensions} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  useGetCurrentTrip,
  useGetTripDirections,
  useTripAction,
} from '../../hooks/trip';
import {
  useGetMe,
  useUpdateLocation,
  useUpdateStatus,
} from '../../hooks/account';
import {DriverStatus} from '../../models/user';
import {TripDriverAction, TripStatus} from '../../models/trip';
import {useToast} from '../../hooks/toast';
import {
  checkLocationInSteps,
  checkLocationNearPoint,
  sliceLine,
} from '../../utils/map';
import Icon from 'react-native-vector-icons/FontAwesome';
import {DrivingUI} from './DrivingUI';
import {ConfirmDialog} from '../../components/ConfirmDialog';

const NULL = null;

export function HomeScreen() {
  const [map, setMap] = React.useState<null | MapView>(null);

  const [isFinding, setIsFinding] = React.useState(false);

  // const me = useGetMe();

  const currentTrip = useGetCurrentTrip();

  const updatelocation = useUpdateLocation();

  const isDriving =
    currentTrip.data?.status === TripStatus.DRIVING ||
    currentTrip.data?.status === TripStatus.ON_THE_WAY;

  const [drivingInformation, setDrivingInformation] = React.useState<
    | {
        startCoords: number[];
        type: 'on_the_way' | 'driving';
      }
    | undefined
  >();

  const tripDirections = useGetTripDirections({
    startCoords: drivingInformation?.startCoords,
    tripId: currentTrip.data?.id,
    type:
      currentTrip.data?.status === TripStatus.ON_THE_WAY
        ? 'on_the_way'
        : 'driving',
    enabled: isDriving,
  });

  const toast = useToast();

  const tripAction = useTripAction({
    onSuccess: () => {
      currentTrip.refetch();
      setIsFinding(false);
    },
    onError: error => {
      toast.error(error);
    },
  });

  const updateStatus = useUpdateStatus({
    cb: (status: DriverStatus) => {
      if (status === DriverStatus.AVAILABLE) {
        setIsFinding(true);
      } else {
        setIsFinding(false);
      }
    },
  });

  const [position, setPosition] = React.useState<
    | {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
      }
    | undefined
  >();

  // React.useEffect(() => {
  //   if (isDriving && position && currentTrip?.data?.status) {
  //     if (currentTrip?.data?.status === TripStatus.ON_THE_WAY) {
  //       setDrivingInformation({
  //         startCoords: [position.latitude, position.longitude],
  //         type: 'on_the_way',
  //       });
  //     } else if (currentTrip?.data?.status === TripStatus.DRIVING) {
  //       setDrivingInformation({
  //         startCoords: [position.latitude, position.longitude],
  //         type: 'driving',
  //       });
  //     }
  //   }
  // }, [currentTrip?.data?.status, isDriving, position]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      Geolocation.getCurrentPosition(
        position => {
          setPosition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
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

  React.useEffect(() => {
    if (position && isDriving) {
      updatelocation.mutate([position.latitude, position.longitude]);
    }
  }, [position, updatelocation.mutate, isDriving]);

  const slicedLine = React.useMemo(() => {
    if (tripDirections.data?.raw && position) {
      const result = sliceLine(
        [position?.latitude, position?.longitude],
        tripDirections.data?.raw,
      );

      if (!result) {
        return undefined;
      }

      return result.map(item => {
        return {
          latitude: item[0],
          longitude: item[1],
        };
      });
    }
    return undefined;
  }, [position, tripDirections.data?.raw]);

  React.useEffect(() => {
    if (map && isDriving && position?.latitude && position?.longitude) {
      map.animateCamera(
        {
          center: {
            latitude: position.latitude,
            longitude: position.longitude,
          },
          zoom: 18,
        },
        {
          duration: 500,
        },
      );
    }
  }, [isDriving, map, position?.latitude, position?.longitude]);

  React.useEffect(() => {
    if (
      currentTrip.data &&
      !drivingInformation &&
      position?.latitude &&
      position?.longitude
    ) {
      if (currentTrip.data.status === TripStatus.ON_THE_WAY) {
        setDrivingInformation({
          startCoords: [position.latitude, position.longitude],
          type: 'on_the_way',
        });
      } else if (currentTrip.data.status === TripStatus.DRIVING) {
        setDrivingInformation({
          startCoords: [position.latitude, position.longitude],
          type: 'driving',
        });
      }
    }
  }, [
    currentTrip,
    drivingInformation,
    position?.latitude,
    position?.longitude,
  ]);

  const nowSteps = React.useMemo(() => {
    if (tripDirections.data && position) {
      const steps = tripDirections.data.detail.routes?.[0].legs?.[0].steps;

      if (position) {
        return checkLocationInSteps(steps, [
          position?.latitude,
          position?.longitude,
        ]);
      }
    }

    return NULL;
  }, [position, tripDirections.data]);

  const drivingCoords = React.useMemo(() => {
    if (
      tripDirections.data &&
      tripDirections.data.detail.routes?.[0].legs?.[0] &&
      position
    ) {
      return {
        endAddress:
          tripDirections.data.detail.routes?.[0].legs?.[0].end_address,
        endCoords: [
          tripDirections.data.detail.routes?.[0].legs?.[0].end_location.lat,
          tripDirections.data.detail.routes?.[0].legs?.[0].end_location.lng,
        ],
        isNearEnd: checkLocationNearPoint(
          [position.latitude, position.longitude],
          [
            tripDirections.data.detail.routes?.[0].legs?.[0].end_location.lat,
            tripDirections.data.detail.routes?.[0].legs?.[0].end_location.lng,
          ],
          100,
        ),
      };
    }

    return null;
  }, [position, tripDirections.data]);

  React.useEffect(() => {
    if (
      isDriving &&
      drivingInformation &&
      !nowSteps &&
      position &&
      !tripDirections.isFetching
    ) {
      if (
        drivingInformation.startCoords[0] === position.latitude &&
        drivingInformation.startCoords[1] === position.longitude
      ) {
        return;
      }
      console.log('New route');
      setDrivingInformation({
        startCoords: [position.latitude, position.longitude],
        type: drivingInformation.type,
      });
    }
  }, [
    nowSteps,
    drivingInformation,
    position,
    tripDirections.isFetching,
    isDriving,
  ]);

  React.useEffect(() => {
    //console.log('nowSteps', nowSteps);
    // console.log('tripDirections', tripDirections.data?.route);
  }, [tripDirections.data]);

  async function actionRequest(action: TripDriverAction) {
    if (currentTrip.data && position) {
      try {
        await tripAction.mutateAsync({
          action,
          tripId: currentTrip.data.id,
          coords: [position.latitude, position.longitude],
        });

        if (action === TripDriverAction.REACH_TO) {
          toast.show('Trip completed');
        }
      } catch (error) {
        toast.error(error);
      }
    }
  }

  const isHaveTrip = currentTrip.isFetched && currentTrip.data;

  // console.log(slicedLine);

  return (
    <View>
      <View
        style={{
          position: 'relative',
          // flex: 1,
        }}>
        <MapView
          ref={mapRef => {
            setMap(mapRef);
          }}
          zoomTapEnabled
          // region={position}
          style={{
            // minHeight: Dimensions.get('window').height - 400,
            minHeight: isDriving
              ? Dimensions.get('window').height
              : Dimensions.get('window').height - 400,
            flex: 1,
          }}
          provider={PROVIDER_GOOGLE}
          // followsUserLocation={isDriving}
          showsUserLocation>
          {slicedLine && (
            <Polyline
              coordinates={slicedLine}
              strokeWidth={5}
              strokeColor="#000"
            />
          )}
          {drivingCoords && (
            <Marker
              coordinate={{
                latitude: drivingCoords.endCoords[0],
                longitude: drivingCoords.endCoords[1],
              }}
              title="Destination"
              description="This is the destination">
              <Icon name="map-marker" size={30} color="#000" />
            </Marker>
          )}
        </MapView>
        {/* Driving */}
        {isHaveTrip && isDriving && (
          <>
            <DrivingUI
              isDrivingWithCustomer={
                currentTrip.data?.status === TripStatus.DRIVING
              }
              isRerouting={tripDirections.isFetching}
              nextStep={nowSteps?.nextStep || undefined}
              onCancelTrip={() => {
                actionRequest(TripDriverAction.CANCEL);
              }}
              onWaitForCustomer={() => {
                if (!tripAction.isPending) {
                  actionRequest(TripDriverAction.REACH_START);
                }
              }}
              onCompletedTrip={() => {
                if (!tripAction.isPending) {
                  actionRequest(TripDriverAction.REACH_TO);
                }
              }}
              isNearEnd={drivingCoords?.isNearEnd || false}
              endAddress={
                currentTrip.data?.toAddress || drivingCoords?.endAddress || ''
              }
            />
          </>
        )}

        {/* Find trip */}
        {currentTrip.isFetched && !currentTrip.data && (
          <Card
            elevate
            style={{
              marginTop: 16,
              marginHorizontal: 16,
              padding: 16,
              height: 'auto',
            }}>
            {isFinding && (
              <View
                style={
                  {
                    // height: 200,
                  }
                }>
                <H3>Looking for a drive...</H3>
                <Button
                  onPress={() => {
                    updateStatus.mutate(DriverStatus.OFFLINE);
                  }}
                  disabled={updateStatus.isPending}
                  style={{
                    marginTop: 16,
                  }}>
                  Cancel
                </Button>
              </View>
            )}
            {!isFinding && currentTrip.isFetched && !currentTrip.data && (
              <Button
                disabled={updateStatus.isPending}
                onPress={() => {
                  updateStatus.mutate(DriverStatus.AVAILABLE);
                }}>
                Find Trip
              </Button>
            )}
          </Card>
        )}

        {/* Pending accept */}
        {currentTrip.isFetched &&
          currentTrip.data &&
          currentTrip.data.status === TripStatus.PENDING && (
            <Card
              elevate
              style={{
                padding: 16,
                marginHorizontal: 16,
                marginTop: 16,
              }}>
              <View>
                <H3>We have found a drive!</H3>
                <Text
                  style={{
                    marginTop: 4,
                  }}>
                  To: {currentTrip.data.toAddress}
                </Text>
                <Text
                  style={{
                    marginTop: 4,
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
                  Price: {currentTrip.data.pricePaid.toLocaleString()} vnd /
                  Earn: {currentTrip.data.driverEarn.toLocaleString()} vnd
                </Text>
              </View>
              <View
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                <Button
                  disabled={tripAction.isPending}
                  onPress={() => {
                    actionRequest(TripDriverAction.ACCEPT);
                  }}
                  style={{
                    flex: 1,
                  }}>
                  Accept
                </Button>

                <Button
                  disabled={tripAction.isPending}
                  onPress={() => {
                    actionRequest(TripDriverAction.REJECT);
                  }}
                  theme="red"
                  style={{
                    flex: 1,
                    marginLeft: 16,
                  }}>
                  Reject
                </Button>
              </View>
            </Card>
          )}
        {/* Waiting Customer */}
        {currentTrip.isFetched &&
          currentTrip.data &&
          currentTrip.data.status === TripStatus.WAITING_FOR_CUSTOMER && (
            <Card
              elevate
              style={{
                padding: 16,
                marginHorizontal: 16,
                marginTop: 16,
              }}>
              <View
                display="flex"
                flexDirection="row"
                justifyContent="space-between"
                alignItems="center">
                <Text fontWeight="bold">Waitting for customer</Text>

                <ConfirmDialog
                  title="Cancel Trip"
                  description="Cancel trip will affect your rating"
                  confirmText="Cancel Trip"
                  cancelText="No"
                  onConfirm={() => {
                    actionRequest(TripDriverAction.CANCEL);
                  }}>
                  <Button size="$2" disabled={tripAction.isPending} theme="red">
                    Cancel trip
                  </Button>
                </ConfirmDialog>
              </View>
              <View
                style={{
                  marginTop: 16,
                  display: 'flex',
                  flexDirection: 'row',
                }}>
                <ConfirmDialog
                  title="Begin Trip"
                  description="Are you sure to begin trip?"
                  confirmText="Yes"
                  cancelText="No"
                  onConfirm={() => {
                    actionRequest(TripDriverAction.BEGIN_TRIP);
                  }}>
                  <Button
                    disabled={tripAction.isPending}
                    style={{
                      flex: 1,
                    }}>
                    Customer in vehicle
                  </Button>
                </ConfirmDialog>
              </View>
            </Card>
          )}
      </View>
    </View>
  );
}
