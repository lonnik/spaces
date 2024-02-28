import { FC, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { template } from "../../styles/template";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Heart2Icon } from "../../components/icons/Heart2Icon";

const AnimatedHeartIcon = Animated.createAnimatedComponent(Heart2Icon);

export const LikeButton2: FC<{
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
            ? withTiming(0.8, { duration: 50 })
            : withTiming(1, { duration: 50 }),
        },
      ],
    };
  });

  const animatedColorStyles = useAnimatedStyle(() => {
    return {
      color: isSelected.value ? template.colors.purple : template.colors.text,
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
            borderRadius: 7,
          },
          animatedContainerStyles,
        ]}
      >
        <AnimatedHeartIcon
          style={[{ width: 18, height: 17 }, animatedColorStyles as any]}
          fill={isSelected.value ? template.colors.purple : "none"}
          stroke={
            isSelected.value
              ? template.colors.purple
              : template.colors.textLight
          }
        />
        {internalLikes ? (
          <Animated.Text
            style={[
              {
                fontWeight: "400",
                fontSize: 13,
              },
              animatedColorStyles,
            ]}
          >
            {internalLikes.toString()}
          </Animated.Text>
        ) : null}
      </Animated.View>
    </Pressable>
  );
};
