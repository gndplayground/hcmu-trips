import React from 'react';
import {
  Card,
  Spinner,
  Text,
  View,
  Button,
  AlertDialog,
  YStack,
  XStack,
} from 'tamagui';
import {Step} from '../../models/map';
import {Dimensions} from 'react-native';
import {convert} from 'html-to-text';

export interface DrivingUIProps {
  isRerouting?: boolean;
  nextStep?: Step;
  onCancelTrip?: () => void;
  isNearEnd?: boolean;
  onWaitForCustomer?: () => void;
  isDrivingWithCustomer?: boolean;
  onCompletedTrip?: () => void;
  isPending?: boolean;
  endAddress?: string;
}

export function DrivingUI(props: DrivingUIProps) {
  const {
    isRerouting,
    nextStep,
    onCancelTrip,
    isNearEnd,
    onWaitForCustomer,
    isDrivingWithCustomer,
    onCompletedTrip,
    isPending,
    endAddress,
  } = props;
  return (
    <>
      {isRerouting && (
        <View
          style={{
            paddingLeft: 8,
            paddingRight: 8,
            position: 'absolute',
            top: 4,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 999,
          }}>
          <Card
            elevate
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
            <View display="flex" flexDirection="row" alignItems="flex-start">
              <Spinner />
              <Text ml="$2" fontWeight="bold">
                Rerouting...
              </Text>
            </View>
          </Card>
        </View>
      )}

      <View
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          position: 'absolute',
          top: 10,
          left: 0,
          right: 50,
          zIndex: 999,
          elevation: 999,
        }}>
        <Card
          elevate
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
          <Text fontWeight="bold">
            {isDrivingWithCustomer ? 'To destination' : 'Pickup customer'}
          </Text>
          <Text mt="$2" fontSize="$2">
            {endAddress}
          </Text>
        </Card>
      </View>

      <View
        style={{
          paddingLeft: 16,
          paddingRight: 16,
          position: 'absolute',
          bottom: -(Dimensions.get('window').height - 135),
          left: 0,
          right: 0,
          zIndex: 999,
          elevation: 999,
        }}>
        <Card
          elevate
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
          <View
            display="flex"
            flexDirection="row"
            justifyContent="space-between"
            alignItems="center">
            <Text fontWeight="bold">Next</Text>
            <View display="flex" flexDirection="row" gap="$2">
              {isNearEnd && !isDrivingWithCustomer && (
                <Button size="$2" onPress={onWaitForCustomer}>
                  Wait for customer
                </Button>
              )}
              {isNearEnd && isDrivingWithCustomer && (
                <Button
                  size="$2"
                  onPress={onCompletedTrip}
                  disabled={isPending}>
                  Complete trip
                </Button>
              )}

              <AlertDialog native>
                <AlertDialog.Trigger asChild>
                  <Button theme="red" size="$2" disabled={isPending}>
                    Cancel Trip
                  </Button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay
                    key="overlay"
                    animation="quick"
                    opacity={0.5}
                    enterStyle={{opacity: 0}}
                    exitStyle={{opacity: 0}}
                  />
                  <AlertDialog.Content
                    bordered
                    elevate
                    key="content"
                    animation={[
                      'quick',
                      {
                        opacity: {
                          overshootClamping: true,
                        },
                      },
                    ]}
                    enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
                    exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
                    x={0}
                    scale={1}
                    opacity={1}
                    y={0}>
                    <YStack space>
                      <AlertDialog.Title>Cancel Trip</AlertDialog.Title>
                      <AlertDialog.Description>
                        Cancel trip will affect your rating
                      </AlertDialog.Description>

                      <XStack space="$3" justifyContent="flex-end">
                        <AlertDialog.Cancel asChild>
                          <Button>No</Button>
                        </AlertDialog.Cancel>
                        <AlertDialog.Action asChild onPress={onCancelTrip}>
                          <Button
                            theme="active"
                            onPress={onCancelTrip}
                            disabled={isPending}>
                            Cancel trip
                          </Button>
                        </AlertDialog.Action>
                      </XStack>
                    </YStack>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog>
            </View>
          </View>
          <Text mt="$2" fontSize="$2" fontWeight="bold">
            {convert(nextStep?.html_instructions || '').split('\n')[0]}
          </Text>
        </Card>
      </View>
    </>
  );
}
