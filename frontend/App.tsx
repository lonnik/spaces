import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackNavigator } from "./src/components/RootStackNavigator";
import { RootStateProvider } from "./src/components/RootContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <RootStateProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <SafeAreaProvider>
            <RootStackNavigator />
          </SafeAreaProvider>
        </NavigationContainer>
      </QueryClientProvider>
    </RootStateProvider>
  );
}
