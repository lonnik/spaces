import { View } from "react-native";
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
import { Label } from "../components/form/Label";
import { ColorPicker } from "../modules/new_space/ColorPicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/form/PrimaryButton";

const screenPaddingHorizontal = 20;
const gapSize = 10; // This is the uniform gap size you want
const numberOfColumns = 7;

const colors = [
  template.colors.purple,
  "#212078",
  "#69701e",
  template.colors.purple,
  "#ddd",
  "#faa",
  template.colors.purple,
  "#ddd",
  "#faa",
  template.colors.purple,
  "#ddd",
  "#faa",
  template.colors.purple,
  "#ddd",
  "#faa",
  template.colors.purple,
  "#ddd",
];

const RadiusSection: FC<{
  radius: number;
  setRadius: (newRadius: number) => void;
  color: string;
}> = ({ setRadius, radius, color }) => {
  return (
    <View style={{ marginBottom: template.margins.md }}>
      <Label style={{ marginBottom: 10 }}>Radius</Label>
      <Slider setRadius={setRadius} radius={radius} color={color} />
    </View>
  );
};

const ColorSection: FC<{
  selectedColorIndex: number;
  setSelectedColorIndex: (newColorIndex: number) => void;
}> = ({ selectedColorIndex, setSelectedColorIndex }) => {
  return (
    <View>
      <Label style={{ marginBottom: 10 }}>Color</Label>
      <ColorPicker
        colors={colors}
        selectedIndex={selectedColorIndex}
        setSelectedColorIndex={setSelectedColorIndex}
        gapSize={gapSize}
        numberOfColumns={numberOfColumns}
        screenPaddingHorizontal={screenPaddingHorizontal}
      />
    </View>
  );
};

const NameSection: FC<{
  spaceName: string;
  setSpaceName: (newSpaceName: string) => void;
}> = ({ spaceName, setSpaceName }) => {
  return (
    <View style={{ marginBottom: template.margins.md }}>
      <Label style={{ marginBottom: 10 }}>Name</Label>
      <TextInput
        value={spaceName}
        setValue={setSpaceName}
        placeholder="Space Name"
      />
    </View>
  );
};

export const NewSpaceScreen: FC<
  BottomTabScreenProps<TabsParamList, "NewSpace">
> = () => {
  const [radius, setRadius] = useState(25);
  const [spaceName, setSpaceName] = useState("");
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const { location, permissionGranted } = useLocation();
  const insets = useSafeAreaInsets();

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
          paddingHorizontal: screenPaddingHorizontal,
          flexDirection: "column",
        }}
      >
        <MapboxMap
          radius={radius}
          location={location}
          spaceName={spaceName || undefined}
          color={colors[selectedColorIndex]}
          style={{
            marginBottom: template.margins.md,
          }}
        />
        <RadiusSection
          radius={radius}
          setRadius={setRadius}
          color={colors[selectedColorIndex]}
        />
        <NameSection spaceName={spaceName} setSpaceName={setSpaceName} />
        <ColorSection
          selectedColorIndex={selectedColorIndex}
          setSelectedColorIndex={setSelectedColorIndex}
        />
        <View
          style={{
            alignItems: "center",
            marginTop: template.margins.md + 10,
            marginBottom: insets.bottom + 20,
          }}
        >
          <PrimaryButton color={colors[selectedColorIndex]}>
            Create Space
          </PrimaryButton>
        </View>
      </BottomSheetScrollView>
    </View>
  );
};
