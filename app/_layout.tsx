import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="Login" options={{ title: "Login" }} />
      <Stack.Screen name="Signup" options={{ title: "Sign Up" }} />
      <Stack.Screen name="Profile" options={{ title: "Profile" }} />
      <Stack.Screen name="FindSessions" options={{ title: "Find Study Sessions" }} />
      <Stack.Screen name="CreateSession" options={{ title: "Create Session" }} />
      <Stack.Screen name="CampusMap" options={{ title: "Campus Map" }} />
      <Stack.Screen name="MySessions" options={{ title: "My Sessions" }} />
    </Stack>
  );
}
