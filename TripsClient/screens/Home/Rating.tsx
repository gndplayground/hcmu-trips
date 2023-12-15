import {Dimensions} from 'react-native';
import {Button, Card, Text, TextArea, View} from 'tamagui';
import {Rating as RatingStars} from '@kolking/react-native-rating';
import React from 'react';
import {useRateTrip} from '../../hooks/trip';
import {useToast} from '../../hooks/toast';

export function Rating(props: {tripId: number; onClose?: () => void}) {
  const {tripId, onClose} = props;

  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState('');

  const toast = useToast();

  const handleChange = React.useCallback((value: number) => {
    setRating(Math.ceil(value));
  }, []);

  const updateRating = useRateTrip({
    onSuccess: () => {
      toast.show('Trip rated successfully');
      onClose?.();
    },
    onError: error => {
      toast.error(error);
    },
  });

  function handleSubmit() {
    updateRating.mutate({
      tripId,
      rating,
      comment,
    });
  }

  return (
    <View
      left={10}
      width={Dimensions.get('window').width - 20}
      position="absolute"
      zIndex={100}>
      <Card
        elevate
        p="$4"
        bg="white"
        mb="$2"
        height={Dimensions.get('window').height - 150}>
        <Text fontSize="$7" textAlign="center" fontWeight="bold" mt="$2">
          Rate your driver
        </Text>
        <View
          display="flex"
          justifyContent="center"
          mt="$4"
          alignItems="center">
          <RatingStars
            disabled={updateRating.isPending}
            size={40}
            rating={rating}
            onChange={handleChange}
          />
        </View>
        <TextArea
          mt="$4"
          placeholder="Comment"
          disabled={updateRating.isPending}
          onChangeText={comment => {
            setComment(comment);
          }}
        />
        <Button
          mt="$4"
          disabled={updateRating.isPending}
          onPress={handleSubmit}>
          Submit
        </Button>
        <Button
          mt="$4"
          variant="outlined"
          disabled={updateRating.isPending}
          onPress={onClose}>
          Skip
        </Button>
      </Card>
    </View>
  );
}
