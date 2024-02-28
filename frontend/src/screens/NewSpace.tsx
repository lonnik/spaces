import { KeyboardAvoidingView, View } from "react-native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { FC, useEffect, useState } from "react";
import { RootStackParamList, TabsParamList } from "../types";
import { useLocation } from "../hooks/use_location";
// import { RnMap } from "../modules/new_space/RnMap";
import { MapboxMap } from "../modules/new_space/MapboxMap";
import { template } from "../styles/template";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Header } from "../components/Header";
import { Text } from "../components/Text";
import { TextInput, TextInputError } from "../components/form/TextInput";
import { Label } from "../components/form/Label";
import { ColorPicker } from "../modules/new_space/ColorPicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/form/PrimaryButton";
import { Slider } from "../components/form/Slider";
import { useNewSpaceState } from "../components/context/NewSpaceContext";
import { ZodError, z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { createSpace } from "../utils/queries";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNotification } from "../utils/notifications";

const screenPaddingHorizontal = template.paddings.md;
const gapSize = 8; // This is the uniform gap size you want
const numberOfColumns = 8;

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

const getSpaceNameErrors = (name: string): TextInputError[] => {
  try {
    z.string()
      .min(2, { message: "space name must have at least two characters" })
      .max(40, { message: "space name must have less than 40 characters" })
      .parse(name);

    return [];
  } catch (error: ZodError | any) {
    if (error instanceof ZodError) {
      return error.errors.map((e) => ({ code: e.code, message: e.message }));
    }

    return [{ code: "unknown", message: error?.message }];
  }
};

export const NewSpaceScreen: FC<
  BottomTabScreenProps<TabsParamList, "NewSpace">
> = () => {
  const [spaceNameErrors, setSpaceNameErrors] = useState<TextInputError[]>([]);

  const [newSpaceState, dispatch] = useNewSpaceState();
  const { radius, name, selectedColorIndex } = newSpaceState;

  const handleRadiusChange = (newRadius: number) => {
    dispatch!({ type: "SET_RADIUS", newRadius });
  };

  const handleNameChange = (newName: string) => {
    dispatch!({ type: "SET_NAME", newName });
  };

  // sets spaceNameErrors to empty arry when there are no errors
  // when there are errors, it adds those errors to spaceNameErrors while ignoring a NEW "too_small" error (but not ignoring an existing "too_small" error)
  useEffect(() => {
    const errors = getSpaceNameErrors(name);

    if (errors.length === 0) {
      setSpaceNameErrors([]);

      return;
    }

    setSpaceNameErrors((oldErrors) => {
      return oldErrors
        .concat(errors.filter((error) => error.code !== "too_small"))
        .reduce<TextInputError[]>((acc, error) => {
          return acc.some((e) => e.code === error.code)
            ? acc
            : acc.concat(error);
        }, []);
    });
  }, [name]);

  const handleNameBlur = () => {
    setSpaceNameErrors(getSpaceNameErrors(name));
  };

  const handleSelectedColorIndexChange = (newIndex: number) => {
    dispatch!({ type: "SELECT_COLOR_INDEX", newIndex });
  };

  const { location, permissionGranted } = useLocation();
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const notification = useNotification();

  const { mutate: createNewSpace } = useMutation({
    mutationFn: createSpace,
    mutationKey: ["createSpace"],
    onSuccess(data) {
      notification.updateNotification({
        title: "Space Created 🚀",
        description: "You're all set!",
        type: "success",
      });

      dispatch!({ type: "SET_NAME", newName: "" });
      dispatch!({ type: "SET_RADIUS", newRadius: 20 });
      dispatch!({ type: "SELECT_COLOR_INDEX", newIndex: 0 });

      navigation.replace("Space" as any, { spaceId: data.spaceId });
    },
  });

  const handleSubmit = () => {
    if (!location) return;

    const errors = getSpaceNameErrors(name);
    if (errors.length > 0) {
      notification.showNotification({
        title: "Something went wrong 😕",
        description: "Please change the name of the space",
        type: "error",
      });

      setSpaceNameErrors(errors);

      return;
    }

    notification.showNotification({
      title: "Creating Space ...",
      type: "loading",
      duration: 999999,
    });

    createNewSpace({
      location,
      name,
      radius,
      themeColorHexaCode: colors[selectedColorIndex],
    });
  };

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
      <Header text="New Space" displayArrowDownButton />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={insets.top}
      >
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
            spaceName={name || undefined}
            color={colors[selectedColorIndex]}
            style={{
              marginBottom: template.margins.md,
              borderRadius: 10,
              overflow: "hidden",
            }}
          />
          <NameSection
            spaceName={name}
            setSpaceName={handleNameChange}
            handleBlur={handleNameBlur}
            errors={spaceNameErrors}
          />
          <RadiusSection
            radius={radius}
            setRadius={handleRadiusChange}
            color={colors[selectedColorIndex]}
          />
          <ColorSection
            selectedColorIndex={selectedColorIndex}
            setSelectedColorIndex={handleSelectedColorIndexChange}
          />
          <View
            style={{
              alignItems: "center",
              marginTop: template.margins.md + 10,
              marginBottom: insets.bottom + 20,
            }}
          >
            <PrimaryButton
              color={colors[selectedColorIndex]}
              onPress={handleSubmit}
            >
              Create Space
            </PrimaryButton>
          </View>
        </BottomSheetScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const RadiusSection: FC<{
  radius: number;
  setRadius: (newRadius: number) => void;
  color: string;
}> = ({ setRadius, radius, color }) => {
  return (
    <View style={{ marginBottom: template.margins.md + 20 }}>
      <Label style={{ marginBottom: 10 }}>Radius (meters)</Label>
      <Slider
        initialValue={radius}
        maximumValue={100}
        onValueChange={setRadius}
        style={{ height: 35 }}
        thumbStyle={{ width: 28, backgroundColor: color }}
        trackStyle={{ height: 7, borderRadius: 4 }}
        minimumTrackTintColor={color}
        minimumValue={10}
        scaleFactor={1.7}
      />
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
  errors: TextInputError[];
  handleBlur: () => void;
}> = ({ spaceName, setSpaceName, errors, handleBlur }) => {
  return (
    <View style={{ marginBottom: template.margins.md }}>
      <Label style={{ marginBottom: 10 }}>Name</Label>
      <TextInput
        errors={errors}
        text={spaceName}
        setText={setSpaceName}
        onBlur={handleBlur}
        placeholder="Space Name"
        returnKeyType="next"
      />
    </View>
  );
};
