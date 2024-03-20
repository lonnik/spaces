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
  onPress: () => void;
  isDisabled?: boolean;
  color?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  animationDuration?: number;
}> = ({
  children,
  color,
  textColor,
  style,
  animationDuration = 100,
  isDisabled = false,
  onPress,
}) => {
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
      backgroundColor: withTiming(sharedBackgroundColorValue.value, {
        duration: animationDuration,
      }),
    };
  });

  const animatedTextColor = useAnimatedStyle(() => {
    return {
      color: withTiming(sharedTextColorValue.value, {
        duration: animationDuration,
      }),
    };
  });

  return (
    <Pressable
      onPress={isDisabled ? () => {} : onPress}
      hitSlop={10}
      style={[
        {
          marginHorizontal: "auto",
        },
        style,
      ]}
    >
      {({ pressed }) => {
        return (
          <Animated.View
            style={[
              {
                paddingHorizontal: 25,
                paddingVertical: 9,
                borderRadius: 10,
                opacity: pressed ? 0.8 : 1,
              },
              animatedBackgroundColor,
            ]}
          >
            <AnimatedText
              style={[
                {
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: template.fontWeight.bold,
                  letterSpacing: 0.36,
                  textTransform: "uppercase",
                },
                animatedTextColor,
              ]}
            >
              {children}
            </AnimatedText>
          </Animated.View>
        );
      }}
    </Pressable>
  );
};
