import { Notifier, Easing } from "react-native-notifier";
import { NotificationType } from "../types";
import { useNotificationState } from "../components/context/NotificationContext";
import { CustomNotification } from "../components/Notification";
import { useCallback } from "react";

type NotificationProps = {
  title?: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
};

const createHideNotification = () => {
  let timeout: NodeJS.Timeout;

  return (duration: number) => {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      Notifier.hideNotification();
      clearTimeout(timeout);
    }, duration);
  };
};

const notificationDuration = 3000;

export const useNotification = () => {
  const [_, setNotificationState] = useNotificationState();

  const hideNotification = useCallback(createHideNotification(), []);

  const showNotification = ({
    title = "",
    description = "",
    type = "info",
    duration = notificationDuration,
  }: NotificationProps) => {
    setNotificationState({
      title,
      description,
      type,
    });

    Notifier.showNotification({
      title,
      description,
      duration: 999999,
      animationDuration: 200,
      easing: Easing.ease,
      containerStyle: {
        zIndex: 9999,
      },
      Component: CustomNotification,
      componentProps: {
        type,
      },
      hideOnPress: true,
    });

    hideNotification(duration);
  };

  const updateNotification = ({
    title = "",
    description = "",
    type = "info",
    duration = notificationDuration,
  }: NotificationProps) => {
    setNotificationState({
      title,
      description,
      type,
    });

    hideNotification(duration);
  };

  return { showNotification, updateNotification };
};
