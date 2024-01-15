import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../types";
import { HereScreen } from "../screens/Here";
import { FC } from "react";

const Tabs = createBottomTabNavigator<TabsParamList>();

export const MainTabNavigator: FC = () => {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HereScreen} />
    </Tabs.Navigator>
  );
};
