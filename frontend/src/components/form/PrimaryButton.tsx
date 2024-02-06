import { Pressable, StyleProp, ViewStyle } from "react-native";
import { FC, ReactNode, useEffect } from "react";
import { Text } from "../Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { template } from "../../styles/template";

const AnimatedText = Animated.createAnimatedComponent(Text);

export const PrimaryButton: FC<{
  children: ReactNode;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
}> = ({ children, color, textColor, style }) => {
  const sharedBackgroundColorValue = useSharedValue(
    color || template.colors.purple
  );
  const sharedTextColorValue = useSharedValue(
    textColor || template.colors.white
  );

  useEffect(() => {
    if (color) {
      sharedBackgroundColorValue.value = color;
    }
  }, [color]);

  useEffect(() => {
    if (textColor) {
      sharedTextColorValue.value = textColor;
    }
  }, [textColor]);

  const animatedBackgroundColor = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(sharedBackgroundColorValue.value),
    };
  });

  const animatedTextColor = useAnimatedStyle(() => {
    return {
      color: withTiming(sharedTextColorValue.value),
    };
  });

  return (
    <Pressable
      style={[
        {
          marginHorizontal: "auto",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            paddingHorizontal: 29,
            paddingVertical: 13,
            borderRadius: 10,
          },
          animatedBackgroundColor,
        ]}
      >
        <AnimatedText
          style={[
            {
              textAlign: "center",
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: 0.36,
              textTransform: "uppercase",
            },
            animatedTextColor,
          ]}
        >
          {children}
        </AnimatedText>
      </Animated.View>
    </Pressable>
  );
};
