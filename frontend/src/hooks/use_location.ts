import { useCallback, useContext, useEffect, useState } from "react";
import {
  UserDispatchContext,
  UserStateContext,
} from "../components/context/UserContext";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";

export const useLocation = () => {
  const rootState = useContext(UserStateContext);
  const dispatch = useContext(UserDispatchContext);

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
    if (!rootState?.location) {
      getLocation();
    }
  }, [rootState?.location]);

  return {
    location: rootState?.location,
    permissionGranted: permissionGranted || !!rootState?.location,
  };
};
