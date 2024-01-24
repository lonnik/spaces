import {
  ParamListBase,
  TabNavigationState,
  createNavigatorFactory,
} from "@react-navigation/native";
import { TabNavigationEventMap, TabNavigationOptions } from "./types";
import { CustomStackNavigator } from "./StackNavigator";

export const createCustomStackNavigator = createNavigatorFactory<
  TabNavigationState<ParamListBase>,
  TabNavigationOptions,
  TabNavigationEventMap,
  typeof CustomStackNavigator
>(CustomStackNavigator);
