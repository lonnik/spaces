import { useEffect, JSX, FC } from "react";
import { useWindowDimensions, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { animationDuration, swipeXThreshold } from "./constants";
import { AnimatedOverlay } from "./AnimatedOverlay";

export const CardWithSlideInFromRightAnimation: FC<{
  goBack: () => void;
  currentIndex: number;
  index: number;
  children: JSX.Element;
}> = ({ goBack, currentIndex, index, children }) => {
  const relativeIndex = index - currentIndex;

  const dimensions = useWindowDimensions();

  const translateX = useSharedValue(1);
  const gestureActive = useSharedValue(false);

  useEffect(() => {
    translateX.value = index - currentIndex;
  }, [currentIndex]);

  const animatedCardStyles = useAnimatedStyle(() => {
    const translateXValue =
      translateX.value < 0 ? 0 : translateX.value * dimensions.width;
    return {
      transform: [
        {
          translateX: !gestureActive.value
            ? withTiming(translateXValue, { duration: animationDuration })
            : translateXValue,
        },
      ],
    };
  });

  const isFirstStackItem = index === 0;

  const swipeBackGesture = Gesture.Pan()
    .enabled(!isFirstStackItem)
    .onUpdate((event) => {
      gestureActive.value = true;
      translateX.value = event.translationX / dimensions.width;
    })
    .onEnd(() => {
      gestureActive.value = false;
      if (translateX.value * dimensions.width > swipeXThreshold) {
        runOnJS(goBack)();
      } else {
        translateX.value = 0;
      }
    });

  return (
    <>
      <AnimatedOverlay
        relativeIndex={relativeIndex}
        translate={translateX}
        gestureActive={gestureActive}
      />
      <GestureDetector gesture={swipeBackGesture}>
        <Animated.View
          style={[
            {
              flex: 1,
              overflow: "hidden",
              backgroundColor: "#eee",
              borderTopLeftRadius: 7,
              borderTopRightRadius: 7,
            },
            animatedCardStyles,
          ]}
        >
          {children}
        </Animated.View>
      </GestureDetector>
    </>
  );
};
