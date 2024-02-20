import { JSX, FC } from "react";
import { TabNavigationOptions } from "./types";
import { CardWithoutAnimation } from "./CardWithoutAnimation";
import { CardWithSlideInFromRightAnimation } from "./CardWithSlideInFromRightAnimation";
import { CardWithSlideInFromBotomAnimation } from "./CardWithSlideInFromButtomAnimation";
import Animated, {
  useAnimatedStyle,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { StyleSheet } from "react-native";
import { animationDuration } from "./constants";

export const Card: FC<{
  tabNavigationOptions: TabNavigationOptions;
  goBack: () => void;
  currentIndex: number;
  index: number;
  children: JSX.Element;
}> = (props) => {
  const relativeIndex = props.index - props.currentIndex;

  let card: JSX.Element | null = null;
  switch (props.tabNavigationOptions.animation) {
    case "slideInFromRight":
      card = <CardWithSlideInFromRightAnimation {...props} />;
      break;
    case "slideInFromBottom":
      card = (
        <CardWithSlideInFromBotomAnimation
          snapPoint={props.tabNavigationOptions.snapPoint}
          goBack={props.goBack}
          relativeIndex={relativeIndex}
        >
          {props.children}
        </CardWithSlideInFromBotomAnimation>
      );
      break;
    default:
      card = <CardWithoutAnimation>{props.children}</CardWithoutAnimation>;
  }

  const animatedZIndexStyle = useAnimatedStyle(() => {
    return {
      zIndex: withDelay(
        animationDuration,
        withTiming(relativeIndex === 0 ? 10 : 0, { duration: 0 })
      ),
    };
  });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedZIndexStyle]}>
      {card}
    </Animated.View>
  );
};
