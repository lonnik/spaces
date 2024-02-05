import { FC } from "react";
import { Slider as RneuiSlider } from "@rneui/themed";
import { template } from "../../styles/template";
import { StyleProp, ViewStyle } from "react-native";

export const Slider: FC<{
  setRadius: (newRadius: number) => void;
  radius: number;
  style?: StyleProp<ViewStyle>;
}> = ({ setRadius, radius, style }) => {
  return (
    <RneuiSlider
      value={radius}
      onValueChange={setRadius}
      maximumValue={100}
      minimumValue={10}
      style={style}
      thumbStyle={{
        backgroundColor: template.colors.purple,
        height: 37,
        width: 37,
      }}
      trackStyle={{ height: 8, borderRadius: 4 }}
      maximumTrackTintColor="#eee"
      minimumTrackTintColor={template.colors.purpleLight}
    />
  );
};
