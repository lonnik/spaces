import { StackNavigationProp } from "@react-navigation/stack";
import { SpaceStackParamList } from "../../types";
import { FC } from "react";
import { FlatList, ListRenderItem, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { getSpaceById } from "../../utils/queries";
import { LoadingScreen } from "../Loading";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { InfoSection } from "../../modules/space/InfoSection";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Message } from "../../modules/space/MessagesSection";
import { useNavigation } from "@react-navigation/native";

export const SpaceOverviewScreen: FC<{ spaceId: string }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();

  const { data: space, isLoading } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  const data = [
    undefined,
    undefined,
    ...Array.from({ length: 20 }).map(() => undefined),
  ];

  const renderItem: ListRenderItem<undefined> = ({ index }) => {
    switch (index) {
      case 0:
        return (
          <InfoSection
            spaceMembers={Array.from({ length: 8 })}
            onPress={() => navigation.navigate("Info")}
            style={{ marginBottom: template.margins.md }}
          />
        );
      case 1:
        return <ButtonSection />;
      case data.length - 1:
        return <View style={{ height: insets.bottom + 50 }} />;
      default:
        return <Message />;
    }
  };

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
      <FlatList
        data={data}
        style={{
          flex: 1,
          paddingHorizontal: template.paddings.md,
          flexDirection: "column",
          paddingBottom: insets.bottom + 50,
        }}
        stickyHeaderIndices={[1]}
        renderItem={renderItem}
      />
    </View>
  );
};

const ButtonSection: FC = () => {
  return (
    <View
      style={{
        flex: 1,
        marginBottom: template.margins.md,
        position: "relative",
        backgroundColor: template.colors.white,
      }}
    >
      <Text style={{ fontSize: 30, fontWeight: "600" }}>Threads</Text>
    </View>
  );
};
