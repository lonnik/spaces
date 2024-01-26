import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../types";
import { HereScreen } from "../screens/Here";
import { FC } from "react";
import { MySpacesScreen } from "../screens/MySpaces";
import { NewSpaceScreen } from "../screens/NewSpace";

const Tabs = createBottomTabNavigator<TabsParamList>();

export const MainTabNavigator: FC = () => {
  return (
    <Tabs.Navigator>
      <Tabs.Screen
        name="Here"
        component={HereScreen}
        options={{ headerShown: false }}
      />
      <Tabs.Screen
        name="NewSpace"
        component={NewSpaceScreen}
        options={{ headerShown: false }}
      />
      <Tabs.Screen
        name="MySpaces"
        component={MySpacesScreen}
        options={{ headerShown: false }}
      />
    </Tabs.Navigator>
  );
};
