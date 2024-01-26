import { Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useState } from "react";
import { TabsParamList } from "../types";
import { useLocation } from "../hooks/use_location";
import { Slider } from "@rneui/themed";
import { Map } from "../modules/new_space/Map";

export const NewSpaceScreen: FC<
  BottomTabScreenProps<TabsParamList, "NewSpace">
> = () => {
  const [radius, setRadius] = useState(25);
  const { location, permissionGranted } = useLocation();

  if (!permissionGranted) {
    return (
      <View>
        <Text>no permission granted</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View>
        <Text>error</Text>
      </View>
    );
  }

  // TODO: adapt map style to design
  const handleRadiusChange = (newRadius: number) => {
    setRadius(Math.floor(newRadius));
  };

  return (
    <View style={{ flex: 1 }}>
      <Map radius={radius} location={location} />
      <Slider
        value={radius}
        onValueChange={handleRadiusChange}
        maximumValue={100}
        minimumValue={10}
      />
    </View>
  );
};
