import "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { RootStackNavigator } from "./src/components/RootStackNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <RootStackNavigator />
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
