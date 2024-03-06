import { StackNavigationProp } from "@react-navigation/stack";
import { SpaceStackParamList, Uuid } from "../../types";
import { FC, useEffect } from "react";
import { View } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSpaceSubscriber, getSpaceById } from "../../utils/queries";
import { Header } from "../../components/Header";
import { template } from "../../styles/template";
import { PrimaryButton } from "../../components/form/PrimaryButton";
import { Text } from "../../components/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ThreadList } from "../../modules/space/components/ThreadList";
import { useSpaceColor } from "../../hooks/use_space_color";

// TODO: animation from bottom on first render for share something button

export const SpaceOverviewScreen: FC<{ spaceId: Uuid }> = ({ spaceId }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<StackNavigationProp<SpaceStackParamList>>();

  const { data: space } = useQuery({
    queryKey: ["spaces", spaceId],
    queryFn: () => getSpaceById(spaceId),
  });

  const spaceColor = useSpaceColor();

  const { mutate: createNewSpaceSubscriber } = useMutation({
    mutationKey: ["createSpaceSubscriber"],
    mutationFn: async () => {
      return createSpaceSubscriber(spaceId);
    },
  });

  useEffect(() => {
    createNewSpaceSubscriber();
  }, []);

  const headerText = space?.name ? `${space.name} 🏠` : "Space";

  return (
    <View style={{ flex: 1 }}>
      <Header text={headerText} displayArrowDownButton />
      <View style={{ flex: 1 }}>
        <PrimaryButton
          color={spaceColor}
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
        <ThreadList spaceId={spaceId} />
      </View>
    </View>
  );
};
