import { FC, ReactNode } from "react";
import { Pressable, PressableProps, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const PressableOverlay: FC<
  {
    children: ReactNode;
    onPress: () => void;
  } & PressableProps
> = ({ children, onPress, ...props }) => {
  const isPressedSv = useSharedValue(false);

  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isPressedSv.value ? 0.1 : 0, { duration: 100 }),
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        isPressedSv.value = true;
      }}
      onPressOut={() => {
        isPressedSv.value = false;
      }}
      onPress={onPress}
      {...props}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "black",
            pointerEvents: "none",
            borderRadius: 10,
            overflow: "hidden",
            zIndex: 1,
          },
          animatedOpacity,
        ]}
      />
      {children}
    </Pressable>
  );
};
