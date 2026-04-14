import "../../../global.css"
import { StyleSheet, Text, View, Pressable, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

interface Notice {
  entity_id: string;
  forename: string;
  name: string;
  date_of_birth: string;
  nationalities: string[];

  _links: {
    self: { href: string };
    images: { href: string };
    thumbnail: { href: string };
  };
}

const api = "https://ws-public.interpol.int/notices/v1/red?nationality=FR"

export default function Home() {
  const router = useRouter();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const response = await fetch(api);
      const data = await response.json();
      return data._embedded.notices as Notice[];
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
        <Pressable style={styles.button} onPress={() => router.push("/(tabs)/(home)/details")}>
          <Text style={styles.buttonText}>Go to Details</Text>
        </Pressable>
        <FlatList
          data={notices}
          keyExtractor={(item) => item.entity_id}
          renderItem={({ item }) => (
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.forename} {item.name}
              </Text>
              <Text>Date of Birth: {item.date_of_birth}</Text>
              <Text>Nationalities: {item.nationalities.join(", ")}</Text>
              <Image
                source={{ uri: item._links.thumbnail.href }}
                style={{ width: 100, height: 100 }}
              />
            </View>
          )}
        />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});
