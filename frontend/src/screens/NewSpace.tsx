import { Pressable, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useState } from "react";
import { TabsParamList } from "../types";
import { useLocation } from "../hooks/use_location";
// import { RnMap } from "../modules/new_space/RnMap";
import { MapboxMap } from "../modules/new_space/MapboxMap";
import { template } from "../styles/template";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Header } from "../modules/new_space/Header";
import { Text } from "../components/Text";
import { Slider } from "../components/form/Slider";
import { TextInput } from "../components/form/TextInput";

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
      <BottomSheetScrollView
        style={{
          flex: 1,
          paddingHorizontal: 20,
          columnGap: 20,
          flexDirection: "column",
        }}
      >
        <MapboxMap
          style={{
            borderRadius: 10,
            overflow: "hidden",
            marginBottom: template.margins.md,
          }}
          radius={radius}
          location={location}
          spaceName={spaceName || undefined}
        />
        <Slider
          setRadius={setRadius}
          radius={radius}
          style={{ marginBottom: template.margins.md }}
        />
        <TextInput
          value={spaceName}
          setValue={setSpaceName}
          placeholder="Space Name"
          style={{ marginBottom: template.margins.md }}
        />
        <View style={{ alignItems: "center" }}>
          <Pressable
            style={{
              marginHorizontal: "auto",
              backgroundColor: template.colors.purple,
              paddingHorizontal: 29,
              paddingVertical: 13,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "#FFF",
                fontSize: 18,
                fontWeight: "700",
                letterSpacing: 0.36,
                textTransform: "uppercase",
              }}
            >
              Create Space
            </Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </View>
  );
};
