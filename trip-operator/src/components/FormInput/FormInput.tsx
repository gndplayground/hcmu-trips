import {
  Box,
  BoxProps,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
  Textarea,
  TextareaProps,
} from "@chakra-ui/react";
import React from "react";
import { FieldErrors } from "react-hook-form";

export interface FormInputProps extends BoxProps {
  id: string;
  errors?: FieldErrors;
  label?: React.ReactNode;
  inputProps?: InputProps | TextareaProps;
  disabled?: boolean;
  isRequired?: boolean;
  isMutliline?: boolean;
  error?: string;
}

export function FormInput(props: FormInputProps) {
  const {
    errors,
    label,
    disabled,
    id,
    inputProps,
    isRequired,
    isMutliline,
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
      {!isMutliline && <Input id={id} {...(inputProps as any)} />}
      {isMutliline && <Textarea id={id} {...(inputProps as any)} />}
      {(errors?.[id]?.message || !!error) && (
        <FormErrorMessage>
          {(errors?.[id]?.message as string) || error}
        </FormErrorMessage>
      )}
    </FormControl>
  );
}
