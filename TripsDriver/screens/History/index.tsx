import React from 'react';
import {Card, Text, View, Button, Dialog} from 'tamagui';
import {useGetHistory} from '../../hooks/history';
import {FlatList} from 'react-native';
import {Rating as RatingStars} from '@kolking/react-native-rating';
import {TripStatus} from '../../models/trip';
import Icon from 'react-native-vector-icons/FontAwesome';

export function HistoryScreen() {
  const trips = useGetHistory();

  const [open, setOpen] = React.useState(false);

  return (
    <View>
      {trips.data && (
        <Card elevate m={16} p={16}>
          <FlatList
            data={trips.data}
            renderItem={({item}) => (
              <View
                mb="$4"
                borderBottomWidth={1}
                pb="$2"
                borderBottomColor="$gray10Light">
                <View display="flex" flexDirection="row">
                  <View>
                    <Text fontSize="$2">
                      {new Date(item.createdAt).toLocaleDateString()}{' '}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                    <Text mt="$1">
                      Trip distance{' '}
                      <Text fontWeight="bold">
                        {Math.max(item.distance / 1000, 0.1).toFixed(2)}
                      </Text>{' '}
                      km
                    </Text>
                    {item.rating && (
                      <View
                        display="flex"
                        mt="$1"
                        flexDirection="row"
                        alignItems="center">
                        <RatingStars size={16} rating={item.rating} />

                        {item.ratingComment && (
                          <Dialog
                            modal
                            onOpenChange={open => {
                              setOpen(open);
                            }}>
                            <Dialog.Trigger asChild>
                              <Button ml="$2" size="$2">
                                Rating comment
                              </Button>
                            </Dialog.Trigger>

                            <Dialog.Portal>
                              <Dialog.Overlay
                                key="overlay"
                                animation="quick"
                                opacity={0.5}
                                enterStyle={{opacity: 0}}
                                exitStyle={{opacity: 0}}
                              />

                              <Dialog.Content
                                bordered
                                elevate
                                key="content"
                                animateOnly={['transform', 'opacity']}
                                animation={[
                                  'quick',
                                  {
                                    opacity: {
                                      overshootClamping: true,
                                    },
                                  },
                                ]}
                                enterStyle={{
                                  x: 0,
                                  y: -20,
                                  opacity: 0,
                                  scale: 0.9,
                                }}
                                exitStyle={{
                                  x: 0,
                                  y: 10,
                                  opacity: 0,
                                  scale: 0.95,
                                }}
                                gap="$4">
                                <Dialog.Title>Rating comment</Dialog.Title>
                                <Dialog.Description width={300}>
                                  {item.ratingComment}
                                </Dialog.Description>

                                <Dialog.Close asChild>
                                  <Button
                                    position="absolute"
                                    top="$3"
                                    right="$3"
                                    size="$2"
                                    circular
                                    icon={
                                      <View>
                                        <Icon name="close" />
                                      </View>
                                    }
                                  />
                                </Dialog.Close>
                              </Dialog.Content>
                            </Dialog.Portal>
                          </Dialog>
                        )}
                      </View>
                    )}
                  </View>
                  <View ml="auto">
                    {item.status === TripStatus.FINISHED && (
                      <Text
                        fontSize="$5"
                        fontWeight="bold"
                        color="$green10Light">
                        +{item.driverEarn.toLocaleString()} vnd
                      </Text>
                    )}
                    {(item.status === TripStatus.CANCELED ||
                      item.status === TripStatus.CANCELED_BY_DRIVER) && (
                      <Text fontSize="$5" fontWeight="bold" color="$red10Light">
                        Canceled
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}
          />
        </Card>
      )}
    </View>
  );
}
