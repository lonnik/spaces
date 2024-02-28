import { FC, ReactNode, useState } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const duration = 100;

export const PressableTransformation: FC<
  {
    children: ReactNode;
    onPress: () => void;
  } & PressableProps
> = ({ children, onPress, ...props }) => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  const isPressedSv = useSharedValue(false);

  const animatedOpacity = useAnimatedStyle(() => {
    const heightTranslation = Math.max(dimensions.height * 0.005, 1);
    const widthTranslation = Math.max(dimensions.width * 0.005, 1);

    return {
      transform: [
        {
          scale: withTiming(isPressedSv.value ? 0.98 : 1, { duration }),
        },
        {
          skewY: withTiming(isPressedSv.value ? "0.5deg" : "0deg", {
            duration,
          }),
        },
        {
          translateX: withTiming(isPressedSv.value ? widthTranslation : 0, {
            duration,
          }),
        },
        {
          translateY: withTiming(isPressedSv.value ? heightTranslation : 0, {
            duration,
          }),
        },
      ],
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
      onLayout={(event) => setDimensions(event.nativeEvent.layout)}
    >
      <Animated.View style={[animatedOpacity]}>{children}</Animated.View>
    </Pressable>
  );
};
