import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { TabsParamList } from "../types";
import { HereScreen } from "../screens/Here";
import { FC } from "react";
import { MySpacesScreen } from "../screens/MySpaces";
import { NewSpaceScreen } from "../screens/NewSpace";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HereIcon } from "./icons/HereIcon";
import { MySpacesIcon } from "./icons/MySpacesIcon";
import { AddSpaceIcon } from "./icons/AddSpaceIcon";
import { template } from "../styles/template";

const Tabs = createBottomTabNavigator<TabsParamList>();

const TabBar: FC<BottomTabBarProps & { bottomInsets: number }> = ({
  state,
  descriptors,
  navigation,
  bottomInsets,
}) => {
  return (
    <View
      style={{
        width: "100%",
        paddingBottom: bottomInsets,
        backgroundColor: "#f7f7f7",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "100%",
          height: 50,
          alignItems: "center",
        }}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1, alignItems: "center" }}
              key={index}
            >
              {options.tabBarIcon?.({
                focused: isFocused,
                color: isFocused ? "#673ab7" : "#222",
                size: 24,
              })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const MySpacesTabBarIcon: FC<{ focused: boolean }> = ({ focused }) => {
  if (focused) {
    return (
      <MySpacesIcon fill={template.colors.text} stroke={template.colors.text} />
    );
  }

  return <MySpacesIcon stroke={template.colors.text} />;
};

const HereTabBarIcon: FC<{ focused: boolean }> = ({ focused }) => {
  if (focused) {
    return (
      <HereIcon fill={template.colors.text} stroke={template.colors.text} />
    );
  }

  return <HereIcon stroke={template.colors.text} />;
};

const AddSpaceTabBarIcon: FC = () => {
  return <AddSpaceIcon stroke={template.colors.lila} />;
};

export const MainTabNavigator: FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tabs.Navigator
      tabBar={(props: BottomTabBarProps) => (
        <TabBar {...props} bottomInsets={insets.bottom} />
      )}
    >
      <Tabs.Screen
        name="Here"
        component={HereScreen}
        options={{ headerShown: false, tabBarIcon: HereTabBarIcon }}
      />
      <Tabs.Screen
        name="NewSpace"
        component={NewSpaceScreen}
        options={{ headerShown: false, tabBarIcon: AddSpaceTabBarIcon }}
      />
      <Tabs.Screen
        name="MySpaces"
        component={MySpacesScreen}
        options={{ headerShown: false, tabBarIcon: MySpacesTabBarIcon }}
      />
    </Tabs.Navigator>
  );
};
