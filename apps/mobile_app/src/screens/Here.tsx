import "react-native-gesture-handler";
import { FlatList, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useCallback, useEffect, useState } from "react";
import { Location, TabsParamList } from "../types";
import { useQueries } from "@tanstack/react-query";
import { getAddress, getSpacesByLocation } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { SpaceItem } from "../modules/here/SpaceItem";
import { useLocation } from "../hooks/use_location";
import { template } from "../styles/template";
import { Header } from "../components/Header";
import { Text } from "../components/Text";
import { PressableOverlay } from "../components/PressableOverlay";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ProfileIcon } from "../components/icons/ProfileIcon";
import { OpacityAnimation } from "../components/OpacityAnimation";

const maxNumberItems = 11;

export const HereScreen: FC<BottomTabScreenProps<TabsParamList, "Here">> = ({
  navigation,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  // const { location } = useLocation();
  const location = { latitude: 52.554357, longitude: 13.420848 };

  const [
    { data: spaces, isLoading, refetch: refetchSpaces, status, error },
    { data: address, refetch: refetchAddress },
  ] = useQueries({
    queries: [
      {
        queryKey: ["spaces by location", location],
        queryFn: () => {
          return getSpacesByLocation(location as Location, maxNumberItems);
        },
        enabled: !!location,
      },
      {
        queryKey: ["address", location],
        queryFn: () => getAddress(location as Location),
        enabled: !!location,
      },
    ],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.allSettled([refetchAddress(), refetchSpaces()]);
    setRefreshing(false);
  }, [refetchAddress, refetchSpaces]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  const addressSmall = address && `${address.street} ${address.streetNumber}`;

  const headerCenterElement = (
    <HeaderCenterElement addressSmall={addressSmall} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Header
        centerElement={headerCenterElement}
        rightElement={<HeaderRightElement />}
      />
      <View
        style={{
          flex: 1,
        }}
      >
        <OpacityAnimation isDisplayed={!!spaces}>
          <FlatList
            data={spaces}
            numColumns={2}
            onRefresh={onRefresh}
            refreshing={refreshing}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              return (
                <SpaceItem
                  data={item}
                  navigation={navigation}
                  emojy={emojies[index]}
                />
              );
            }}
            contentContainerStyle={{
              paddingHorizontal: (template.paddings.md * 2) / 3,
            }}
            style={[{ flex: 1 }]}
          />
        </OpacityAnimation>
      </View>
    </View>
  );
};

const emojies = ["🏠", "🏢", "🏡", "🏣", "🏥", "🏦", "🏨", "🏪", "🏫", "🏬"];

const HeaderCenterElement: FC<{ addressSmall?: string }> = ({
  addressSmall,
}) => {
  return (
    <View
      style={{
        paddingHorizontal: 11,
        paddingVertical: 4,
        backgroundColor: template.colors.gray,
        borderRadius: 10,
      }}
    >
      <Text
        style={{
          color: "#444",
          textAlign: "center",
          fontSize: 16,
          fontStyle: "normal",
          fontWeight: template.fontWeight.bold,
          letterSpacing: 0.32,
        }}
      >
        {addressSmall || ""}
      </Text>
    </View>
  );
};

const HeaderRightElement: FC = () => {
  const navigation =
    useNavigation<BottomTabNavigationProp<TabsParamList, "Here", undefined>>();

  return (
    <PressableOverlay
      onPress={() => navigation.navigate("Profile" as any)}
      hitSlop={5}
    >
      <ProfileIcon
        fill={template.colors.text}
        style={{ width: 26, height: 27 }}
      />
    </PressableOverlay>
  );
};
