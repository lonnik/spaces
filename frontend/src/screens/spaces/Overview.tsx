import { StackNavigationProp } from "@react-navigation/stack";
import { SpaceStackParamList } from "../../types";
import { FC } from "react";
import { ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../../utils/queries";
import { LoadingScreen } from "../Loading";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { InfoSection } from "../../modules/space/InfoSection";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessagesSection } from "../../modules/space/MessagesSection";
import { useNavigation } from "@react-navigation/native";

export const SpaceOverviewScreen: FC<{ spaceId: string }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const spaceMembers = Array.from({ length: 8 });

  return (
    <View style={{ flex: 1 }}>
      <Header text={`${space?.name} 🏠`} />
      <PrimaryButton
        onPress={() => navigation.navigate("Share")}
        style={{
          alignSelf: "center",
          position: "absolute",
          bottom: insets.bottom + template.paddings.md,
          zIndex: 1000,
        }}
      >
        <Text style={{ color: template.colors.white }}>Share something</Text>
      </PrimaryButton>
      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
        }}
      >
        <View style={{ marginBottom: template.margins.md }}>
          <InfoSection
            onPress={() => navigation.navigate("Info")}
            location={space?.location!}
            radius={space?.radius!}
            spaceMembers={spaceMembers}
          />
        </View>
        <MessagesSection />
        <View style={{ height: insets.bottom + 50 }} />
      </ScrollView>
    </View>
  );
};
