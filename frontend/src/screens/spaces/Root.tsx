import { FC } from "react";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList, SpaceStackParamList } from "../../types";
import { createCustomStackNavigator } from "../../navigators/stack_navigator";
import { SpaceOverviewScreen } from "./Overview";
import { SpaceShareScreen } from "./Share";
import { View } from "react-native";
import { SpaceInfoScreen } from "./Info";
import { ThreadScreen } from "./Thread";

const Stack = createCustomStackNavigator<SpaceStackParamList>();

// TODO: add context with space id
export const SpaceRootScreen: FC<
  StackScreenProps<RootStackParamList, "Space">
> = ({ route }) => {
  const { spaceId } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{}}>
        <Stack.Screen name="Overview">
          {() => <SpaceOverviewScreen spaceId={spaceId} />}
        </Stack.Screen>
        <Stack.Screen
          name="Info"
          options={{ animation: "slideInFromRight" }}
          component={SpaceInfoScreen}
        />
        <Stack.Screen
          name="Share"
          options={{ animation: "slideInFromBottom", snapPoint: "96%" }}
        >
          {() => <SpaceShareScreen spaceId={spaceId} />}
        </Stack.Screen>
        <Stack.Screen name="Thread" options={{ animation: "slideInFromRight" }}>
          {() => <ThreadScreen spaceId={spaceId} />}
        </Stack.Screen>
      </Stack.Navigator>
    </View>
  );
};
