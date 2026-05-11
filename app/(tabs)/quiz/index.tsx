import "../../../global.css";
import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, StatusBar, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AsyncStorage from "@react-native-async-storage/async-storage";
import countries from "i18n-iso-countries";
import {
  getNotices,
  getNoticeDetail,
  IMAGE_HEADERS,
  type NoticeDetail,
} from "@/lib/api";
import { getCountryName } from "@/lib/labels";
import { Skeleton } from "@/src/components/skeleton";

const COUNTRIES = Object.keys(countries.getAlpha2Codes());
const BEST_KEY = "quiz_best_score";
const PER_PAGE = 20;

type Warrant = NoticeDetail["arrest_warrants"][number];

interface Question {
  target: NoticeDetail;
  options: Warrant[];
  correctIndex: number;
  country: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chargeText(w: Warrant): string {
  return (w.charge_translation || w.charge || "").trim();
}

function similar(a: string, b: string): boolean {
  const wordsA = a.toLowerCase().split(/\s+/);
  const wordsB = b.toLowerCase().split(/\s+/);
  const common = wordsA.filter((w) => wordsB.includes(w)).length;
  return common / Math.max(wordsA.length, wordsB.length) >= 0.8;
}

async function buildQuestion(): Promise<Question> {
  const t0 = Date.now();
  let calls = 0;

  for (const country of shuffle(COUNTRIES)) {
    try {
      calls++;
      const first = await getNotices({
        nationality: country,
        page: 1,
        resultPerPage: PER_PAGE,
      });
      if (first.total < 4) continue;

      const totalPages = Math.ceil(first.total / PER_PAGE);
      const page = 1 + Math.floor(Math.random() * totalPages);

      let notices = first.notices;
      if (page !== 1) {
        calls++;
        const next = await getNotices({
          nationality: country,
          page,
          resultPerPage: PER_PAGE,
        });
        notices = next.notices;
      }

      const sample = shuffle(notices).slice(0, 6);
      calls += sample.length;
      const details = await Promise.all(
        sample.map((n) => getNoticeDetail(n.entity_id).catch(() => null)),
      );
      const people: NoticeDetail[] = [];
      for (const d of details) {
        if (d && d.arrest_warrants.length > 0) people.push(d);
      }
      if (people.length < 4) continue;

      const [target, ...others] = shuffle(people);
      const targetWarrant = pickRandom(target.arrest_warrants);

      const seen: string[] = [chargeText(targetWarrant)];
      const distractors: Warrant[] = [];
      for (const person of others) {
        if (distractors.length === 3) break;

        const warrant = pickRandom(person.arrest_warrants);
        const text = chargeText(warrant);
        if (!text) continue;

        if (seen.some((s) => similar(s, text))) continue;

        seen.push(text);
        distractors.push(warrant);
      }
      if (distractors.length < 3) continue;

      const options = shuffle([targetWarrant, ...distractors]);
      console.log(
        `[quiz] ${calls} requêtes en ${Date.now() - t0}ms (pays: ${country})`,
      );
      return {
        target,
        options,
        correctIndex: options.indexOf(targetWarrant),
        country,
      };
    } catch {
      continue;
    }
  }
  throw new Error("no_question");
}

export default function Quiz() {
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [next, setNext] = useState<Question | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [error, setError] = useState(false);

  const requestId = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(BEST_KEY).then((v) => {
      if (v) setBestScore(Number(v) || 0);
    });
  }, []);

  const loadNow = async () => {
    const id = ++requestId.current;
    setQuestion(null);
    setError(false);
    setPicked(null);
    try {
      const q = await buildQuestion();
      if (id === requestId.current) setQuestion(q);
    } catch {
      if (id === requestId.current) setError(true);
    }
  };

  useEffect(() => {
    loadNow();
  }, []);

  useEffect(() => {
    if (!question || next || gameOver) return;
    const id = requestId.current;
    buildQuestion()
      .then((q) => {
        if (id === requestId.current) setNext(q);
      })
      .catch(() => {});
  }, [question, next, gameOver]);

  const advance = () => {
    if (next) {
      setQuestion(next);
      setNext(null);
      setPicked(null);
    } else {
      loadNow();
    }
  };

  const onPick = (idx: number) => {
    if (picked !== null || !question || gameOver) return;
    setPicked(idx);
    const correct = idx === question.correctIndex;

    if (correct) {
      setTimeout(() => {
        setScore((s) => s + 1);
        advance();
      }, 750);
    } else {
      const beat = score > bestScore;
      setTimeout(async () => {
        if (beat) {
          setBestScore(score);
          await AsyncStorage.setItem(BEST_KEY, String(score));
        }
        setNewRecord(beat);
        setGameOver(true);
      }, 1200);
    }
  };

  const restart = () => {
    setScore(0);
    setGameOver(false);
    setNewRecord(false);
    setNext(null);
    loadNow();
  };

  return (
    <View className="flex-1 bg-slate-100">
      <SafeAreaView edges={["top"]} className="bg-[#1B2A4E]">
        <View className="px-5 pt-3 pb-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/60 text-[11px] font-bold tracking-widest">
                SCORE
              </Text>
              <Text className="text-white text-3xl font-extrabold">
                {score}
              </Text>
            </View>
            <View className="bg-red-600 px-3 py-1.5 rounded-md">
              <Text className="text-white text-xs font-extrabold">QUIZ</Text>
            </View>
            <View className="items-end">
              <Text className="text-white/60 text-[11px] font-bold tracking-widest">
                MEILLEUR
              </Text>
              <Text className="text-white text-3xl font-extrabold">
                {bestScore}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>

      {gameOver ? (
        <GameOverView
          score={score}
          bestScore={bestScore}
          newRecord={newRecord}
          onRestart={restart}
        />
      ) : error ? (
        <ErrorView onRetry={loadNow} />
      ) : !question ? (
        <LoadingView />
      ) : (
        <QuestionView question={question} picked={picked} onPick={onPick} />
      )}

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Image
          source={require("../../../assets/interpol-logo.png")}
          style={{
            position: "absolute",
            bottom: -400,
            left: -250,
            right: -250,
            height: 800,
            opacity: 0.07,
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

function QuestionView({
  question,
  picked,
  onPick,
}: {
  question: Question;
  picked: number | null;
  onPick: (idx: number) => void;
}) {
  const { target, options, correctIndex, country } = question;
  const thumb = target._links.thumbnail?.href;
  const answered = picked !== null;
  const [zoomOpen, setZoomOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      key={target.entity_id}
      entering={FadeIn.duration(250)}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        <View className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <Pressable
            onPress={() => thumb && setZoomOpen(true)}
            disabled={!thumb}
            className="w-full h-64 bg-slate-200 items-center justify-center"
          >
            {thumb ? (
              <Image
                source={{ uri: thumb, headers: IMAGE_HEADERS }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <FontAwesome name="user" size={64} color="#94A3B8" />
            )}
            {thumb && (
              <View
                className="absolute top-3 right-3 w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
              >
                <FontAwesome name="expand" size={14} color="white" />
              </View>
            )}
          </Pressable>

          <View className="p-5">
            <Text className="text-2xl font-bold text-[#1B2A4E]">
              {target.name}
            </Text>
            {target.forename ? (
              <Text className="text-base text-slate-500 mt-1">
                {target.forename}
              </Text>
            ) : null}
            <View className="flex-row items-center mt-3" style={{ gap: 8 }}>
              <View className="bg-blue-100 px-2 py-1 rounded-md">
                <Text className="text-[11px] font-bold text-blue-700">
                  {getCountryName(country) ?? country}
                </Text>
              </View>
              {target.date_of_birth ? (
                <Text className="text-xs text-slate-500">
                  né le {target.date_of_birth}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <Text className="text-[#1B2A4E] font-bold text-base mt-6 mb-3">
          Quel est son mandat d'arrêt ?
        </Text>

        {options.map((w, i) => {
          const isCorrect = i === correctIndex;
          const isPicked = i === picked;
          let style = "bg-white border border-slate-200";
          if (answered && isCorrect) {
            style = "bg-green-50 border-2 border-green-500";
          } else if (answered && isPicked && !isCorrect) {
            style = "bg-red-50 border-2 border-red-500";
          } else if (answered) {
            style = "bg-white border border-slate-200 opacity-60";
          }

          return (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 60).duration(250)}
            >
              <Pressable
                disabled={answered}
                onPress={() => onPick(i)}
                className={`rounded-2xl p-4 mb-2 ${style}`}
              >
                <View className="flex-row items-start" style={{ gap: 10 }}>
                  <View className="flex-1">
                    <Text className="text-sm text-[#1B2A4E] leading-5">
                      {chargeText(w)}
                    </Text>
                  </View>
                  {answered && isCorrect ? (
                    <FontAwesome name="check" size={16} color="#22C55E" />
                  ) : answered && isPicked ? (
                    <FontAwesome name="times" size={16} color="#EF4444" />
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <Modal
        visible={zoomOpen}
        onRequestClose={() => setZoomOpen(false)}
        animationType="fade"
        transparent
        statusBarTranslucent
      >
        <StatusBar hidden />
        <View className="flex-1 bg-black">
          {thumb && (
            <Image
              source={{ uri: thumb, headers: IMAGE_HEADERS }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          )}
          <View
            className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4"
            style={{ paddingTop: insets.top + 8, paddingBottom: 8 }}
          >
            <Pressable
              onPress={() => setZoomOpen(false)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <FontAwesome name="times" size={18} color="white" />
            </Pressable>
            <View className="w-10" />
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

function LoadingView() {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <Skeleton width="100%" height={256} radius={0} />
        <View className="p-5" style={{ gap: 10 }}>
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={16} />
          <View className="flex-row mt-2" style={{ gap: 8 }}>
            <Skeleton width={70} height={22} radius={6} />
            <Skeleton width={90} height={14} />
          </View>
        </View>
      </View>

      <View className="mt-6 mb-3">
        <Skeleton width="55%" height={18} />
      </View>

      {Array.from({ length: 4 }).map((_, i) => (
        <View key={i} className="mb-2">
          <Skeleton width="100%" height={64} radius={16} />
        </View>
      ))}
    </ScrollView>
  );
}

function ErrorView({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <FontAwesome name="exclamation-triangle" size={36} color="#94A3B8" />
      <Text className="text-slate-600 mt-4 text-center">
        Impossible de charger une question. Vérifie ta connexion.
      </Text>
      <Pressable
        onPress={onRetry}
        className="bg-[#1B2A4E] rounded-full px-6 py-3 mt-6"
      >
        <Text className="text-white font-bold">Réessayer</Text>
      </Pressable>
    </View>
  );
}

function GameOverView({
  score,
  bestScore,
  newRecord,
  onRestart,
}: {
  score: number;
  bestScore: number;
  newRecord: boolean;
  onRestart: () => void;
}) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-1 items-center justify-center px-8"
    >
      <Text className="text-red-600 text-sm font-extrabold tracking-widest">
        GAME OVER
      </Text>
      <Text className="text-[#1B2A4E] text-6xl font-extrabold mt-2">
        {score}
      </Text>
      <Text className="text-slate-500 mt-2">
        {score <= 1 ? "bonne réponse" : "bonnes réponses"}
      </Text>

      {newRecord ? (
        <View
          className="flex-row items-center bg-[#1B2A4E] px-3 py-1.5 rounded-full mt-4"
          style={{ gap: 6 }}
        >
          <FontAwesome name="star" size={11} color="#fff" />
          <Text className="text-white text-xs font-bold tracking-wide">
            Nouveau record
          </Text>
        </View>
      ) : (
        <Text className="text-slate-400 text-xs mt-4">
          Meilleur score : {bestScore}
        </Text>
      )}

      <Pressable
        onPress={onRestart}
        className="bg-red-600 rounded-full px-8 py-4 mt-10"
      >
        <Text className="text-white font-extrabold tracking-wider">
          REJOUER
        </Text>
      </Pressable>
    </Animated.View>
  );
}
