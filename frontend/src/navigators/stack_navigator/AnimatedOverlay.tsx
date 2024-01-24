import { FC } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { animationDuration } from "./constants";

export const AnimatedOverlay: FC<{
  relativeIndex: number;
  translate: SharedValue<number>;
  gestureActive: SharedValue<boolean>;
}> = ({ relativeIndex, translate, gestureActive }) => {
  const animatedOpacity = useAnimatedStyle(() => {
    const opacity = Math.max((translate.value - 0.7) * -1, 0);

    return {
      display: withDelay(
        animationDuration,
        withTiming(relativeIndex === 0 ? "flex" : "none", { duration: 0 })
      ),
      opacity: gestureActive.value
        ? opacity
        : withTiming(opacity, { duration: animationDuration }),
    };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "#000" },
        animatedOpacity,
      ]}
    />
  );
};
