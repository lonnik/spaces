import { FC } from "react";
import { Address, TabsParamList } from "../../types";
import { Text, TouchableOpacity, View } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";

export const Header: FC<{
  address?: Address;
  navigation: BottomTabNavigationProp<TabsParamList, "Here", undefined>;
}> = ({ address, navigation }) => {
  const insets = useSafeAreaInsets();
  const addressSmall = address && `${address.street} ${address.streetNumber}`;

  return (
    <View style={{ paddingTop: insets.top, backgroundColor: "#fff" }}>
      <View style={{ height: 103 - 59, paddingHorizontal: 10 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            flexDirection: "row",
          }}
        >
          <View style={{ flex: 1 }} />
          <Text
            style={{
              fontSize: 17,
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            {addressSmall}
          </Text>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <TouchableOpacity
              onPress={() => navigation.navigate("Profile" as any)}
            >
              <FontAwesome5 size={22} style={{}} name="user" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};
