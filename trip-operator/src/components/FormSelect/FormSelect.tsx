import {
  Box,
  BoxProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Select,
  SelectProps,
} from "@chakra-ui/react";
import React from "react";
import { FieldErrors } from "react-hook-form";

export interface FormSelectProps extends BoxProps {
  id: string;
  errors?: FieldErrors;
  label?: React.ReactNode;
  selectProps?: SelectProps;
  disabled?: boolean;
  isRequired?: boolean;
  children?: React.ReactNode;
  error?: string;
}

export function FormSelect(props: FormSelectProps) {
  const {
    errors,
    label,
    disabled,
    id,
    selectProps,
    isRequired,
    children,
    error,
    ...others
  } = props;
  return (
    <FormControl
      isDisabled={disabled}
      id={id}
      isInvalid={!!errors?.[id] || !!error}
      {...others}
    >
      {label && (
        <FormLabel display="flex" htmlFor={id}>
          {label}
          {isRequired && <Box color="red.500">*</Box>}
        </FormLabel>
      )}
      <Select id={id} {...(selectProps as any)}>
        {children}
      </Select>
      {(errors?.[id]?.message || !!error) && (
        <FormErrorMessage>
          {(errors?.[id]?.message as string) || error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
