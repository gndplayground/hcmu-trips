import * as React from 'react';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthStore} from '../stores/auth';
import {useNavigation} from '@react-navigation/native';

export function useLogout() {
  const setAuthStore = useAuthStore(state => state.set);
  async function logout() {
    try {
      await AsyncStorage.removeItem('user');
      await Keychain.resetGenericPassword();
    } catch (e) {
      console.log(e);
    }
    setAuthStore(state => {
      state.isValidating = false;
      state.user = undefined;
      state.token = undefined;
    });
  }
  return {
    logout,
  };
}

export function useAuthWatcher() {
  const {isValidating, user} = useAuthStore(state => {
    return {
      user: state.user,
      isValidating: state.isValidating,
    };
  });
  const setAuthStore = useAuthStore(state => state.set);

  const navigate = useNavigation();

  const validate = React.useCallback(async () => {
    try {
      const token = await Keychain.getGenericPassword({});
      const userParse = JSON.parse((await AsyncStorage.getItem('user')) || '');
      if (!token || !userParse) {
        throw new Error('No token or user');
      }
      setAuthStore(state => {
        state.token = token.password;
        state.user = userParse;
        state.isValidating = false;
      });
    } catch (e) {
      await AsyncStorage.removeItem('user');
      await Keychain.resetGenericPassword();
      setAuthStore(state => {
        state.isValidating = false;
        state.user = undefined;
        state.token = undefined;
      });
    } finally {
      setAuthStore(state => {
        state.isValidating = false;
      });
    }
  }, [setAuthStore]);

  React.useEffect(() => {
    validate();
  }, [validate]);

  React.useEffect(() => {
    if (isValidating) {
      return;
    } else if (!user) {
      console.log('No user, navigating to login');
      navigate.navigate('Login');
    } else {
      console.log('User found, navigating to home');
      navigate.navigate('Home');
    }
  }, [isValidating, navigate, user]);

  return {
    isValidating,
    user,
  };
}
