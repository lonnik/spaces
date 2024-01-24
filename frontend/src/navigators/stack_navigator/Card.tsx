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
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const Card: FC<{
  tabNavigationOptions: TabNavigationOptions;
  goBack: () => void;
  currentIndex: number;
  index: number;
  children: JSX.Element;
}> = (props) => {
  const insets = useSafeAreaInsets();
  const relativeIndex = props.index - props.currentIndex;
  let card: JSX.Element | null = null;

  switch (props.tabNavigationOptions.animation) {
    case "slideInFromBottom":
      card = <CardWithSlideInFromBotomAnimation {...props} />;
      break;
    case "slideInFromRight":
      card = <CardWithSlideInFromRightAnimation {...props} />;
      break;
    default:
      card = <CardWithoutAnimation>{props.children}</CardWithoutAnimation>;
  }

  const animatedZIndex = useAnimatedStyle(() => {
    return {
      zIndex: withDelay(
        animationDuration,
        withTiming(relativeIndex === 0 ? 10 : 0, { duration: 0 })
      ),
    };
  });

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          marginTop: insets.top,
          display:
            props.index - props.currentIndex < -1 ||
            props.index - props.currentIndex > 1
              ? "none"
              : "flex",
        },
        animatedZIndex,
      ]}
    >
      {card}
    </Animated.View>
  );
};
