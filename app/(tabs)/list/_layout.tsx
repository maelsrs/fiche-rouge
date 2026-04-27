import { Stack } from "expo-router"

export default function ListStack() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
        </Stack>
    )
}
