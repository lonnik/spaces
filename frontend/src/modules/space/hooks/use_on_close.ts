import { useEffect } from "react";
import { useCustomNavigation } from "../../../hooks/use_custom_navigation";

export const useOnClose = (onClose: () => void) => {
  const navigation = useCustomNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", onClose);

    return unsubscribe;
  }, [navigation]);
};
