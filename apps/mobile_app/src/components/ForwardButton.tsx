import { FC } from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import { PressableTransformation } from "./PressableTransformation";
import { template } from "../styles/template";
import { Text } from "./Text";
import { ArrowForward } from "./icons/ArrowForward";

export const ForwardButton: FC<{
  onPress: () => void;
  text: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ onPress, text, color = template.colors.text, style }) => {
  return (
    <PressableTransformation onPress={onPress} style={style}>
      <View
        style={{
          backgroundColor: template.colors.grayLightBackground,
          padding: 12,
          borderRadius: template.borderRadius.md,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: template.fontWeight.bold,
            color: color,
          }}
        >
          {text}
        </Text>
        <ArrowForward style={{ width: 20, height: 16 }} fill={color} />
      </View>
    </PressableTransformation>
  );
};
