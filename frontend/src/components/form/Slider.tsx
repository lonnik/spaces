import { FC, useCallback, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  runOnJS,
  useSharedValue,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import { throttle } from "../../utils/throttle";
import { Text } from "../Text";

const AnimatedText = Animated.createAnimatedComponent(Text);

export const Slider: FC<{
  initialValue: number;
  onValueChange: (newValue: number) => void;
  style?: StyleProp<ViewStyle>;
  thumbStyle?: StyleProp<ViewStyle>;
  trackStyle?: StyleProp<ViewStyle>;
  minimumValue?: number;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  hitRectFactor?: number;
  scaleFactor?: number;
  animationDuration?: number;
}> = ({
  initialValue,
  onValueChange,
  style,
  thumbStyle,
  trackStyle,
  minimumTrackTintColor = "blue",
  maximumTrackTintColor = "#ddd",
  minimumValue = 0,
  maximumValue = 100,
  hitRectFactor = 2,
  scaleFactor,
  animationDuration = 100,
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const thumbSize = (StyleSheet.flatten([thumbStyle]).width || 30) as number;
  const thumbBackgroundColor = (StyleSheet.flatten([thumbStyle])
    .backgroundColor || "blue") as string;

  const startValue = useSharedValue(initialValue);
  const currentValue = useSharedValue(initialValue);
  const translateX = useSharedValue(0);
  const isPressing = useSharedValue(false);

  const throttledOnValueChange = useCallback(throttle(onValueChange, 3), []);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      isPressing.value = true;
    })
    .onFinalize(() => {
      isPressing.value = false;
    })
    .onStart(() => {
      startValue.value = currentValue.value;
    })
    .minDistance(0)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      currentValue.value = Math.max(
        Math.min(
          startValue.value +
            (event.translationX / (sliderWidth - thumbSize)) *
              (maximumValue - minimumValue),
          maximumValue
        ),
        minimumValue
      );

      runOnJS(throttledOnValueChange)(currentValue.value);
    });

  const animatedThumbContainerStyles = useAnimatedStyle(() => {
    const translateX =
      ((currentValue.value - minimumValue) / (maximumValue - minimumValue)) *
        (sliderWidth - thumbSize) -
      ((hitRectFactor - 1) * thumbSize) / 2;

    return {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      width: thumbSize * hitRectFactor,
      height: thumbSize * hitRectFactor,
      position: "absolute",
      transform: [{ translateX }],
    };
  });

  const animatedTextContainerStyles = useAnimatedStyle(() => {
    return {
      backgroundColor: "white",
      padding: isPressing.value ? 3 : 0,
      borderRadius: 999,
      transform: [
        {
          translateY: withTiming(isPressing.value ? -50 : -23, {
            duration: 100,
          }),
        },
      ],
    };
  });

  const animatedTextStyles = useAnimatedStyle(() => {
    return {
      fontSize: withTiming(isPressing.value ? 30 : 17, { duration: 100 }),
      color: thumbBackgroundColor,
    };
  });

  const animatedThumbStyles = useAnimatedStyle(() => {
    const size = isPressing.value
      ? Math.min(
          thumbSize * hitRectFactor,
          thumbSize * (scaleFactor || hitRectFactor)
        )
      : thumbSize;

    return {
      alignItems: "center",
      borderRadius: 999,
      backgroundColor: withTiming(thumbBackgroundColor, {
        duration: animationDuration,
      }),
      width: withSpring(size, { duration: 500 }),
      height: withSpring(size, { duration: 500 }),
    };
  });

  const animatedMimimumTrackStyle = useAnimatedStyle(() => {
    const width =
      ((currentValue.value - minimumValue) / (maximumValue - minimumValue)) *
        (sliderWidth - thumbSize) +
      thumbSize / 2;

    return {
      width,
      backgroundColor: withTiming(minimumTrackTintColor, {
        duration: animationDuration,
      }),
    };
  });

  const animatedMaximumTrackStyle = useAnimatedStyle(() => {
    const width =
      (Math.abs(currentValue.value - maximumValue) /
        (maximumValue - minimumValue)) *
        (sliderWidth - thumbSize) +
      thumbSize / 2;

    return {
      width,
      backgroundColor: withTiming(maximumTrackTintColor, {
        duration: animationDuration,
      }),
    };
  });

  return (
    <View
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setSliderWidth(width);
      }}
      style={[{ justifyContent: "center", marginTop: 20 }, style]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            right: 0,
            borderRadius: 999,
            height: 10,
          },
          trackStyle,
          animatedMaximumTrackStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            borderRadius: 999,
            height: 10,
          },
          trackStyle,
          animatedMimimumTrackStyle,
        ]}
      />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedThumbContainerStyles}>
          <Animated.View style={[thumbStyle, animatedThumbStyles]}>
            <Animated.View style={animatedTextContainerStyles}>
              <AnimatedText style={animatedTextStyles}>
                {Math.round(currentValue.value)}
              </AnimatedText>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
