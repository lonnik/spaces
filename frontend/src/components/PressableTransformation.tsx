import { FC, ReactNode, useState } from "react";
import { Pressable, PressableProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

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
    return {
      transform: [
        {
          scale: withTiming(isPressedSv.value ? 0.99 : 1, { duration: 75 }),
        },
        {
          skewY: withTiming(isPressedSv.value ? "0.5deg" : "0deg", {
            duration: 75,
          }),
        },
        {
          translateX: withTiming(
            isPressedSv.value ? dimensions.width * 0.007 : 0,
            {
              duration: 75,
            }
          ),
        },
        {
          translateY: withTiming(
            isPressedSv.value ? dimensions.height * 0.007 : 0,
            {
              duration: 75,
            }
          ),
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
