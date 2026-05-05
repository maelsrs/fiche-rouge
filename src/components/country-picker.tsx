import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import countries from "i18n-iso-countries";

interface Props {
  visible: boolean;
  selected: string | null;
  onSelect: (code: string | null) => void;
  onClose: () => void;
}

const ALL = Object.entries(countries.getNames("fr", { select: "official" }))
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"));

export function CountryPicker({ visible, selected, onSelect, onClose }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ALL;
    return ALL.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView edges={["top"]} className="bg-[#1B2A4E]">
        <View className="px-4 pb-4 pt-2">
          <View className="flex-row items-center justify-between py-2">
            <Pressable
              onPress={onClose}
              className="w-10 h-10 items-center justify-center -ml-2"
            >
              <FontAwesome name="times" size={20} color="white" />
            </Pressable>
            <Text className="text-white text-base font-bold">
              Choisir un pays
            </Text>
            <View className="w-10" />
          </View>

          <View className="flex-row items-center bg-white/10 rounded-full px-4 py-2 mt-2">
            <FontAwesome
              name="search"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un pays..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              className="flex-1 ml-3 text-white"
              autoCorrect={false}
              autoFocus
            />
          </View>
        </View>
      </SafeAreaView>

      <View className="flex-1 bg-white">
        <Pressable
          onPress={() => {
            onSelect(null);
            onClose();
          }}
          className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between"
        >
          <Text className="text-base text-slate-500 italic">Tous les pays</Text>
          {selected === null && (
            <FontAwesome name="check" size={16} color="#1B2A4E" />
          )}
        </Pressable>

        <FlatList
          data={filtered}
          keyExtractor={(c) => c.code}
          renderItem={({ item }) => {
            const isSelected = item.code === selected;
            return (
              <Pressable
                onPress={() => {
                  onSelect(item.code);
                  onClose();
                }}
                className="px-5 py-4 border-b border-slate-100 flex-row items-center justify-between"
              >
                <Text
                  className={
                    "text-base " +
                    (isSelected ? "font-bold text-[#1B2A4E]" : "text-[#1B2A4E]")
                  }
                >
                  {item.name}
                </Text>
                {isSelected && (
                  <FontAwesome name="check" size={16} color="#E63946" />
                )}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
