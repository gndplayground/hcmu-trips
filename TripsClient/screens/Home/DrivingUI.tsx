import React from 'react';
import {Trip, TripStatus} from '../../models/trip';
import {Card, View, Text, Button} from 'tamagui';
import {ConfirmDialog} from '../../components/ConfirmDialog';
import {Dimensions} from 'react-native';

export interface DrivingUIProps {
  trip?: Trip | null;
  isDriving?: boolean;
  onCancelTrip: () => void;
}

export function DrivingUI(props: DrivingUIProps) {
  const {trip, isDriving, onCancelTrip} = props;

  const isWaitingForCustomer = trip?.status === TripStatus.WAITING_FOR_CUSTOMER;

  return (
    <>
      {trip && (isWaitingForCustomer || isDriving) && (
        <View pos="absolute" zIndex={100} top={0} right={0} left={0} px={8}>
          <Card elevate mt="$2" p="$4" bg="white" mb="$2">
            <View flexDirection="row">
              <View pr="$4" maxWidth={250}>
                <Text fontWeight="bold">
                  {isWaitingForCustomer &&
                    'The driver has arrived. Please get in the vehicle!'}
                  {trip.status === TripStatus.ON_THE_WAY &&
                    'The driver is on the way. Please frequently check your phone'}
                  {trip.status === TripStatus.DRIVING &&
                    'The driver is on the way'}
                </Text>
              </View>
              <ConfirmDialog
                title="Cancel Trip"
                cancelText="No"
                confirmText="Cancel trip"
                onConfirm={() => {
                  onCancelTrip();
                }}
                description="Cancel trip will affect your rating">
                <Button size="$2" ml="auto" theme="red">
                  Cancel trip
                </Button>
              </ConfirmDialog>
            </View>
            <Text mt="$2">Your driver: {trip?.driver?.name}</Text>
            <Text fontWeight="bold">
              {trip.driver?.vehicleModel} - {trip.driver?.vehicleNumber}
            </Text>
          </Card>
        </View>
      )}
      {trip && (isWaitingForCustomer || isDriving) && (
        <View
          pos="absolute"
          zIndex={100}
          top={Dimensions.get('window').height - 220}
          right={0}
          left={0}
          px={8}>
          <Card elevate p="$4" bg="white" mb="$2">
            <Text fontSize="$2" mt="$2">
              <Text fontWeight="bold">To</Text>: {trip.toAddress}
            </Text>
          </Card>
        </View>
      )}
      {trip && !isWaitingForCustomer && !isDriving && (
        <Card elevate mt="$2" p="$4" bg="white" mb="$2">
          <View>
            <View>
              <View>
                <Text fontWeight="bold" fontSize="$5">
                  {trip.status === TripStatus.PENDING &&
                    'Waiting for driver accept...'}
                  {trip.status === TripStatus.AVAILABLE &&
                    'Finding your driver...'}
                </Text>
              </View>
              {isDriving && (
                <ConfirmDialog
                  title="Cancel Trip"
                  cancelText="No"
                  confirmText="Cancel trip"
                  onConfirm={() => {
                    onCancelTrip();
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
                  Trip: {((trip.distance || 0) / 1000).toFixed(2)} km
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                  }}>
                  Trip time: {(trip.estimated / 60).toFixed(0)} minutes
                </Text>
                <Text
                  fontWeight="bold"
                  style={{
                    marginTop: 8,
                  }}>
                  Price: {trip.pricePaid.toLocaleString()} vnd
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
                    onConfirm={onCancelTrip}
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
      )}
    </>
  );
}
