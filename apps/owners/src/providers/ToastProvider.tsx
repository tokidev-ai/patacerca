import React from 'react';
import { Toast } from '@patacerca/ui';
import { useToastStore } from '../store/toast.store';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { visible, message, hideToast } = useToastStore();

  return (
    <>
      {children}
      <Toast visible={visible} message={message} onDismiss={hideToast} />
    </>
  );
};

