import * as React from 'react';
import {View} from 'react-native';
import {useForm} from 'react-hook-form';
import {Button, H1, Text} from 'tamagui';
import {API_HOST} from '@env';
import axios from 'axios';
import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ValidateInput} from '../../components/ValidateInput';
import {useAuthStore} from '../../stores/auth';
import {Role, User} from '../../models/user';

export function LoginScreen() {
  const [error, setError] = React.useState('');
  const setAuthStore = useAuthStore(state => state.set);
  const {
    handleSubmit,
    control,
    formState: {errors},
  } = useForm();

  async function onSubmit(data: any) {
    setError('');
    try {
      const result = await axios.post<{
        data: {
          token: string;
          user: User;
        };
      }>(`${API_HOST}/auth/login-stateless`, {
        email: data.email,
        password: data.password,
      });

      if (result.data.data.user.role !== Role.USER) {
        setError('You are not a customer');
        return;
      }

      await Keychain.setGenericPassword(
        result.data.data.user.email,
        result.data.data.token,
      );
      await AsyncStorage.setItem('user', JSON.stringify(result.data.data.user));
      setAuthStore(state => {
        state.token = result.data.data.token;
        state.user = result.data.data.user;
        state.isValidating = false;
      });
    } catch (e: any) {
      console.log(e, `${API_HOST}/auth/login-stateless`);
      setError(
        e.response?.data?.message || e.message || 'Something went wrong',
      );
    }
  }

  return (
    <View
      style={{
        paddingVertical: 24,
        paddingHorizontal: 16,
      }}>
      <H1
        fontWeight="bold"
        style={{
          textAlign: 'center',
        }}>
        Login
      </H1>

      <Text color="$red10Light">{error}</Text>

      <ValidateInput
        style={{marginTop: 16}}
        control={control}
        id="email"
        label="Email"
        rules={{required: {value: true, message: 'Email is required'}}}
        error={errors.email?.message}
      />
      <ValidateInput
        style={{
          marginTop: 16,
        }}
        control={control}
        id="password"
        label="Password"
        inputProps={{
          secureTextEntry: true,
        }}
        rules={{required: {value: true, message: 'Password is required'}}}
        error={errors.password?.message}
      />
      <Button
        style={{
          marginTop: 16,
        }}
        onPress={handleSubmit(onSubmit)}>
        Submit
      </Button>
    </View>
  );
}
