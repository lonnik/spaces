import { FC } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

export const ColorPicker: FC<{
  colors: string[];
  selectedIndex: number;
  setSelectedColorIndex: (newSelectedColorIndex: number) => void;
  gapSize: number;
  numberOfColumns: number;
  screenPaddingHorizontal: number;
}> = ({
  colors,
  selectedIndex,
  setSelectedColorIndex,
  gapSize,
  numberOfColumns,
  screenPaddingHorizontal,
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
          <Pressable
            key={index}
            onPress={() => setSelectedColorIndex(index)}
            style={[
              {
                borderRadius: 10,
                overflow: "hidden",
                width: itemWidth,
                height: itemWidth,
                marginBottom: isLastColumnItem ? 0 : gapSize,
                marginRight: isLastRowItem ? 0 : gapSize,
                borderWidth: 3,
                borderColor: "transparent",
              },
              isSelected && {
                borderColor: color,
              },
            ]}
          >
            <View
              style={[
                {
                  flex: 1,
                  overflow: "hidden",
                  backgroundColor: color,
                  opacity: 0.7,
                },
                !isSelected && { borderRadius: 10 },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
};
