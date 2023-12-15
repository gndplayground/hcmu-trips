import React from 'react';
import {Card, Text, View} from 'tamagui';
import {useGetHistory} from '../../hooks/history';
import {FlatList} from 'react-native';
import {TripStatus} from '../../models/trip';

export function HistoryScreen() {
  const trips = useGetHistory();

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
                    <Text fontWeight="bold"># {item.id}</Text>
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
                    <Text mt="$1">
                      Paid{' '}
                      <Text fontWeight="bold">
                        {item.pricePaid.toLocaleString()}
                      </Text>{' '}
                      vnd
                    </Text>
                  </View>
                  <View ml="auto">
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
