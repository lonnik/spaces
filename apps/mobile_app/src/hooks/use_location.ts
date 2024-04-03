import { useCallback, useContext, useEffect, useState } from "react";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { useUserState } from "./use_current_user";

export const useLocation = () => {
  const [userState, dispatch] = useUserState();
  const { location } = userState;

  const [permissionGranted, setPermissionGranted] = useState(false);

  const getLocation = useCallback(async () => {
    const { status } = await requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return;
    }
    setPermissionGranted(true);

    const location = await getCurrentPositionAsync({});

    dispatch!({
      type: "SET_LOCATION",
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    });
  }, []);

  useEffect(() => {
    if (!location) {
      getLocation();
    }
  }, [location]);

  return {
    location: location,
    permissionGranted: permissionGranted || !!location,
  };
};
