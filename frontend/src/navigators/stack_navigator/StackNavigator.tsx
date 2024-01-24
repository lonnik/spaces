import { useState, useEffect, JSX, useRef, FC } from "react";
import {
  DefaultNavigatorOptions,
  ParamListBase,
  TabActionHelpers,
  TabNavigationState,
  useNavigationBuilder,
  StackRouter,
  StackNavigationState,
  StackRouterOptions,
} from "@react-navigation/native";
import { TabNavigationEventMap, TabNavigationOptions } from "./types";
import { Card } from "./Card";

// The props accepted by the component is a combination of 3 things
type Props = DefaultNavigatorOptions<
  ParamListBase,
  TabNavigationState<ParamListBase>,
  TabNavigationOptions,
  TabNavigationEventMap
> &
  StackRouterOptions;

export const CustomStackNavigator: FC<Props> = ({
  initialRouteName,
  children,
  screenOptions,
}) => {
  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      StackNavigationState<ParamListBase>,
      StackRouterOptions,
      TabActionHelpers<ParamListBase>,
      TabNavigationOptions,
      TabNavigationEventMap
    >(StackRouter, {
      children,
      screenOptions,
      initialRouteName,
    });

  const currentIndexRef = useRef(0);
  const currentRouteKeyRef = useRef("");
  const currentDescriptorRef = useRef<(typeof descriptors)[number]>();

  const [displayedCards, setDisplayedCards] = useState<JSX.Element[]>([]);
  const cards = state.routes.map((route, i) => {
    const tabNavigationOptions = descriptors[route.key].options;

    return (
      <Card
        goBack={() => navigation.goBack()}
        index={i}
        currentIndex={state.index}
        tabNavigationOptions={tabNavigationOptions}
        key={route.key}
      >
        {descriptors[route.key].render()}
      </Card>
    );
  });

  useEffect(() => {
    const lastIndex = currentIndexRef.current;
    const lastDescriptor = currentDescriptorRef.current;
    const lastRouteKey = currentRouteKeyRef.current;

    if (state.index < lastIndex) {
      const tabNavigationOptions = lastDescriptor?.options;

      const lastCard = (
        <Card
          goBack={() => navigation.goBack()}
          index={lastIndex}
          currentIndex={state.index}
          tabNavigationOptions={tabNavigationOptions!}
          key={lastRouteKey}
        >
          {lastDescriptor?.render() as JSX.Element}
        </Card>
      );

      setDisplayedCards([...cards, lastCard]);
    } else {
      setDisplayedCards(cards);
    }

    currentIndexRef.current = state.index;
    currentRouteKeyRef.current = state.routes[state.index].key;
    currentDescriptorRef.current = descriptors[currentRouteKeyRef.current];
  }, [state]);

  return <NavigationContent>{displayedCards}</NavigationContent>;
};
