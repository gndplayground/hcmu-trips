/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {PortalProvider, TamaguiProvider, YStack} from 'tamagui';

import config from './tamagui.config';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeScreen} from './screens/Home';
import {LoginScreen} from './screens/Login';
import {useAuthWatcher} from './hooks/auth';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import {AccountScreen} from './screens/Account/Account';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {
  Toast,
  ToastProvider,
  ToastViewport,
  useToastState,
} from '@tamagui/toast';
import {HistoryScreen} from './screens/History';
// import {enableLatestRenderer} from 'react-native-maps';

// enableLatestRenderer();

const Tab = createBottomTabNavigator();
// NativeModules.DevSettings.setIsDebuggingRemotely(false);
const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

function Routes() {
  const {user, isValidating} = useAuthWatcher();

  if (isValidating) {
    return <></>;
  }

  if (!user) {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            if (route.name === 'Account') {
              return <Icon name="user" size={size} color={color} />;
            }

            if (route.name === 'History') {
              return <Icon name="history" size={size} color={color} />;
            }

            return <Icon name="map" size={size} color={color} />;
          },
        })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Account" component={AccountScreen} />
      </Tab.Navigator>
      {/* <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator> */}
    </>
  );
}

const CurrentToast = () => {
  const currentToast = useToastState();

  if (!currentToast || currentToast.isHandledNatively) {
    return null;
  }

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{opacity: 0, scale: 0.5, y: -25}}
      exitStyle={{opacity: 0, scale: 1, y: -20}}
      y={0}
      opacity={1}
      scale={1}
      animation="100ms"
      backgroundColor={
        currentToast.customData?.type === 'error' ? '$red5Light' : undefined
      }
      viewportName={currentToast.viewportName}>
      <YStack>
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && (
          <Toast.Description>{currentToast.message}</Toast.Description>
        )}
      </YStack>
    </Toast>
  );
};

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={config} defaultTheme="light">
          <PortalProvider>
            <ToastProvider>
              <CurrentToast />
              <Routes />
              <ToastViewport />
            </ToastProvider>
          </PortalProvider>
        </TamaguiProvider>
      </QueryClientProvider>
    </NavigationContainer>
  );
}

export default App;
