import { FC, useEffect } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export const ColorPicker: FC<{
  colors: string[];
  selectedIndex: number;
  setSelectedColorIndex: (newSelectedColorIndex: number) => void;
  gapSize: number;
  numberOfColumns: number;
  screenPaddingHorizontal: number;
  animationDuration?: number;
}> = ({
  colors,
  selectedIndex,
  setSelectedColorIndex,
  gapSize,
  numberOfColumns,
  screenPaddingHorizontal,
  animationDuration = 100,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = screenWidth - screenPaddingHorizontal * 2;
  const itemWidth =
    (containerWidth - gapSize * (numberOfColumns - 1)) / numberOfColumns;

  return (
    <View
      style={{
        width: "100%",
        flexDirection: "row",
        flexWrap: "wrap",
      }}
    >
      {colors.map((color, index) => {
        const isLastRowItem = (index + 1) % numberOfColumns === 0;
        const isLastColumnItem = index >= colors.length - numberOfColumns;
        const isSelected = selectedIndex === index;

        return (
          <Color
            key={index}
            animationDuration={animationDuration}
            color={color}
            gapSize={gapSize}
            isLastColumnItem={isLastColumnItem}
            isLastRowItem={isLastRowItem}
            isSelected={isSelected}
            itemWidth={itemWidth}
            onPress={() => setSelectedColorIndex(index)}
          />
        );
      })}
    </View>
  );
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Color: FC<{
  color: string;
  isSelected: boolean;
  itemWidth: number;
  onPress: () => void;
  isLastRowItem: boolean;
  isLastColumnItem: boolean;
  gapSize: number;
  animationDuration: number;
}> = ({
  color,
  isSelected,
  isLastRowItem,
  isLastColumnItem,
  gapSize,
  onPress,
  itemWidth,
  animationDuration = 100,
}) => {
  const isSelectedSv = useSharedValue(isSelected);

  useEffect(() => {
    isSelectedSv.value = isSelected;
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(isSelectedSv.value ? color : "transparent", {
        duration: animationDuration,
      }),
    };
  });

  const animatedBorderRadius = useAnimatedStyle(() => {
    return {
      borderRadius: withTiming(isSelectedSv.value ? 0 : 10, {
        duration: animationDuration,
      }),
    };
  });

  return (
    <AnimatedPressable
      hitSlop={7}
      onPress={onPress}
      style={[
        {
          borderRadius: 10,
          overflow: "hidden",
          width: itemWidth,
          height: itemWidth,
          marginBottom: isLastColumnItem ? 0 : gapSize,
          marginRight: isLastRowItem ? 0 : gapSize,
          borderWidth: 3,
        },
        animatedStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            flex: 1,
            overflow: "hidden",
            backgroundColor: color,
            opacity: 0.7,
          },
          animatedBorderRadius,
        ]}
      />
    </AnimatedPressable>
  );
};
