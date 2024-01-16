import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../types";
import { HereScreen } from "../screens/Here";
import { FC } from "react";
import { MySpacesScreen } from "../screens/MySpaces";

const Tabs = createBottomTabNavigator<TabsParamList>();

export const MainTabNavigator: FC = () => {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Here" component={HereScreen} />
      <Tabs.Screen
        name="MySpaces"
        options={{ headerTitle: "My Spaces", tabBarLabel: "My Spaces" }}
        component={MySpacesScreen}
      />
    </Tabs.Navigator>
  );
};
