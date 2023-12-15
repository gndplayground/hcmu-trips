import * as React from 'react';

import {Button, View, Card} from 'tamagui';
import {useLogout} from '../../hooks/auth';

export function AccountScreen() {
  const {logout} = useLogout();
  return (
    <View
      style={{
        padding: 16,
      }}>
      <Card
        elevate
        style={{
          padding: 16,
          marginTop: 20,
          borderRadius: 20,
        }}>
        <Button
          style={{marginTop: 20}}
          onPress={() => {
            logout();
          }}>
          Logout
        </Button>
      </Card>
    </View>
  );
}
