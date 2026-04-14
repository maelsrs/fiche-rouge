import { Tabs } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"

export default function HomeTabsLayout() {
    return (
        <Tabs
            screenOptions={{}}
        >
            <Tabs.Screen
                name="(home)"
                options={{
                    title: "Accueil",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="list"
                options={{
                    title: "Liste",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="list" size={24} color={color} />
                    ),
                }}
            />
            
            <Tabs.Screen
                name="quiz"
                options={{
                    title: "Quiz",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="question" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    )
}
