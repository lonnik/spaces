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
          <View style={{ marginBottom: template.margins.md }}>
            <InfoSection
              onPress={() => navigation.navigate("Info")}
              location={space?.location!}
              radius={space?.radius!}
              spaceMembers={spaceMembers}
            />
          </View>
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
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 0,
          width: "100%",
          height: 10,
          backgroundColor: template.colors.white,
        }}
      />
      <View
        style={{
          backgroundColor: "#eee",
          borderRadius: 10,
          padding: 10,
          flex: 1,
          flexDirection: "row",
        }}
      >
        {["Threads", "Images", ""].map((text, index) => {
          return (
            <Text
              key={text}
              style={{
                fontSize: 18,
                color: template.colors.text,
                fontWeight: index === 0 ? "600" : "400",
                marginRight: 20,
              }}
            >
              {text}
            </Text>
          );
        })}
      </View>
    </View>
  );
};
