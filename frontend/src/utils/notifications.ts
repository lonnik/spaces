import { Notifier, Easing, NotifierComponents } from "react-native-notifier";
import { template } from "../styles/template";

export const showErrorNotification = (title: string, description: string) => {
  Notifier.showNotification({
    title,
    description,
    duration: 3000,
    animationDuration: 600,
    easing: Easing.bounce,
    containerStyle: {},
    Component: NotifierComponents.Alert,
    componentProps: {
      alertType: "error",
      backgroundColor: template.colors.error,
    },
    hideOnPress: true,
  });
};
