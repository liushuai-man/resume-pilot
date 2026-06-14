import { notifications } from '@mantine/notifications';

export const notification = {
  success: (message: string, title = 'Success') => {
    notifications.show({
      title,
      message,
      color: 'green',
      autoClose: 3000,
    });
  },

  error: (message: string, title = 'Error') => {
    notifications.show({
      title,
      message,
      color: 'red',
      autoClose: 5000,
    });
  },

  warning: (message: string, title = 'Warning') => {
    notifications.show({
      title,
      message,
      color: 'yellow',
      autoClose: 4000,
    });
  },

  info: (message: string, title = 'Info') => {
    notifications.show({
      title,
      message,
      color: 'blue',
      autoClose: 3000,
    });
  },
};
