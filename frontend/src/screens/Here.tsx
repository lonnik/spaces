import "react-native-gesture-handler";
import { Button, Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useEffect, useState } from "react";
import { Location, TabsParamList } from "../types";
import { useQuery } from "@tanstack/react-query";
import {
  LocationObject,
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { getSpacesByLocation } from "../utils/queries";

export const HereScreen: FC<BottomTabScreenProps<TabsParamList, "Here">> = ({
  navigation,
}) => {
  const [location, setLocation] = useState<LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("permission to access location was denied");
        return;
      }

      const location = await getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let coords = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    : null;

  const { data: spaces } = useQuery({
    queryKey: ["spaces by location"],
    queryFn: () => getSpacesByLocation(coords as Location),
    enabled: !!coords,
  });

  return (
    <View>
      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile" as any)}
      />
      <Text>{JSON.stringify(spaces)}</Text>
    </View>
  );
};
