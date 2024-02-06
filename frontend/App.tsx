import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackNavigator } from "./src/components/navigators/RootStackNavigator";
import { UserStateProvider } from "./src/components/context/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const queryClient = new QueryClient();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#000" }}>
      <UserStateProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer>
            <SafeAreaProvider>
              <RootStackNavigator />
            </SafeAreaProvider>
          </NavigationContainer>
        </QueryClientProvider>
      </UserStateProvider>
    </GestureHandlerRootView>
  );
}
