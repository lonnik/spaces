import { FC, useState } from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { GestureDetector, Gesture } from "react-native-gesture-handler";

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
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const thumbSize = (StyleSheet.flatten([thumbStyle]).width || 30) as number;
  const thumbBackgroundColor = (StyleSheet.flatten([thumbStyle])
    .backgroundColor || "blue") as string;

  const startValue = useSharedValue(initialValue);
  const valueSv = useSharedValue(initialValue);
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startValue.value = valueSv.value;
    })
    .minDistance(0)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      valueSv.value = Math.max(
        Math.min(
          startValue.value +
            (event.translationX / (sliderWidth - thumbSize)) *
              (maximumValue - minimumValue),
          maximumValue
        ),
        minimumValue
      );

      runOnJS(onValueChange)(valueSv.value);
    });

  const animatedThumbStyle = useAnimatedStyle(() => {
    const translateX =
      ((valueSv.value - minimumValue) / (maximumValue - minimumValue)) *
      (sliderWidth - thumbSize);

    return {
      transform: [{ translateX }],
      backgroundColor: withTiming(thumbBackgroundColor),
    };
  });

  const animatedMimimumTrackStyle = useAnimatedStyle(() => {
    const width =
      ((valueSv.value - minimumValue) / (maximumValue - minimumValue)) *
        (sliderWidth - thumbSize) +
      thumbSize / 2;

    return {
      width,
      backgroundColor: withTiming(minimumTrackTintColor),
    };
  });

  const animatedMaximumTrackStyle = useAnimatedStyle(() => {
    const width =
      (Math.abs(valueSv.value - maximumValue) / (maximumValue - minimumValue)) *
        (sliderWidth - thumbSize) +
      thumbSize / 2;

    return {
      width,
      backgroundColor: withTiming(maximumTrackTintColor),
    };
  });

  return (
    <View
      onLayout={(event) => {
        const { width } = event.nativeEvent.layout;
        setSliderWidth(width);
      }}
      style={[{ justifyContent: "center" }, style]}
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
        <Animated.View
          style={[
            {
              position: "absolute",
              width: thumbSize,
              height: thumbSize,
              borderRadius: thumbSize / 2,
            },
            thumbStyle,
            animatedThumbStyle,
          ]}
        />
      </GestureDetector>
    </View>
  );
};
