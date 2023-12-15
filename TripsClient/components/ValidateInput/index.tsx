import React from 'react';
import {Control, Controller, UseControllerProps} from 'react-hook-form';
import {View, Label, Input, Text, InputProps} from 'tamagui';

export interface ValidateInputProps {
  control: Control;
  id: string;
  error?: any;
  rules?: UseControllerProps['rules'];
  label?: string;
  style?: any;
  inputProps?: InputProps;
}

export function ValidateInput(props: ValidateInputProps) {
  const {control, id, error, rules, label, style, inputProps} = props;
  return (
    <View style={style}>
      <Label htmlFor={id}>{label}</Label>
      <Controller
        control={control}
        render={({field: {onChange, onBlur, value}}) => (
          <Input
            {...inputProps}
            id={id}
            onBlur={onBlur}
            onChangeText={v => {
              onChange(v);
            }}
            value={value}
          />
        )}
        name={id}
        rules={rules}
      />
      <Text color="$red10Light">{error}</Text>
    </View>
  );
}
