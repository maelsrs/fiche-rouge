import { Stack } from "expo-router"

export default function HomeStack() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle: "Home" }} />
            <Stack.Screen name="details" options={{ headerTitle: "Details" }} />

        </Stack>
    )
}