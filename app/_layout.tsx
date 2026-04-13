import { Tabs } from "expo-router"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function TabsLayout() {
    return (
        <QueryClientProvider client={queryClient}>
        <Tabs>
            <Tabs.Screen name="index" options={{ href: null }} />
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="search"
                options={{
                    title: "Search",
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="search" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
        </QueryClientProvider>
    )
}
