import { FC, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { template } from "../../../styles/template";
import { HeartIcon } from "../../../components/icons/HeartIcon";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const AnimatedHeartIcon = Animated.createAnimatedComponent(HeartIcon);

export const LikeButton: FC<{
  likes: number;
  onPress: () => void;
  isLikedByUser: boolean;
}> = ({ likes, onPress, isLikedByUser }) => {
  const [internalLikes, setInternalLikes] = useState(likes);

  const isScaledDownSv = useSharedValue(false);
  const isSelected = useSharedValue(isLikedByUser);

  useEffect(() => {
    setInternalLikes(likes);
  }, [likes]);

  const animatedContainerStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: isScaledDownSv.value
            ? withTiming(0.9, { duration: 50 })
            : withTiming(1, { duration: 50 }),
        },
      ],
      backgroundColor: isSelected.value
        ? template.colors.purple
        : "transparent",
    };
  });

  const animatedColorStyles = useAnimatedStyle(() => {
    return {
      color: isSelected.value ? template.colors.white : template.colors.purple,
    };
  });

  const onPressHandler = () => {
    isScaledDownSv.value = true;
    isSelected.value = !isSelected.value;
    setInternalLikes((oldValue) =>
      isSelected.value ? oldValue - 1 : oldValue + 1
    );
    setTimeout(() => {
      isScaledDownSv.value = false;
    }, 50);
    onPress();
  };

  return (
    <Pressable
      onPress={onPressHandler}
      hitSlop={10}
      style={{ alignSelf: "flex-start" }}
    >
      <Animated.View
        style={[
          {
            flexDirection: "row",
            gap: 4,
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 7,
            paddingVertical: 3,
            paddingHorizontal: 8,
            borderColor: template.colors.purple,
          },
          animatedContainerStyles,
        ]}
      >
        <AnimatedHeartIcon
          style={[{ width: 14, height: 14 }, animatedColorStyles as any]}
        />
        <Animated.Text
          style={[
            {
              color: isLikedByUser
                ? template.colors.white
                : template.colors.purple,
              fontWeight: "400",
              fontSize: 13,
            },
            animatedColorStyles,
          ]}
        >
          {internalLikes.toString()}
        </Animated.Text>
      </Animated.View>
    </Pressable>
  );
};
