import "react-native-gesture-handler";
import { Button, Text, View, ActivityIndicator, FlatList } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useCallback, useEffect, useState } from "react";
import { Location, Space, TabsParamList } from "../types";
import { useQuery } from "@tanstack/react-query";
import {
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
} from "expo-location";
import { getSpacesByLocation } from "../utils/queries";

export const HereScreen: FC<BottomTabScreenProps<TabsParamList, "Here">> = ({
  navigation,
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  const {
    data: spaces,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["spaces by location"],
    queryFn: () => getSpacesByLocation(location as Location),
    enabled: !!location,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Button
        title="Profile"
        onPress={() => navigation.navigate("Profile" as any)}
      />
      <FlatList
        data={spaces}
        numColumns={3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          return <SpaceItem data={item} />;
        }}
        style={{ flex: 1, padding: 5 }}
      />
    </View>
  );
};

const SpaceItem: FC<{ data: Space }> = ({ data }) => {
  return (
    <View
      style={{
        width: "33.33333%",
        padding: 5,
        aspectRatio: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: `#${data.themeColorHexaCode}`,
          borderRadius: 7,
          marginVertical: 0,
          paddingHorizontal: 0,
        }}
      >
        <Text>{JSON.stringify(data)}</Text>
      </View>
    </View>
  );
};
