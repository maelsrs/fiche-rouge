import { Stack } from "expo-router"

export default function QuizStack() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerTitle: "Quiz" }} />
        </Stack>
    )
}