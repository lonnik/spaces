import { FC, ReactNode, useEffect } from "react";
import { StyleProp, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const OpacityAnimation: FC<{
  children: ReactNode;
  isDisplayed: boolean;
  animationDuration?: number;
  style?: StyleProp<ViewStyle>;
}> = ({ children, style, animationDuration = 200, isDisplayed }) => {
  const opacity = useSharedValue(0);

  const animatedOpacityStyles = useAnimatedStyle(() => {
    return {
      opacity: withTiming(opacity.value, { duration: animationDuration }),
    };
  });

  useEffect(() => {
    if (isDisplayed) {
      opacity.value = 1;
    }
  }, [isDisplayed]);

  return (
    <Animated.View style={[{ flex: 1 }, style, animatedOpacityStyles]}>
      {children}
    </Animated.View>
  );
};
