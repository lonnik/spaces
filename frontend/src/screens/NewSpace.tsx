import { Text, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useState } from "react";
import { TabsParamList } from "../types";
import { useLocation } from "../hooks/use_location";
import { Slider } from "@rneui/themed";
import { Map } from "../modules/new_space/RnMap";
import { MapboxMap } from "../modules/new_space/MapboxMap";
import { TextInput } from "react-native-gesture-handler";
import { template } from "../styles/template";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Header } from "../modules/new_space/Header";

export const NewSpaceScreen: FC<
  BottomTabScreenProps<TabsParamList, "NewSpace">
> = () => {
  const [radius, setRadius] = useState(25);
  const { location, permissionGranted } = useLocation();
  const [spaceName, setSpaceName] = useState("");

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

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Header />
      <BottomSheetScrollView style={{ flex: 1, paddingHorizontal: 27 }}>
        <MapboxMap
          style={{
            borderRadius: 10,
            overflow: "hidden",
          }}
          radius={radius}
          location={location}
          spaceName={spaceName || undefined}
        />
        <Slider
          value={radius}
          onValueChange={setRadius}
          maximumValue={100}
          minimumValue={10}
        />
        <TextInput
          value={spaceName}
          onChangeText={setSpaceName}
          style={{
            width: "100%",
            borderWidth: 1,
            paddingVertical: 7,
            paddingHorizontal: 10,
            fontSize: 20,
          }}
        />
      </BottomSheetScrollView>
    </View>
  );
};
