import { useEffect, JSX, FC } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { TabNavigationOptions } from "./types";
import { animationDuration, swipeYThreshold } from "./constants";
import { AnimatedOverlay } from "./AnimatedOverlay";

export const CardWithSlideInFromBotomAnimation: FC<{
  tabNavigationOptions: TabNavigationOptions;
  goBack: () => void;
  currentIndex: number;
  index: number;
  children: JSX.Element;
}> = ({ tabNavigationOptions, goBack, currentIndex, index, children }) => {
  const relativeIndex = index - currentIndex;
  const dimensions = useWindowDimensions();

  const translateY = useSharedValue(1);
  const gestureActive = useSharedValue(false);

  useEffect(() => {
    translateY.value = index - currentIndex;
  }, [currentIndex]);

  const animatedCardStyles = useAnimatedStyle(() => {
    const translateYValue =
      translateY.value < 0 ? 0 : translateY.value * dimensions.height;
    const borderRadiusValue = Math.abs(
      Math.round((translateY.value / dimensions.height - 1) * 7)
    );

    return {
      transform: [
        {
          translateY: !gestureActive.value
            ? withTiming(translateYValue, { duration: animationDuration })
            : translateYValue,
        },
      ],
      borderTopLeftRadius: !gestureActive.value
        ? withTiming(borderRadiusValue, { duration: animationDuration })
        : borderRadiusValue,
      borderTopRightRadius: !gestureActive.value
        ? withTiming(borderRadiusValue, { duration: animationDuration })
        : borderRadiusValue,
    };
  });

  const animatedHeaderStyles = useAnimatedStyle(() => {
    return {};
  });

  const isFirstStackItem = index === 0;

  const dragDownGesture = Gesture.Pan()
    .enabled(!isFirstStackItem)
    .onUpdate((event) => {
      gestureActive.value = true;
      translateY.value = event.translationY / dimensions.height;
    })
    .onEnd(() => {
      gestureActive.value = false;
      if (translateY.value * dimensions.height > swipeYThreshold) {
        runOnJS(goBack)();
      } else {
        translateY.value = 0;
      }
    });

  return (
    <>
      <AnimatedOverlay
        relativeIndex={relativeIndex}
        translate={translateY}
        gestureActive={gestureActive}
      />
      <GestureDetector gesture={dragDownGesture}>
        <Animated.View
          style={[
            {
              flex: 1,
              overflow: "hidden",
              backgroundColor: "#eee",
            },
            animatedCardStyles,
          ]}
        >
          <Animated.View style={[animatedHeaderStyles]}>
            {tabNavigationOptions.header}
          </Animated.View>
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
};
