import { useNavigation } from "@react-navigation/native";
import { createContext, useContext } from "react";

export const GoBackContext = createContext<(() => void) | null>(null);

export const useCustomNavigation = () => {
  const navigation = useNavigation();
  const customGoBack = useContext(GoBackContext);

  const customNavigation = { ...navigation };
  if (customGoBack) {
    customNavigation.goBack = customGoBack;
  }

  return customNavigation;
};
