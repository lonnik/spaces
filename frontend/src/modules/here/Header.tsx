import { FC } from "react";
import { Address, TabsParamList } from "../../types";
import { TouchableOpacity, View } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { ProfileIcon } from "../../components/icons/ProfileIcon";
import { template } from "../../styles/template";
import { Text } from "../../components/Text";

export const Header: FC<{
  address?: Address;
  navigation: BottomTabNavigationProp<TabsParamList, "Here", undefined>;
}> = ({ address, navigation }) => {
  const addressSmall = address && `${address.street} ${address.streetNumber}`;

  return (
    <View
      style={{
        height: template.height.header,
        paddingHorizontal: 10,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <View style={{ flex: 1 }} />
        <View
          style={{
            paddingHorizontal: 11,
            paddingVertical: 5,
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
              fontWeight: "600",
              letterSpacing: 0.32,
            }}
          >
            {addressSmall}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile" as any)}
          >
            <ProfileIcon fill={template.colors.lila} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
