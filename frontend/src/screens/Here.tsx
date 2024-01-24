import "react-native-gesture-handler";
import { View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useCallback, useEffect, useState } from "react";
import { Location, TabsParamList } from "../types";
import { useQueries } from "@tanstack/react-query";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { getAddress, getSpacesByLocation } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { SpaceItem } from "../modules/here/SpaceItem";
import { Header } from "../modules/here/Header";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const HereScreen: FC<BottomTabScreenProps<TabsParamList, "Here">> = ({
  navigation,
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const opacity = useSharedValue(0);

  useEffect(() => {
    (async () => {
      const { status } = await requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.error("permission to access location was denied");
        return;
      }

      const location = await getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const [
    { data: spaces, isLoading, refetch: refetchSpaces },
    { data: address, refetch: refetchAddress },
  ] = useQueries({
    queries: [
      {
        queryKey: ["spaces by location", location],
        queryFn: () => getSpacesByLocation(location as Location),
        enabled: !!location,
      },
      {
        queryKey: ["address", location],
        queryFn: () => getAddress(location as Location),
        enabled: !!location,
      },
    ],
  });

  useEffect(() => {
    if (spaces) {
      opacity.value = 1;
    }
  }, [spaces]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchAddress(), refetchSpaces()]);
    setRefreshing(false);
  }, [refetchAddress, refetchSpaces]);

  const animatedOpacityStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacity.value, { duration: 200 }),
    };
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Header address={address} navigation={navigation} />
      <Animated.FlatList
        data={spaces}
        numColumns={3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return <SpaceItem data={item} navigation={navigation} />;
        }}
        style={[{ flex: 1, padding: 5 }, animatedOpacityStyles]}
      />
    </View>
  );
};
