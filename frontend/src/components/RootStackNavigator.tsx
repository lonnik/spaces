import { FC } from "react";
import { RootStackParamList } from "../types";
import { createStackNavigator } from "@react-navigation/stack";
import { Easing } from "react-native";
import { MainTabNavigator } from "./MainTabNavigator";
import { ProfileScreen } from "../screens/Profile";

const Stack = createStackNavigator<RootStackParamList>();

export const RootStackNavigator: FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        gestureDirection: "horizontal",
        transitionSpec: {
          open: {
            animation: "timing",
            config: {
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
          },
          close: {
            animation: "timing",
            config: {
              duration: 200,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            },
          },
        },
        cardStyleInterpolator: ({ current, next, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
                {
                  translateX: next
                    ? next.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -layouts.screen.width], // Old screen slides out to the left
                      })
                    : 1,
                },
                // Add any additional transformations here
              ],
            },
          };
        },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};
