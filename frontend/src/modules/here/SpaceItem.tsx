import "react-native-gesture-handler";
import { View, StyleProp, ViewStyle } from "react-native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { FC } from "react";
import { Space, TabsParamList } from "../../types";
import { Text } from "../../components/Text";
import { PressableTransformation } from "../../components/PressableTransformation";
import { template } from "../../styles/template";
import { hexToRgb } from "../../utils/hex_to_rgb";
import { DistanceIcon } from "../../components/icons/DistanceIcon";
import { useNotification } from "../../utils/notifications";

export const SpaceItem: FC<{
  data: Space;
  navigation: BottomTabNavigationProp<TabsParamList, "Here", undefined>;
}> = ({ data, navigation }) => {
  const notification = useNotification();

  const handleOnPress = () => {
    if (!data.distance) {
      navigation.navigate("Space" as any, { spaceId: data.id });
      return;
    }

    notification.showNotification({
      title: "You are too far away",
      description: "You need to be closer to the space to enter it",
      type: "error",
    });
  };

  return (
    <View
      style={{
        width: "50%",
        height: 72,
        paddingHorizontal: template.paddings.md / 3,
        marginBottom: (template.paddings.md * 2) / 3,
      }}
    >
      <PressableTransformation style={{ flex: 1 }} onPress={handleOnPress}>
        <View
          style={{
            width: "100%",
            height: "100%",
            padding: 10,
            borderRadius: 7,
            backgroundColor: hexToRgb(data.themeColorHexaCode, 0.8),
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 5,
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: "#fff",
              flex: 1,
              height: "auto",
              lineHeight: 17,
              alignSelf: "flex-end",
            }}
          >
            {data.name}
          </Text>
          <View
            style={{
              justifyContent: "space-between",
            }}
          >
            <Text style={{ lineHeight: 30, fontSize: 26, textAlign: "right" }}>
              🏠
            </Text>
            <Distance distance={data.distance} />
          </View>
        </View>
      </PressableTransformation>
    </View>
  );
};

const Distance: FC<{ distance: number; style?: StyleProp<ViewStyle> }> = ({
  distance,
  style,
}) => {
  if (!distance) {
    return null;
  }

  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          width: 50,
          gap: 2,
          justifyContent: "flex-end",
          alignSelf: "flex-end",
        },
        style,
      ]}
    >
      <DistanceIcon
        fill={"#fff"}
        style={{ width: 12, height: 7, marginTop: 1 }}
      />
      <Text
        style={{
          color: "#fff",
          fontSize: 11,
          fontWeight: "600",
        }}
      >
        {`${distance.toFixed(1)}`}
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: 11,
          fontWeight: "600",
        }}
      >
        m
      </Text>
    </View>
  );
};
