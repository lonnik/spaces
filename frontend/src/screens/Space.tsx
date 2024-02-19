import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types";
import { FC } from "react";
import { ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../utils/queries";
import { LoadingScreen } from "./Loading";
import { Header } from "../components/Header";
import { template } from "../styles/template";
import { InfoSection } from "../modules/space/InfoSection";
import { PrimaryButton } from "../components/form/PrimaryButton";
import { Text } from "../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// TODO info component:
// improve function for radius calculation

// TODO:
// improve loading/error screen

export const SpaceScreen: FC<StackScreenProps<RootStackParamList, "Space">> = ({
  route,
}) => {
  const { spaceId } = route.params;

  const insets = useSafeAreaInsets();

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const spaceMembers = Array.from({ length: 8 });

  return (
    <View style={{ flex: 1 }}>
      <Header text={`${space?.name} 🏠`} />
      <PrimaryButton
        onPress={() => {}}
        style={{
          alignSelf: "center",
          position: "absolute",
          bottom: insets.bottom + template.paddings.md,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: template.colors.white }}>Write something</Text>
      </PrimaryButton>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
        }}
      >
        <InfoSection
          location={space?.location!}
          radius={space?.radius!}
          spaceMembers={spaceMembers}
        />
        <View
          style={{
            flex: 1,
            backgroundColor: "black",
          }}
        ></View>
      </ScrollView>
    </View>
  );
};
