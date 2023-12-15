import React from 'react';
import {AlertDialog, Button, Text, XStack, YStack} from 'tamagui';

export interface ComfirmDialogProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog(props: ComfirmDialogProps) {
  const {children, title, description, onConfirm, confirmText, cancelText} =
    props;
  return (
    <AlertDialog native>
      <AlertDialog.Trigger asChild>{children}</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{opacity: 0}}
          exitStyle={{opacity: 0}}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{x: 0, y: -20, opacity: 0, scale: 0.9}}
          exitStyle={{x: 0, y: 10, opacity: 0, scale: 0.95}}
          x={0}
          scale={1}
          opacity={1}
          y={0}>
          <YStack space>
            <AlertDialog.Title>{title}</AlertDialog.Title>
            <AlertDialog.Description>{description}</AlertDialog.Description>

            <XStack space="$3" justifyContent="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>{cancelText}</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild onPress={onConfirm}>
                <Button theme="active">{confirmText}</Button>
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
