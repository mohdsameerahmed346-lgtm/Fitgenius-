console.log("APP STARTED");
console.log(process.env.REACT_APP_SUPABASE_URL);
import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────

const PLANS = {
  free: { name: "Free", chatLimit: 3 },
  pro: { name: "Pro", chatLimit: Infinity },
};

const WORKOUTS = {
  beginner: {
    chest: [
      { name: "Wall Push-ups", sets: 3, reps: 15, rest: "60s" },
      { name: "Knee Push-ups", sets: 3, reps: 12, rest: "60s" },
      { name: "Chest Squeeze", sets: 3, reps: 20, rest: "45s" },
      { name: "Incline Push-ups", sets: 2, reps: 10, rest: "60s" },
      { name: "Floor Chest Press", sets: 3, reps: 12, rest: "60s" },
    ],
    back: [
      { name: "Superman Hold", sets: 3, reps: 12, rest: "45s" },
      { name: "Reverse Snow Angels", sets: 3, reps: 15, rest: "45s" },
      { name: "Bird Dog", sets: 3, reps: 10, rest: "45s" },
      { name: "Doorframe Rows", sets: 3, reps: 12, rest: "60s" },
      { name: "Prone Y-T-W", sets: 2, reps: 10, rest: "45s" },
    ],
    legs: [
      { name: "Bodyweight Squats", sets: 3, reps: 15, rest: "60s" },
      { name: "Lunges", sets: 3, reps: 10, rest: "60s" },
      { name: "Glute Bridges", sets: 3, reps: 15, rest: "45s" },
      { name: "Wall Sit", sets: 3, reps: "30s", rest: "60s" },
      { name: "Calf Raises", sets: 3, reps: 20, rest: "45s" },
    ],
    fullbody: [
      { name: "Jumping Jacks", sets: 3, reps: 20, rest: "45s" },
      { name: "Bodyweight Squats", sets: 3, reps: 15, rest: "60s" },
      { name: "Push-ups", sets: 3, reps: 10, rest: "60s" },
      { name: "Mountain Climbers", sets: 3, reps: 20, rest: "45s" },
      { name: "Plank", sets: 3, reps: "30s", rest: "45s" },
      { name: "Glute Bridges", sets: 2, reps: 15, rest: "45s" },
    ],
  },
  intermediate: {
    chest: [
      { name: "Standard Push-ups", sets: 4, reps: 15, rest: "60s" },
      { name: "Wide Push-ups", sets: 3, reps: 12, rest: "60s" },
      { name: "Diamond Push-ups", sets: 3, reps: 10, rest: "75s" },
      { name: "Decline Push-ups", sets: 3, reps: 12, rest: "60s" },
      { name: "Plyometric Push-ups", sets: 2, reps: 8, rest: "90s" },
    ],
    back: [
      { name: "Pull-ups", sets: 3, reps: 8, rest: "90s" },
      { name: "Inverted Rows", sets: 3, reps: 12, rest: "60s" },
      { name: "Resistance Band Rows", sets: 4, reps: 15, rest: "60s" },
      { name: "Single Arm Row", sets: 3, reps: 12, rest: "60s" },
      { name: "Face Pulls", sets: 3, reps: 15, rest: "45s" },
    ],
    legs: [
      { name: "Jump Squats", sets: 4, reps: 12, rest: "75s" },
      { name: "Bulgarian Split Squats", sets: 3, reps: 10, rest: "75s" },
      { name: "Romanian Deadlift", sets: 3, reps: 12, rest: "75s" },
      { name: "Lateral Lunges", sets: 3, reps: 12, rest: "60s" },
      { name: "Single Leg Glute Bridge", sets: 3, reps: 12, rest: "60s" },
    ],
    fullbody: [
      { name: "Burpees", sets: 3, reps: 10, rest: "75s" },
      { name: "Jump Squats", sets: 3, reps: 12, rest: "60s" },
      { name: "Push-ups", sets: 3, reps: 15, rest: "60s" },
      { name: "Mountain Climbers", sets: 3, reps: 25, rest: "45s" },
      { name: "Plank to Downdog", sets: 3, reps: 10, rest: "45s" },
      { name: "Reverse Lunges", sets: 3, reps: 12, rest: "60s" },
    ],
  },
  advanced: {
    chest: [
      { name: "Explosive Push-ups", sets: 4, reps: 12, rest: "75s" },
      { name: "Archer Push-ups", sets: 3, reps: 8, rest: "90s" },
      { name: "One-Arm Push-up Assist", sets: 3, reps: 6, rest: "90s" },
      { name: "Typewriter Push-ups", sets: 3, reps: 8, rest: "75s" },
      { name: "Pike Push-ups", sets: 3, reps: 12, rest: "60s" },
    ],
    back: [
      { name: "Weighted Pull-ups", sets: 4, reps: 8, rest: "90s" },
      { name: "L-Sit Pull-ups", sets: 3, reps: 6, rest: "90s" },
      { name: "Typewriter Pull-ups", sets: 3, reps: 5, rest: "90s" },
      { name: "Archer Rows", sets: 3, reps: 10, rest: "75s" },
      { name: "Planche Leans", sets: 3, reps: "20s", rest: "60s" },
    ],
    legs: [
      { name: "Pistol Squats", sets: 4, reps: 6, rest: "90s" },
      { name: "Nordic Curls", sets: 3, reps: 5, rest: "90s" },
      { name: "Shrimp Squats", sets: 3, reps: 8, rest: "90s" },
      { name: "Jumping Lunges", sets: 3, reps: 12, rest: "75s" },
      { name: "Box Jumps", sets: 3, reps: 10, rest: "75s" },
    ],
    fullbody: [
      { name: "Burpee Pull-ups", sets: 3, reps: 8, rest: "90s" },
      { name: "Pistol Squats", sets: 3, reps: 6, rest: "90s" },
      { name: "Archer Push-ups", sets: 3, reps: 8, rest: "90s" },
      { name: "Dragon Flags", sets: 3, reps: 6, rest: "90s" },
      { name: "Tuck Planche", sets: 3, reps: "15s", rest: "60s" },
      { name: "Explosive Lunges", sets: 3, reps: 10, rest: "75s" },
    ],
  },
};

const YOGA = {
  flexibility: [
    { name: "Cat-Cow (Marjaryasana)", duration: "2 min", desc: "Kneel on all fours. Inhale arch back, exhale round spine.", benefit: "Spinal mobility" },
    { name: "Seated Forward Fold (Paschimottanasana)", duration: "2 min", desc: "Sit with legs extended. Hinge forward from hips.", benefit: "Hamstring stretch" },
    { name: "Pigeon Pose (Eka Pada Kapotasana)", duration: "2 min each", desc: "Hip opener. Place shin parallel to mat front edge.", benefit: "Hip flexibility" },
    { name: "Butterfly (Baddha Konasana)", duration: "2 min", desc: "Sit with soles together. Press knees toward floor.", benefit: "Inner thigh stretch" },
    { name: "Child's Pose (Balasana)", duration: "2 min", desc: "Kneel, sit on heels, extend arms forward.", benefit: "Full body release" },
  ],
  stress: [
    { name: "Easy Pose (Sukhasana)", duration: "3 min", desc: "Sit cross-legged. Rest hands on knees. Breathe deeply.", benefit: "Calms nervous system" },
    { name: "Legs Up Wall (Viparita Karani)", duration: "5 min", desc: "Lie on back, legs vertical against wall.", benefit: "Reduces anxiety" },
    { name: "Corpse Pose (Savasana)", duration: "5 min", desc: "Lie flat. Relax every muscle consciously.", benefit: "Deep relaxation" },
    { name: "Child's Pose (Balasana)", duration: "3 min", desc: "Kneel, fold forward, arms extended.", benefit: "Stress relief" },
    { name: "Standing Forward Fold (Uttanasana)", duration: "2 min", desc: "Stand, fold at hips, let head hang.", benefit: "Calms mind" },
  ],
  strength: [
    { name: "Chair Pose (Utkatasana)", duration: "45s × 3", desc: "Stand, squat as if sitting on chair, arms overhead.", benefit: "Leg + core strength" },
    { name: "Warrior I (Virabhadrasana I)", duration: "1 min each", desc: "Lunge with back foot at 45°, arms overhead.", benefit: "Full body strength" },
    { name: "Warrior II (Virabhadrasana II)", duration: "1 min each", desc: "Wide stance, arms parallel to floor.", benefit: "Hip + shoulder strength" },
    { name: "Boat Pose (Navasana)", duration: "30s × 3", desc: "Sit, lean back, lift legs to 45°, arms forward.", benefit: "Core strength" },
    { name: "Plank (Phalakasana)", duration: "45s × 3", desc: "Full body straight line, wrists under shoulders.", benefit: "Full body strength" },
  ],
  weightloss: [
    { name: "Sun Salutation A (Surya Namaskar)", duration: "5 rounds", desc: "12-step flowing sequence. Move with breath.", benefit: "Full body + cardio" },
    { name: "Warrior III (Virabhadrasana III)", duration: "45s each", desc: "Balance on one leg, body parallel to floor.", benefit: "Balance + core" },
    { name: "Twisted Chair (Parivrtta Utkatasana)", duration: "45s each", desc: "Chair pose with torso twist.", benefit: "Detox + strength" },
    { name: "Jump Back Flow", duration: "5 rounds", desc: "Plank → Chaturanga → Updog → Downdog flow.", benefit: "Cardio + strength" },
    { name: "Crow Pose (Bakasana)", duration: "3 attempts × 20s", desc: "Balance on bent arms, knees on triceps.", benefit: "Core + arm strength" },
  ],
};

const DIET_ENGINE = {
  weightloss: {
    veg: {
      50: {
        breakfast: { food: "Poha with vegetables", protein: 8, cost: 15, recipe: "Flattened rice with onion, peas, turmeric" },
        lunch: { food: "Dal + steamed rice + salad", protein: 18, cost: 20, recipe: "Moong dal with 1 cup rice and cucumber salad" },
        dinner: { food: "Roti (2) + sabzi", protein: 12, cost: 15, recipe: "Wheat roti with seasonal vegetable curry" },
      },
      100: {
        breakfast: { food: "Oats + banana + milk", protein: 12, cost: 25, recipe: "Rolled oats boiled in milk with banana" },
        lunch: { food: "Dal + rice + raita + salad", protein: 22, cost: 40, recipe: "Masoor dal, 1 cup rice, curd raita, salad" },
        dinner: { food: "Paneer sabzi + 2 roti", protein: 20, cost: 35, recipe: "100g paneer with capsicum, onion curry + wheat roti" },
      },
      200: {
        breakfast: { food: "Besan chilla + curd + fruit", protein: 18, cost: 50, recipe: "3 gram flour pancakes with seasonal fruit" },
        lunch: { food: "Rajma + rice + salad + lassi", protein: 28, cost: 80, recipe: "Kidney bean curry with rice + buttermilk" },
        dinner: { food: "Tofu bhurji + 3 roti + salad", protein: 25, cost: 70, recipe: "Tofu scramble with onion tomato + whole wheat roti" },
      },
    },
    nonveg: {
      100: {
        breakfast: { food: "Egg bhurji + 2 roti", protein: 20, cost: 25, recipe: "2 egg scramble with onion, tomato, green chili" },
        lunch: { food: "Chicken curry (100g) + rice", protein: 32, cost: 50, recipe: "Homestyle chicken curry with 1 cup rice" },
        dinner: { food: "Dal + 2 roti + egg salad", protein: 24, cost: 25, recipe: "Toor dal with egg boiled salad + roti" },
      },
      200: {
        breakfast: { food: "3 egg omelette + toast + fruit", protein: 25, cost: 50, recipe: "Masala omelette with 2 toast and banana" },
        lunch: { food: "Chicken (150g) + rice + salad", protein: 45, cost: 90, recipe: "Grilled or curry chicken with rice and salad" },
        dinner: { food: "Fish curry + 2 roti + dal", protein: 35, cost: 60, recipe: "100g fish curry + toor dal + wheat roti" },
      },
    },
  },
  musclegain: {
    veg: {
      100: {
        breakfast: { food: "Paneer paratha + curd", protein: 22, cost: 35, recipe: "2 paneer stuffed parathas with thick curd" },
        lunch: { food: "Rajma + rice + paneer salad", protein: 30, cost: 45, recipe: "Rajma masala + 1.5 cup rice + 50g paneer cubes" },
        dinner: { food: "Tofu + 3 roti + dal", protein: 28, cost: 20, recipe: "100g tofu sabzi + moong dal + 3 wheat roti" },
      },
      200: {
        breakfast: { food: "Protein oats + nuts + banana + milk", protein: 25, cost: 60, recipe: "Oats + peanut butter + milk + banana + almonds" },
        lunch: { food: "Paneer (150g) + rice + dal + curd", protein: 40, cost: 90, recipe: "Paneer makhni + basmati rice + dal + raita" },
        dinner: { food: "Soya chunks + 3 roti + sabzi", protein: 35, cost: 50, recipe: "100g soya chunks curry + bhindi + wheat roti" },
      },
    },
    nonveg: {
      150: {
        breakfast: { food: "4 eggs + oats + milk", protein: 35, cost: 45, recipe: "3 boiled + 1 scrambled eggs with oats in milk" },
        lunch: { food: "Chicken breast (200g) + rice + dal", protein: 55, cost: 70, recipe: "Grilled chicken + 1.5 cup rice + toor dal" },
        dinner: { food: "Fish (150g) + 3 roti + sabzi", protein: 40, cost: 35, recipe: "Rohu fish curry + seasonal sabzi + wheat roti" },
      },
    },
  },
};

const NO_EXCUSE_WORKOUTS = {
  "10min": [
    { name: "Jumping Jacks", duration: "1 min" },
    { name: "Push-ups", duration: "1 min" },
    { name: "Squats", duration: "1 min" },
    { name: "Mountain Climbers", duration: "1 min" },
    { name: "Plank", duration: "1 min" },
    { name: "Burpees", duration: "1 min" },
    { name: "High Knees", duration: "1 min" },
    { name: "Tricep Dips (chair)", duration: "1 min" },
    { name: "Glute Bridges", duration: "1 min" },
    { name: "Cool Down Stretch", duration: "1 min" },
  ],
  noequip: [
    { name: "Bodyweight Squats × 20", duration: "sets: 3" },
    { name: "Push-up Variations × 15", duration: "sets: 3" },
    { name: "Reverse Lunges × 12 each", duration: "sets: 3" },
    { name: "Plank Hold × 45s", duration: "sets: 3" },
    { name: "Glute Bridges × 20", duration: "sets: 3" },
    { name: "Mountain Climbers × 30", duration: "sets: 3" },
    { name: "Jump Squats × 10", duration: "sets: 3" },
  ],
  tired: [
    { name: "5 min walk", duration: "easy pace" },
    { name: "Cat-Cow stretch", duration: "2 min" },
    { name: "Child's Pose", duration: "2 min" },
    { name: "Seated forward fold", duration: "2 min" },
    { name: "Neck & shoulder rolls", duration: "1 min" },
    { name: "Deep breathing", duration: "3 min" },
  ],
};

const MOTIVATIONAL_QUOTES = [
  '"The body achieves what the mind believes." — Napoleon Hill',
  '"Take care of your body. It\'s the only place you have to live." — Jim Rohn',
  '"Fitness is not about being better than someone else. It\'s about being better than you used to be." — Unknown',
  '"The pain you feel today will be the strength you feel tomorrow." — Arnold Schwarzenegger',
  '"Don\'t stop when you\'re tired. Stop when you\'re done." — Unknown',
  '"Your body can stand almost anything. It\'s your mind that you have to convince." — Unknown',
];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

function getStreakStatus(streak, lastActive) {
  if (!lastActive) return { status: "new", message: "Start your streak today! 🔥" };
  const today = new Date();
  const last = new Date(lastActive);
  const diff = Math.floor((today - last) / (1000 * 60 * 60 * 24));
  if (diff === 0) return { status: "active", message: `${streak} day streak! Keep it up! 🔥` };
  if (diff === 1) return { status: "active", message: `${streak} day streak! Log today to continue! 💪` };
  if (diff === 2) return { status: "warning", message: `⚠️ 2 days inactive! One more miss resets your streak.` };
  return { status: "reset", message: "Streak reset. Today is a new beginning! 🌅" };
}

async function callAI(messages, systemPrompt) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      system: systemPrompt || "You are Flex, an expert Indian fitness coach. Be short (3-4 sentences max), practical, and motivating. Use fitness emojis occasionally.",
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
return data.reply;
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────

export default function App() {
  // ── State
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("steps");

  // Auth
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Onboarding
  const [obData, setObData] = useState({ goal: "weight_loss", level: "beginner", weight: "", height: "", diet: "veg", step_goal: "8000", budget: "100" });

  // Steps
  const [steps, setSteps] = useState("");

  // Workout
  const [wMuscle, setWMuscle] = useState("fullbody");
  const [workoutResult, setWorkoutResult] = useState(null);

  // Yoga
  const [yGoal, setYGoal] = useState("flexibility");
  const [yogaResult, setYogaResult] = useState(null);

  // Cardio
  const [cType, setCType] = useState("Running");
  const [cDuration, setCDuration] = useState("30");
  const [cIntensity, setCIntensity] = useState("Medium");

  // Diet
  const [dietResult, setDietResult] = useState(null);

  // No-Excuse Mode
  const [noExcuseMode, setNoExcuseMode] = useState(null);

  // Adaptive
  const [mood, setMood] = useState("normal");
  const [timeAvail, setTimeAvail] = useState("30");
  const [adaptiveResult, setAdaptiveResult] = useState(null);

  // Chat
  const [chatMsgs, setChatMsgs] = useState([
    { role: "assistant", content: "Hey! I'm Flex, your AI fitness coach! 💪 Ask me anything about workouts, nutrition, or fitness. I'm here to help you crush your goals!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatUses, setChatUses] = useState(0);
  const chatRef = useRef(null);

  // Streak
  const [streak, setStreak] = useState(0);
  const [lastActive, setLastActive] = useState(null);
  const [motivation] = useState(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);

  // ── Init
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
        loadChatHistory(session.user.id);
        loadStreak(session.user.id);
        setPage("dashboard");
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        setProfile(null);
        setPage("landing");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);

  // ── Supabase helpers
  async function loadProfile(uid) {
    const { data } = await supabase.from("profiles").select("*").eq("user_id", uid).single();
    if (data) {
      setProfile(data);
      setObData(prev => ({ ...prev, ...data }));
    }
  }

  async function saveProfile(uid, data) {
    const payload = { user_id: uid, ...data, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "user_id" });
    if (!error) setProfile(payload);
    return !error;
  }

  async function loadChatHistory(uid) {
    const today = getTodayKey();
    const { data } = await supabase.from("messages").select("*").eq("user_id", uid).gte("created_at", today).order("created_at");
    if (data?.length) {
      setChatMsgs(data.map(m => ({ role: m.role, content: m.content })));
      setChatUses(data.filter(m => m.role === "user").length);
    }
  }

  async function saveMessage(uid, content, role) {
    await supabase.from("messages").insert([{ user_id: uid, content, role }]);
  }

  async function loadStreak(uid) {
    const { data } = await supabase.from("streaks").select("*").eq("user_id", uid).single();
    if (data) { setStreak(data.count || 0); setLastActive(data.last_active); }
  }

  async function updateStreak(uid) {
    const today = getTodayKey();
    const { data } = await supabase.from("streaks").select("*").eq("user_id", uid).single();
    if (!data) {
      await supabase.from("streaks").insert([{ user_id: uid, count: 1, last_active: today }]);
      setStreak(1); setLastActive(today); return;
    }
    const last = new Date(data.last_active);
    const diff = Math.floor((new Date() - last) / (1000 * 60 * 60 * 24));
    let newCount = diff <= 2 ? data.count + 1 : 1;
    await supabase.from("streaks").update({ count: newCount, last_active: today }).eq("user_id", uid);
    setStreak(newCount); setLastActive(today);
  }

  // ── Auth
  async function handleAuth() {
    setAuthErr(""); setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPass });
        if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
        setUser(data.user);
        await loadProfile(data.user.id);
        await loadChatHistory(data.user.id);
        await loadStreak(data.user.id);
        setPage("dashboard");
      } else {
        if (!authName || !authEmail || !authPass) { setAuthErr("Please fill all fields."); setAuthLoading(false); return; }
        if (authPass.length < 6) { setAuthErr("Password must be at least 6 characters."); setAuthLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({ email: authEmail, password: authPass, options: { data: { name: authName } } });
        if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
        setUser(data.user);
        setPage("onboarding");
      }
    } catch { setAuthErr("Something went wrong. Please try again."); }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setChatMsgs([{ role: "assistant", content: "Hey! I'm Flex! 💪 Ask me anything about fitness!" }]);
    setPage("landing");
  }

  // ── Onboarding
  async function handleOnboarding() {
    if (!obData.weight || !obData.height) { return; }
    const ok = await saveProfile(user.id, obData);
    if (ok) { setProfile(obData); setPage("dashboard"); }
     }

     // ── Chat
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const limit = user?.plan === "pro" ? Infinity : PLANS.free.chatLimit;
    if (chatUses >= limit) {
      setChatMsgs(prev => [...prev, { role: "assistant", content: "⛔ You've used all 3 free chats today! Upgrade to Pro for unlimited coaching. 💪" }]);
      return;
    }
    const msg = chatInput.trim();
    setChatInput("");
    const newMsgs = [...chatMsgs, { role: "user", content: msg }];
    setChatMsgs(newMsgs);
    if (user?.id) await saveMessage(user.id, msg, "user");
    setChatLoading(true);
    try {
      const profileCtx = profile ? `User profile: Goal=${profile.goal}, Level=${profile.level}, Diet=${profile.diet}, Budget=₹${profile.budget}/day` : "";
      const r = await callAI(
        newMsgs.slice(-10).map(m => ({ role: m.role, content: m.content })),
        `You are Flex, an expert Indian fitness and nutrition coach. Be practical, motivating, concise (3-4 sentences). ${profileCtx}. Focus on Indian context, foods, and lifestyle.`
      );
      setChatMsgs(prev => [...prev, { role: "assistant", content: r }]);
      if (user?.id) await saveMessage(user.id, r, "assistant");
      setChatUses(prev => prev + 1);
      await updateStreak(user.id);
    } catch {
      setChatMsgs(prev => [...prev, { role: "assistant", content: "Oops, something went wrong! Please try again. 💪" }]);
    }
    setChatLoading(false);
  }

  // ── Workout generator
  function generateWorkout() {
    const level = profile?.level || "beginner";
    const exercises = WORKOUTS[level]?.[wMuscle] || WORKOUTS.beginner.fullbody;
    setWorkoutResult(exercises);
    if (user?.id) updateStreak(user.id);
  }

  // ── Yoga generator
  function generateYoga() {
    const poses = YOGA[yGoal] || YOGA.flexibility;
    setYogaResult(poses);
    if (user?.id) updateStreak(user.id);
  }

  // ── Diet generator
  function generateDiet() {
    const goal = profile?.goal || "weight_loss";
    const diet = profile?.diet || "veg";
    const budget = parseInt(profile?.budget || 100);
    const goalKey = goal === "muscle_gain" ? "musclegain" : "weightloss";
    const budgetKey = budget <= 75 ? 50 : budget <= 150 ? 100 : 200;
    const dietData = DIET_ENGINE[goalKey]?.[diet]?.[budgetKey] || DIET_ENGINE.weightloss.veg[100];
    setDietResult({ ...dietData, budget, goal, diet });
    if (user?.id) updateStreak(user.id);
  }

  // ── Adaptive fitness
  function generateAdaptive() {
    const stepCount = parseInt(steps || 0);
    let suggestion = "";
    let intensity = "normal";
    if (mood === "tired" && stepCount > 8000) {
      suggestion = "You've walked a lot AND you're tired. Take a complete rest day. Light stretching only!";
      intensity = "rest";
    } else if (mood === "tired") {
      suggestion = "You're tired today. Do a gentle 15-min yoga or stretching session instead of intense workout.";
      intensity = "light";
    } else if (mood === "energetic" && stepCount < 5000) {
      suggestion = `You have great energy! Time to crush a ${timeAvail}-min intense workout. Push hard! 💪`;
      intensity = "high";
    } else if (stepCount > 10000) {
      suggestion = "You've already hit 10K steps! A light workout or yoga is perfect — don't overtrain.";
      intensity = "light";
    } else {
      suggestion = `Good state for a ${timeAvail}-min ${profile?.level || "beginner"} workout. Moderate intensity recommended.`;
      intensity = "normal";
    }
    setAdaptiveResult({ suggestion, intensity, steps: stepCount, mood, time: timeAvail });
    if (user?.id) updateStreak(user.id);
  }

  // ── Cardio calculation
  function calcCardio() {
    const dur = parseInt(cDuration || 0);
    const weight = parseInt(profile?.weight || 70);
    const MET = { Running: { Low: 6, Medium: 9, High: 12 }, Cycling: { Low: 4, Medium: 7, High: 10 }, Swimming: { Low: 5, Medium: 8, High: 11 }, Walking: { Low: 2.5, Medium: 4, High: 5 }, "Jump Rope": { Low: 8, Medium: 10, High: 12 }, HIIT: { Low: 7, Medium: 9, High: 12 }, Zumba: { Low: 5, Medium: 7, High: 9 } };
    const met = MET[cType]?.[cIntensity] || 7;
    const cal = Math.round((met * weight * dur) / 60);
    const dist = cType === "Running" ? (dur * (cIntensity === "High" ? 0.18 : cIntensity === "Medium" ? 0.13 : 0.08)).toFixed(1) : null;
    return { cal, dist, zone: cIntensity === "High" ? "Anaerobic (85-95% HR)" : cIntensity === "Medium" ? "Aerobic (70-85% HR)" : "Fat Burn (60-70% HR)" };
  }

  const stepPct = Math.min(100, Math.round((parseInt(steps || 0) / (profile?.step_goal || 8000)) * 100));
  const streakStatus = getStreakStatus(streak, lastActive);
  const cardioCalc = (tab === "cardio" && cDuration) ? calcCardio() : null;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#030609", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(0,200,150,0.2)", borderTopColor: "#00C896", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#030609", color: "#E8F5F0", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#00C89633;border-radius:3px}
        :root{
          --g:#00C896;--g2:#00A87E;--g3:#007A5C;
          --warn:#F59E0B;--err:#EF4444;
          --bg:#030609;--s:#07100C;--s2:#0C1A14;--s3:#112018;
          --border:rgba(0,200,150,0.1);--border2:rgba(0,200,150,0.2);
          --text:#E8F5F0;--muted:#4A7A66;--sub:#2A5040;
        }

        body{font-family:'DM Sans',sans-serif}

        /* NAV */
        .nav{position:sticky;top:0;z-index:200;background:rgba(3,6,9,0.95);backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:12px 24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .logo{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:8px;margin-right:auto}
        .logo-dot{width:28px;height:28px;background:linear-gradient(135deg,var(--g),var(--g2));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px}
        .logo-text{background:linear-gradient(90deg,var(--g),#7FFFDF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .nav-btn{background:transparent;border:1px solid var(--border2);color:var(--g);padding:7px 14px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;white-space:nowrap}
        .nav-btn:hover{background:rgba(0,200,150,0.08)}
        .nav-btn.solid{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;border-color:transparent;font-weight:600}
        .nav-btn.solid:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,200,150,0.3)}
        .nav-btn.ghost{border-color:rgba(255,255,255,0.07);color:#94A3B8}
        .nav-btn.ghost:hover{color:var(--text);background:rgba(255,255,255,0.04)}
        .user-badge{background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:5px 12px;display:flex;align-items:center;gap:8px;font-size:13px}
        .plan-tag{background:rgba(0,200,150,0.12);color:var(--g);border-radius:6px;padding:2px 7px;font-size:11px;font-weight:600;text-transform:uppercase}

        /* HERO */
        .hero{padding:90px 24px 70px;text-align:center;position:relative;overflow:hidden}
        .hero-glow{position:absolute;top:-150px;left:50%;transform:translateX(-50%);width:900px;height:600px;background:radial-gradient(ellipse,rgba(0,200,150,0.07) 0%,transparent 65%);pointer-events:none}
        .hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,200,150,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,150,0.025) 1px,transparent 1px);background-size:44px 44px;mask-image:radial-gradient(ellipse at 50% 40%,black 20%,transparent 70%);pointer-events:none}
        .hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,150,0.07);border:1px solid var(--border2);border-radius:20px;padding:6px 14px;font-size:12px;color:var(--g);font-weight:600;margin-bottom:24px;letter-spacing:.4px}
        .h1{font-family:'Syne',sans-serif;font-size:clamp(38px,7vw,76px);font-weight:800;line-height:.95;letter-spacing:-2px;margin-bottom:22px}
        .h1-g{background:linear-gradient(135deg,var(--g) 0%,#7FFFDF 50%,var(--g) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200%;animation:shimmer 4s ease infinite}
        @keyframes shimmer{0%,100%{background-position:0%}50%{background-position:100%}}
        .hero-sub{font-size:17px;color:#5A8A76;max-width:520px;margin:0 auto 36px;line-height:1.75}
        .hero-ctas{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
        .cta-primary{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;border:none;padding:14px 32px;border-radius:10px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;letter-spacing:-.2px}
        .cta-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,200,150,0.35)}
        .cta-sec{background:transparent;color:var(--text);border:1px solid rgba(255,255,255,0.1);padding:14px 32px;border-radius:10px;font-family:'Syne',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s}
        .cta-sec:hover{background:rgba(255,255,255,0.04)}

        /* FEATURE CARDS */
        .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px}
        .feat-card{background:var(--s);border:1px solid var(--border);border-radius:16px;padding:22px;transition:all .25s;cursor:pointer;position:relative;overflow:hidden}
        .feat-card:hover{border-color:var(--border2);transform:translateY(-3px);box-shadow:0 10px 28px rgba(0,200,150,0.07)}
        .feat-card::after{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(0,200,150,0.04),transparent);opacity:0;transition:.3s}
        .feat-card:hover::after{opacity:1}
        .feat-icon{font-size:30px;margin-bottom:12px}
        .feat-title{font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px}
        .feat-desc{font-size:12px;color:var(--muted);line-height:1.6}
        .feat-tag{display:inline-block;background:rgba(0,200,150,0.08);color:var(--g);font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-top:8px}

        /* PRICING */
        .price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:20px}
        .price-card{background:var(--s);border:1px solid rgba(255,255,255,0.06);border-radius:20px;padding:28px;position:relative;transition:all .2s}
        .price-card:hover{transform:translateY(-3px)}
        .price-card.pop{border-color:var(--g);box-shadow:0 0 50px rgba(0,200,150,0.08)}
        .pop-label{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;font-size:11px;font-weight:700;padding:3px 14px;border-radius:20px;white-space:nowrap}
        .price-name{font-size:12px;font-weight:600;color:var(--muted);letter-spacing:.8px;text-transform:uppercase;margin-bottom:8px}
        .price-amount{font-family:'Syne',sans-serif;font-size:48px;font-weight:800;letter-spacing:-2px;line-height:1}
        .price-per{font-size:13px;color:var(--muted);margin-bottom:20px}
        .price-feats{list-style:none;display:flex;flex-direction:column;gap:9px;margin-bottom:20px}
        .price-feat{font-size:13px;color:#94A3B8;display:flex;align-items:flex-start;gap:8px}
        .price-feat::before{content:'✓';color:var(--g);font-weight:700;font-size:11px;flex-shrink:0;margin-top:1px}
        .price-btn{width:100%;padding:12px;border-radius:10px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:none;letter-spacing:-.2px}

        /* AUTH */
        .auth-wrap{max-width:400px;margin:0 auto;padding:60px 20px}
        .auth-card{background:var(--s);border:1px solid var(--border);border-radius:20px;padding:32px}
        .auth-title{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;margin-bottom:4px;letter-spacing:-.5px}
        .auth-sub{font-size:14px;color:var(--muted);margin-bottom:22px}
        .f-label{display:block;font-size:11px;font-weight:600;color:var(--muted);letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}
        .f-input{width:100%;background:var(--bg);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:11px 14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s;margin-bottom:13px}
        .f-input:focus{border-color:rgba(0,200,150,0.35)}
        .f-input::placeholder{color:#1E3A2E}
        .f-select{width:100%;background:var(--bg);border:1px solid rgba(255,255,255,0.06);border-radius:9px;padding:11px 14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:14px;outline:none;cursor:pointer;appearance:none;margin-bottom:13px}
        .f-select:focus{border-color:rgba(0,200,150,0.35)}
        .auth-submit{width:100%;padding:13px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:10px;font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:#030609;cursor:pointer;transition:all .2s;margin-top:4px}
        .auth-submit:hover:not(:disabled){box-shadow:0 4px 16px rgba(0,200,150,0.3)}
        .auth-submit:disabled{opacity:.4;cursor:not-allowed}
        .auth-switch{text-align:center;margin-top:16px;font-size:13px;color:var(--muted)}
        .auth-switch span{color:var(--g);cursor:pointer;font-weight:500}
        .auth-err{font-size:13px;color:var(--err);margin-top:8px;text-align:center}

        /* DASHBOARD */
        .dash-layout{display:grid;grid-template-columns:200px 1fr;min-height:calc(100vh - 53px)}
        .sidebar{background:var(--s);border-right:1px solid var(--border);padding:18px 12px;display:flex;flex-direction:column;gap:3px}
        .sb-section{font-size:10px;font-weight:700;color:var(--sub);letter-spacing:.8px;text-transform:uppercase;padding:6px 10px 2px;margin-top:10px}
        .sb-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;transition:all .18s;font-size:13px;color:var(--muted);border:1px solid transparent;font-family:'DM Sans',sans-serif;font-weight:400}
        .sb-item:hover{background:rgba(0,200,150,0.05);color:var(--text)}
        .sb-item.active{background:rgba(0,200,150,0.08);border-color:rgba(0,200,150,0.15);color:var(--g);font-weight:500}
        .sb-icon{font-size:16px;width:20px;text-align:center;flex-shrink:0}
        .sb-streak{margin-top:auto;padding:12px;background:rgba(0,200,150,0.06);border:1px solid var(--border);border-radius:12px}
        .sb-streak-num{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:var(--g);line-height:1}
        .sb-streak-lbl{font-size:11px;color:var(--muted);margin-top:2px}

        /* MAIN CONTENT */
        .main-content{padding:24px;overflow-y:auto}
        .page-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;letter-spacing:-.5px;margin-bottom:4px}
        .page-sub{font-size:13px;color:var(--muted);margin-bottom:20px}

        /* CARDS */
        .card{background:var(--s);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:16px}
        .card-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--g);letter-spacing:.6px;text-transform:uppercase;margin-bottom:12px}

        /* PROGRESS BAR */
        .prog-track{height:8px;background:rgba(0,200,150,0.08);border-radius:8px;overflow:hidden}
        .prog-fill{height:100%;background:linear-gradient(90deg,var(--g),#7FFFDF);border-radius:8px;transition:width .6s ease}
        .step-big{font-family:'Syne',sans-serif;font-size:44px;font-weight:800;color:var(--g);letter-spacing:-2px;line-height:1}

        /* METRIC TILES */
        .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px}
        .tile{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center}
        .tile-val{font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--g)}
        .tile-lbl{font-size:11px;color:var(--muted);margin-top:3px}

        /* EXERCISE LIST */
        .ex-list{display:flex;flex-direction:column;gap:8px}
        .ex-item{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;gap:10px}
        .ex-name{font-size:14px;font-weight:500;color:var(--text)}
        .ex-meta{font-size:12px;color:var(--g);font-weight:600;white-space:nowrap}
        .ex-rest{font-size:11px;color:var(--muted)}

        /* YOGA CARDS */
        .yoga-grid{display:flex;flex-direction:column;gap:10px}
        .yoga-item{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:14px}
        .yoga-name{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:var(--text);margin-bottom:5px}
        .yoga-dur{font-size:12px;color:var(--g);font-weight:600;margin-bottom:6px}
        .yoga-desc{font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:4px}
        .yoga-benefit{font-size:11px;color:var(--g);font-weight:600}

        /* DIET CARDS */
        .meal-grid{display:flex;flex-direction:column;gap:10px}
        .meal-card{background:var(--s2);border:1px solid var(--border);border-radius:12px;padding:14px}
        .meal-time{font-size:11px;font-weight:700;color:var(--g);letter-spacing:.6px;text-transform:uppercase;margin-bottom:6px}
        .meal-name{font-size:15px;font-weight:600;color:var(--text);margin-bottom:4px}
        .meal-recipe{font-size:12px;color:var(--muted);margin-bottom:8px;line-height:1.5}
        .meal-tags{display:flex;gap:8px;flex-wrap:wrap}
        .meal-tag{background:rgba(0,200,150,0.08);color:var(--g);font-size:11px;font-weight:600;padding:3px 9px;border-radius:20px}

        /* CHAT */
        .chat-area{height:calc(100vh - 340px);min-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;padding:16px;background:var(--s);border:1px solid var(--border);border-radius:14px;margin-bottom:12px}
        .msg-row{display:flex;gap:9px;animation:msgIn .25s ease}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .msg-row.user{flex-direction:row-reverse}
        .msg-av{width:30px;height:30px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
        .msg-av.bot{background:linear-gradient(135deg,var(--g),var(--g2))}
        .msg-av.user{background:var(--s2);border:1px solid var(--border)}
        .bubble{max-width:80%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.65}
        .bubble.bot{background:var(--s2);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:3px}
        .bubble.user{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;font-weight:500;border-bottom-right-radius:3px}
        .chat-input-row{display:flex;gap:9px}
        .chat-inp{flex:1;background:var(--s);border:1px solid var(--border);border-radius:10px;padding:11px 14px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
        .chat-inp:focus{border-color:var(--border2)}
        .chat-inp::placeholder{color:var(--sub)}
        .chat-send{width:42px;height:42px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:10px;color:#030609;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
        .chat-send:hover:not(:disabled){transform:scale(1.05)}
        .chat-send:disabled{opacity:.4;cursor:not-allowed}

        /* BUTTONS */
        .btn-primary{background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:10px;padding:11px 22px;font-family:'Syne',sans-serif;font-size:14px;font-weight:700;color:#030609;cursor:pointer;transition:all .2s;letter-spacing:-.2px}
        .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(0,200,150,0.3)}
        .btn-primary:disabled{opacity:.35;cursor:not-allowed}
        .btn-outline{background:transparent;border:1px solid var(--border2);border-radius:10px;padding:10px 18px;font-size:13px;color:var(--g);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-weight:500}
        .btn-outline:hover{background:rgba(0,200,150,0.07)}
        .btn-choice{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:10px 16px;font-size:13px;color:var(--muted);cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif}
        .btn-choice:hover,.btn-choice.sel{background:rgba(0,200,150,0.08);border-color:var(--border2);color:var(--g)}

        /* USAGE BAR */
        .usage-row{background:var(--s);border:1px solid var(--border);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:18px;flex-wrap:wrap}
        .usage-text{font-size:13px;color:var(--muted)}
        .upgrade-btn{font-size:12px;font-weight:600;color:var(--g);cursor:pointer;background:rgba(0,200,150,0.07);border:1px solid var(--border);border-radius:7px;padding:4px 11px;white-space:nowrap;transition:all .2s}
        .upgrade-btn:hover{background:rgba(0,200,150,0.14)}

        /* MOTIVATION */
        .mot-card{background:linear-gradient(135deg,var(--s),var(--s2));border:1px solid var(--border);border-radius:14px;padding:18px 20px;margin-bottom:18px;position:relative;overflow:hidden}
        .mot-card::before{content:'"';position:absolute;top:-24px;right:12px;font-size:100px;color:rgba(0,200,150,0.04);font-family:'Syne',sans-serif;font-weight:800;line-height:1}
        .mot-lbl{font-size:10px;font-weight:700;color:var(--g);letter-spacing:.7px;text-transform:uppercase;margin-bottom:7px}
        .mot-text{font-size:14px;color:#5A8A76;line-height:1.7;font-style:italic}

        /* STREAK CARD */
        .streak-card{background:var(--s);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px;display:flex;align-items:center;gap:16px}
        .streak-num{font-family:'Syne',sans-serif;font-size:40px;font-weight:800;color:var(--g);letter-spacing:-2px;line-height:1;flex-shrink:0}
        .streak-info-title{font-family:'Syne',sans-serif;font-size:14px;font-weight:700;margin-bottom:3px}
        .streak-msg{font-size:13px;color:var(--muted)}

        /* ONBOARDING */
        .ob-wrap{max-width:480px;margin:0 auto;padding:48px 20px}
        .ob-card{background:var(--s);border:1px solid var(--border);border-radius:20px;padding:32px}
        .ob-title{font-family:'Syne',sans-serif;font-size:24px;font-weight:800;margin-bottom:6px;letter-spacing:-.5px}
        .ob-sub{font-size:14px;color:var(--muted);margin-bottom:24px}
        .ob-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}

        /* ADAPTIVE */
        .adaptive-result{border-radius:14px;padding:18px;border:1px solid}
        .adapt-high{background:rgba(0,200,150,0.06);border-color:rgba(0,200,150,0.2)}
        .adapt-light{background:rgba(245,158,11,0.06);border-color:rgba(245,158,11,0.2)}
        .adapt-rest{background:rgba(239,68,68,0.06);border-color:rgba(239,68,68,0.2)}
        .adapt-normal{background:rgba(0,200,150,0.04);border-color:var(--border)}

        /* NO EXCUSE */
        .ne-list{display:flex;flex-direction:column;gap:8px}
        .ne-item{background:var(--s2);border:1px solid var(--border);border-radius:10px;padding:11px 14px;display:flex;align-items:center;justify-content:space-between}
        .ne-name{font-size:13px;font-weight:500;color:var(--text)}
        .ne-dur{font-size:12px;color:var(--g);font-weight:600}

        /* SECTION */
        .sec-wrap{padding:72px 24px;max-width:1080px;margin:0 auto}
        .sec-title{font-family:'Syne',sans-serif;font-size:34px;font-weight:800;text-align:center;letter-spacing:-1px;margin-bottom:10px}
        .sec-sub{font-size:15px;color:var(--muted);text-align:center;margin-bottom:44px}

        /* MOBILE TABS */
        .mob-tabs{display:none;overflow-x:auto;gap:6px;padding:10px 14px;background:var(--s);border-bottom:1px solid var(--border);-ms-overflow-style:none;scrollbar-width:none}
        .mob-tabs::-webkit-scrollbar{display:none}
        .mob-tab{flex-shrink:0;padding:7px 13px;border-radius:20px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid var(--border);color:var(--muted);background:transparent;white-space:nowrap;transition:all .18s;font-family:'DM Sans',sans-serif}
        .mob-tab.active{background:rgba(0,200,150,0.08);border-color:var(--border2);color:var(--g)}

        @media(max-width:768px){
          .dash-layout{grid-template-columns:1fr}
          .sidebar{display:none}
          .mob-tabs{display:flex}
          .main-content{padding:16px}
          .ob-grid{grid-template-columns:1fr}
        }
        @media(min-width:769px){.mob-tabs{display:none}}
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="logo" onClick={() => setPage(user ? "dashboard" : "landing")}>
          <div className="logo-dot">⚡</div>
          <span className="logo-text">FitGenius AI</span>
        </div>
        {page === "dashboard" && (
          <>
            <button className="nav-btn" onClick={() => setPage("pricing")}>Pricing</button>
            <div className="user-badge">
              💪 {profile?.name || user?.user_metadata?.name || "User"}
              <span className="plan-tag">{user?.plan || "free"}</span>
            </div>
            <button className="nav-btn ghost" onClick={handleLogout}>Logout</button>
          </>
        )}
        {page !== "dashboard" && !user && (
          <>
            <button className="nav-btn" onClick={() => setPage("pricing")}>Pricing</button>
            <button className="nav-btn" onClick={() => { setAuthMode("login"); setPage("auth"); }}>Login</button>
            <button className="nav-btn solid" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Get Started →</button>
          </>
        )}
      </nav>

      {/* ── LANDING ── */}
      {page === "landing" && (
        <>
          <div className="hero">
            <div className="hero-glow" /><div className="hero-grid" />
            <div className="hero-tag">🇮🇳 Built for Indian Fitness Goals · Early Access</div>
            <h1 className="h1">Your AI<br /><span className="h1-g">Fitness Coach</span><br />Is Here</h1>
            <p className="hero-sub">Workout plans, yoga, budget meal planning, and an AI trainer — everything tailored to your goals and your budget.</p>
            <div className="hero-ctas">
              <button className="cta-primary" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Start Free — No Card →</button>
              <button className="cta-sec" onClick={() => setPage("pricing")}>View Plans</button>
            </div>
          </div>

          <div className="sec-wrap" style={{ paddingTop: 40 }}>
            <div className="sec-title">Everything You Need</div>
            <div className="sec-sub">6 AI-powered tools designed for India</div>
            <div className="feat-grid">
              {[
                { icon: "👟", title: "Step Tracker", desc: "Smart feedback on your daily movement, calories, and distance.", tag: "PRO" },
                { icon: "💪", title: "Workout Planner", desc: "Personalised workouts based on your level and target muscle.", tag: "PRO" },
                { icon: "🧘", title: "Yoga Guide", desc: "Goal-based yoga sessions from flexibility to weight loss.", tag: "PRO" },
                { icon: "🏃", title: "Cardio Tracker", desc: "Log cardio, get calories burned and heart rate zones.", tag: "PRO" },
                { icon: "🥗", title: "Budget Diet Engine", desc: "Full Indian meal plan from ₹50/day. Actually affordable.", tag: "🔥 UNIQUE" },
                { icon: "🤖", title: "AI Trainer — Flex", desc: "Chat with your personal Indian fitness coach 24/7.", tag: "3 FREE/DAY" },
              ].map(f => (
                <div key={f.title} className="feat-card" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>
                  <div className="feat-icon">{f.icon}</div>
                  <div className="feat-title">{f.title}</div>
                  <div className="feat-desc">{f.desc}</div>
                  <div className="feat-tag">{f.tag}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Early Access Section */}
          <div className="sec-wrap" style={{ paddingTop: 0 }}>
            <div className="sec-title">Join Early Access</div>
            <div className="sec-sub">Shape the product. Lock in the lowest price.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
              {[
                { icon: "🎁", title: "Founding Member Price", desc: "Lock ₹99/month forever. Price goes up after launch." },
                { icon: "💬", title: "Direct Influence", desc: "Your feedback directly shapes what we build next." },
                { icon: "🔥", title: "All Features Free", desc: "Full Pro access during early access period. No limits." },
              ].map(c => (
                <div key={c.title} className="card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 30, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button className="cta-primary" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Join Early Access — Free</button>
            </div>
          </div>

          <div style={{ textAlign: "center", padding: "36px 24px", borderTop: "1px solid rgba(255,255,255,0.03)", fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: "#1E3A2E" }}>
            <strong style={{ color: "var(--g)" }}>FitGenius AI</strong> · Early Access · Built for India 🇮🇳
          </div>
        </>
      )}

      {/* ── PRICING ── */}
      {page === "pricing" && (
        <div className="sec-wrap">
          <div className="sec-title">Simple Pricing</div>
          <div className="sec-sub">Start free. Upgrade when you're ready.</div>
          <div className="price-grid">
            {[
              { id: "free", name: "Starter", price: "₹0", per: "forever", color: "#475569", popular: false, feats: ["3 AI chats with Flex/day", "Step tracker", "Early access to features"], cta: "Start Free" },
              { id: "pro", name: "Pro", price: "₹199", per: "/month", color: "#00C896", popular: true, feats: ["Unlimited AI coaching", "All workout modes", "Budget diet planner", "Yoga + Cardio tracker", "Progress analytics", "Priority support"], cta: "Go Pro" },
              { id: "elite", name: "Elite", price: "₹399", per: "/month", color: "#F59E0B", popular: false, feats: ["Everything in Pro", "Supplement guide", "Custom macro tracking", "Injury recovery plans", "1-on-1 AI mentor", "Founding member badge"], cta: "Go Elite" },
            ].map(p => (
              <div key={p.id} className={`price-card ${p.popular ? "pop" : ""}`}>
                {p.popular && <div className="pop-label">⭐ MOST POPULAR</div>}
                <div className="price-name">{p.name}</div>
                <div className="price-amount" style={{ color: p.color }}>{p.price}</div>
                <div className="price-per">{p.per}</div>
                <ul className="price-feats">{p.feats.map(f => <li key={f} className="price-feat">{f}</li>)}</ul>
                <button className="price-btn"
                  style={p.popular ? { background: "linear-gradient(135deg,#00C896,#00A87E)", color: "#030609" } : { background: "transparent", border: `1px solid ${p.color}33`, color: p.color }}
                  onClick={() => user ? setPage("dashboard") : (setAuthMode("signup"), setPage("auth"))}
                >{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AUTH ── */}
      {page === "auth" && (
        <div className="auth-wrap">
          <div className="auth-card">
            <div className="auth-title">{authMode === "login" ? "Welcome back 👋" : "Join FitGenius 🚀"}</div>
            <div className="auth-sub">{authMode === "login" ? "Login to continue your fitness journey" : "Create your free account in 30 seconds"}</div>
            {authMode === "signup" && <><label className="f-label">Full Name</label><input className="f-input" placeholder="Arjun Singh" value={authName} onChange={e => setAuthName(e.target.value)} /></>}
            <label className="f-label">Email</label>
            <input className="f-input" type="email" placeholder="you@email.com" value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
            <label className="f-label">Password</label>
            <input className="f-input" type="password" placeholder="••••••••" value={authPass} onChange={e => setAuthPass(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAuth()} />
            <button className="auth-submit" onClick={handleAuth} disabled={authLoading}>
              {authLoading ? "⏳ Please wait..." : authMode === "login" ? "Login →" : "Create Account →"}
            </button>
            {authErr && <div className="auth-err">⚠️ {authErr}</div>}
            <div className="auth-switch">
              {authMode === "login" ? <>No account? <span onClick={() => { setAuthMode("signup"); setAuthErr(""); }}>Sign up free</span></> : <>Have account? <span onClick={() => { setAuthMode("login"); setAuthErr(""); }}>Login</span></>}
            </div>
          </div>
        </div>
      )}

      {/* ── ONBOARDING ── */}
      {page === "onboarding" && (
        <div className="ob-wrap">
          <div className="ob-card">
            <div className="ob-title">Set Up Your Profile 💪</div>
            <div className="ob-sub">Help us personalise everything for you</div>

            <label className="f-label">Your Main Goal</label>
            <div className="ob-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              {[["weight_loss", "🔥 Lose Weight"], ["muscle_gain", "💪 Build Muscle"], ["maintenance", "⚖️ Stay Fit"]].map(([v, l]) => (
                <button key={v} className={`btn-choice ${obData.goal === v ? "sel" : ""}`} onClick={() => setObData(p => ({ ...p, goal: v }))}>{l}</button>
              ))}
            </div>

            <label className="f-label">Fitness Level</label>
            <div className="ob-grid">
              {[["beginner", "🌱 Beginner"], ["intermediate", "⚡ Intermediate"], ["advanced", "🔥 Advanced"]].map(([v, l]) => (
                <button key={v} className={`btn-choice ${obData.level === v ? "sel" : ""}`} onClick={() => setObData(p => ({ ...p, level: v }))}>{l}</button>
              ))}
            </div>

            <div className="ob-grid">
              <div>
                <label className="f-label">Weight (kg)</label>
                <input className="f-input" type="number" placeholder="70" value={obData.weight} onChange={e => setObData(p => ({ ...p, weight: e.target.value }))} />
              </div>
              <div>
                <label className="f-label">Height (cm)</label>
                <input className="f-input" type="number" placeholder="170" value={obData.height} onChange={e => setObData(p => ({ ...p, height: e.target.value }))} />
              </div>
            </div>

            <label className="f-label">Diet Type</label>
            <div className="ob-grid">
              {[["veg", "🥦 Vegetarian"], ["nonveg", "🍗 Non-Veg"]].map(([v, l]) => (
                <button key={v} className={`btn-choice ${obData.diet === v ? "sel" : ""}`} onClick={() => setObData(p => ({ ...p, diet: v }))}>{l}</button>
              ))}
            </div>

            <div className="ob-grid">
              <div>
                <label className="f-label">Daily Step Goal</label>
                <select className="f-select" value={obData.step_goal} onChange={e => setObData(p => ({ ...p, step_goal: e.target.value }))}>
                  {["5000", "8000", "10000", "12000"].map(v => <option key={v} value={v}>{parseInt(v).toLocaleString()} steps</option>)}
                </select>
              </div>
              <div>
                <label className="f-label">Daily Diet Budget (₹)</label>
                <select className="f-select" value={obData.budget} onChange={e => setObData(p => ({ ...p, budget: e.target.value }))}>
                  {["50", "100", "150", "200", "300"].map(v => <option key={v} value={v}>₹{v}/day</option>)}
                </select>
              </div>
            </div>

            <button className="auth-submit" onClick={handleOnboarding}>Save & Start Training →</button>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {page === "dashboard" && user && (
        <div>
          {/* Mobile tabs */}
          <div className="mob-tabs">
            {[["steps", "👟", "Steps"], ["workout", "💪", "Workout"], ["yoga", "🧘", "Yoga"], ["cardio", "🏃", "Cardio"], ["diet", "🥗", "Diet"], ["chat", "🤖", "AI Chat"], ["adaptive", "🧠", "Adaptive"], ["noexcuse", "⚡", "No Excuse"]].map(([id, icon, label]) => (
              <button key={id} className={`mob-tab ${tab === id ? "active" : ""}`} onClick={() => { setTab(id); }}>
                {icon} {label}
              </button>
            ))}
          </div>

          <div className="dash-layout">
            {/* Sidebar */}
            <div className="sidebar">
              <div className="sb-section">Tools</div>
              {[["steps", "👟", "Step Tracker"], ["workout", "💪", "Workout Planner"], ["yoga", "🧘", "Yoga Guide"], ["cardio", "🏃", "Cardio Tracker"], ["diet", "🥗", "Diet Planner"], ["chat", "🤖", "AI Trainer"]].map(([id, icon, label]) => (
                <div key={id} className={`sb-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
                  <span className="sb-icon">{icon}</span>{label}
                </div>
              ))}
              <div className="sb-section">Smart Features</div>
              {[["adaptive", "🧠", "Adaptive Fitness"], ["noexcuse", "⚡", "No-Excuse Mode"]].map(([id, icon, label]) => (
                <div key={id} className={`sb-item ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
                  <span className="sb-icon">{icon}</span>{label}
                </div>
              ))}
              <div className="sb-section">Account</div>
              <div className="sb-item" onClick={() => setPage("onboarding")}>
                <span className="sb-icon">👤</span>Edit Profile
              </div>
              {/* Streak display */}
              <div className="sb-streak" style={{ marginTop: 16 }}>
                <div className="sb-streak-num">🔥 {streak}</div>
                <div className="sb-streak-lbl">Day Streak</div>
                <div style={{ fontSize: 11, color: streakStatus.status === "warning" ? "var(--warn)" : "var(--muted)", marginTop: 4 }}>
                  {streakStatus.status === "warning" ? "⚠️ Warning!" : streak > 0 ? "Keep going!" : "Start today!"}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
              {/* Motivation */}
              <div className="mot-card">
                <div className="mot-lbl">💡 Daily Motivation</div>
                <div className="mot-text">{motivation}</div>
              </div>

              {/* Streak Card */}
              <div className="streak-card">
                <div className="streak-num">🔥 {streak}</div>
                <div>
                  <div className="streak-info-title">Day Streak</div>
                  <div className="streak-msg">{streakStatus.message}</div>
                </div>
              </div>

              {/* Usage */}
              <div className="usage-row">
                <div className="usage-text">
                  Plan: <strong style={{ color: "var(--text)" }}>{user?.plan || "Free"}</strong> &nbsp;·&nbsp;
                  AI Chats today: <strong style={{ color: "var(--text)" }}>{chatUses}/{PLANS.free.chatLimit}</strong>
                </div>
                <div className="upgrade-btn" onClick={() => setPage("pricing")}>⚡ Upgrade</div>
              </div>

              {/* ── STEPS ── */}
              {tab === "steps" && (
                <>
                  <div className="page-title">👟 Step Tracker</div>
                  <div className="page-sub">Track your daily movement and stay active</div>
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                      <div>
                        <div className="step-big">{parseInt(steps || 0).toLocaleString()}</div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>steps today</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "var(--g)" }}>{stepPct}%</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>of goal</div>
                      </div>
                    </div>
                    <div className="prog-track"><div className="prog-fill" style={{ width: `${stepPct}%` }} /></div>
                    <div style={{ fontSize: 12, color: "var(--g)", textAlign: "right", marginTop: 5 }}>Goal: {parseInt(profile?.step_goal || 8000).toLocaleString()} steps</div>

                    {/* Smart feedback */}
                    <div style={{ marginTop: 14, padding: "11px 14px", background: "rgba(0,200,150,0.05)", border: "1px solid rgba(0,200,150,0.12)", borderRadius: 10, fontSize: 13, color: "var(--g)" }}>
                      {parseInt(steps || 0) === 0 && "👋 Enter your steps above to get started!"}
                      {parseInt(steps || 0) > 0 && stepPct < 30 && "😴 Under 30% done. A quick 15-min walk can change that!"}
                      {stepPct >= 30 && stepPct < 60 && "🚶 Good momentum! You're getting there."}
                      {stepPct >= 60 && stepPct < 90 && "🔥 Almost there! One last push!"}
                      {stepPct >= 90 && stepPct < 100 && "💪 SO close to your goal — finish strong!"}
                      {stepPct >= 100 && "🏆 GOAL CRUSHED! You're a champion today!"}
                    </div>

                    <div className="tiles">
                      {[
                        { val: `~${Math.round(parseInt(steps || 0) * 0.04)} kcal`, lbl: "Calories Burned" },
                        { val: `~${(parseInt(steps || 0) * 0.0008).toFixed(1)} km`, lbl: "Distance" },
                        { val: `~${Math.round(parseInt(steps || 0) / 100)} mins`, lbl: "Active Time" },
                      ].map(t => (
                        <div key={t.lbl} className="tile">
                          <div className="tile-val">{t.val}</div>
                          <div className="tile-lbl">{t.lbl}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <label className="f-label">Steps Today</label>
                  <input className="f-input" type="number" placeholder="Enter steps..." value={steps} onChange={e => setSteps(e.target.value)} style={{ maxWidth: 200 }} />
                  <button className="btn-primary" onClick={() => { if (user?.id && steps) updateStreak(user.id); }}>Log Steps ✓</button>
                </>
              )}

              {/* ── WORKOUT ── */}
              {tab === "workout" && (
                <>
                  <div className="page-title">💪 Workout Planner</div>
                  <div className="page-sub">Personalised for your level: <strong style={{ color: "var(--g)" }}>{profile?.level || "beginner"}</strong></div>
                  <div className="card">
                    <div className="card-title">Target Muscle Group</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {[["fullbody", "🏋️ Full Body"], ["chest", "🫁 Chest"], ["back", "🔙 Back"], ["legs", "🦵 Legs"]].map(([v, l]) => (
                        <button key={v} className={`btn-choice ${wMuscle === v ? "sel" : ""}`} onClick={() => setWMuscle(v)}>{l}</button>
                      ))}
                    </div>
                    <button className="btn-primary" onClick={generateWorkout}>Generate My Workout ✨</button>
                  </div>
                  {workoutResult && (
                    <div className="card">
                      <div className="card-title">Your Workout — {profile?.level || "Beginner"} · {wMuscle}</div>
                      <div className="ex-list">
                        {workoutResult.map((ex, i) => (
                          <div key={i} className="ex-item">
                            <div>
                              <div className="ex-name">{ex.name}</div>
                              <div className="ex-rest">Rest: {ex.rest}</div>
                            </div>
                            <div className="ex-meta">{ex.sets} × {ex.reps}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── YOGA ── */}
              {tab === "yoga" && (
                <>
                  <div className="page-title">🧘 Yoga Guide</div>
                  <div className="page-sub">Personalised sessions for your wellness goals</div>
                  <div className="card">
                    <div className="card-title">Choose Your Goal</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {[["flexibility", "🤸 Flexibility"], ["stress", "😌 Stress Relief"], ["strength", "💪 Strength"], ["weightloss", "🔥 Weight Loss"]].map(([v, l]) => (
                        <button key={v} className={`btn-choice ${yGoal === v ? "sel" : ""}`} onClick={() => setYGoal(v)}>{l}</button>
                      ))}
                    </div>
                    <button className="btn-primary" onClick={generateYoga}>Generate Yoga Session ✨</button>
                  </div>
                  {yogaResult && (
                    <div className="card">
                      <div className="card-title">Your Yoga Session — {yGoal}</div>
                      <div className="yoga-grid">
                        {yogaResult.map((pose, i) => (
                          <div key={i} className="yoga-item">
                            <div className="yoga-name">{i + 1}. {pose.name}</div>
                            <div className="yoga-dur">⏱ {pose.duration}</div>
                            <div className="yoga-desc">{pose.desc}</div>
                            <div className="yoga-benefit">✓ {pose.benefit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── CARDIO ── */}
              {tab === "cardio" && (
                <>
                  <div className="page-title">🏃 Cardio Tracker</div>
                  <div className="page-sub">Log your cardio and see the numbers</div>
                  <div className="card">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div>
                        <label className="f-label">Activity</label>
                        <select className="f-select" value={cType} onChange={e => setCType(e.target.value)}>
                          {["Running", "Cycling", "Swimming", "Walking", "Jump Rope", "HIIT", "Zumba"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="f-label">Duration (mins)</label>
                        <input className="f-input" type="number" placeholder="30" value={cDuration} onChange={e => setCDuration(e.target.value)} />
                      </div>
                      <div>
                        <label className="f-label">Intensity</label>
                        <select className="f-select" value={cIntensity} onChange={e => setCIntensity(e.target.value)}>
                          {["Low", "Medium", "High"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="btn-primary" onClick={() => { if (user?.id) updateStreak(user.id); }}>Log Session ✓</button>
                  </div>
                  {cardioCalc && cDuration && (
                    <div className="card">
                      <div className="card-title">Session Results</div>
                      <div className="tiles">
                        <div className="tile"><div className="tile-val">{cardioCalc.cal}</div><div className="tile-lbl">Calories Burned</div></div>
                        {cardioCalc.dist && <div className="tile"><div className="tile-val">{cardioCalc.dist} km</div><div className="tile-lbl">Est. Distance</div></div>}
                        <div className="tile"><div className="tile-val" style={{ fontSize: 13 }}>{cardioCalc.zone}</div><div className="tile-lbl">Heart Rate Zone</div></div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── DIET ── */}
              {tab === "diet" && (
                <>
                  <div className="page-title">🥗 Budget Diet Planner</div>
                  <div className="page-sub">Your daily meal plan — Budget: <strong style={{ color: "var(--g)" }}>₹{profile?.budget || 100}/day</strong> · Goal: <strong style={{ color: "var(--g)" }}>{profile?.goal || "weight_loss"}</strong></div>
                  <button className="btn-primary" style={{ marginBottom: 16 }} onClick={generateDiet}>Generate My Meal Plan ✨</button>
                  {!profile && <div style={{ fontSize: 13, color: "var(--warn)", marginBottom: 12 }}>⚠️ Set your profile first for personalised diet plans.</div>}
                  {dietResult && (
                    <div className="card">
                      <div className="card-title">Your Daily Meal Plan — ₹{dietResult.budget}</div>
                      <div className="meal-grid">
                        {[
                          { time: "☀️ Breakfast", data: dietResult.breakfast },
                          { time: "🌤 Lunch", data: dietResult.lunch },
                          { time: "🌙 Dinner", data: dietResult.dinner },
                        ].map(m => m.data && (
                          <div key={m.time} className="meal-card">
                            <div className="meal-time">{m.time}</div>
                            <div className="meal-name">{m.data.food}</div>
                            <div className="meal-recipe">{m.data.recipe}</div>
                            <div className="meal-tags">
                              <span className="meal-tag">🥩 {m.data.protein}g protein</span>
                              <span className="meal-tag">₹{m.data.cost}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(0,200,150,0.05)", borderRadius: 10, fontSize: 13, color: "var(--muted)" }}>
                        Total protein: ~{(dietResult.breakfast?.protein || 0) + (dietResult.lunch?.protein || 0) + (dietResult.dinner?.protein || 0)}g &nbsp;·&nbsp;
                        Total cost: ₹{(dietResult.breakfast?.cost || 0) + (dietResult.lunch?.cost || 0) + (dietResult.dinner?.cost || 0)}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── CHAT ── */}
              {tab === "chat" && (
                <>
                  <div className="page-title">🤖 AI Trainer — Flex</div>
                  <div className="page-sub">Your personal Indian fitness coach · {chatUses}/{PLANS.free.chatLimit} chats used today</div>
                  <div className="chat-area" ref={chatRef}>
                    {chatMsgs.map((m, i) => (
                      <div key={i} className={`msg-row ${m.role === "user" ? "user" : ""}`}>
                        <div className={`msg-av ${m.role === "assistant" ? "bot" : "user"}`}>{m.role === "assistant" ? "⚡" : "👤"}</div>
                        <div className={`bubble ${m.role === "assistant" ? "bot" : "user"}`}>{m.content}</div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="msg-row">
                        <div className="msg-av bot">⚡</div>
                        <div className="bubble bot">
                          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                            {[0, .2, .4].map(d => <div key={d} style={{ width: 7, height: 7, background: "var(--g)", borderRadius: "50%", animation: `bounce 1.2s ${d}s infinite` }} />)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="chat-input-row">
                    <input className="chat-inp" placeholder="Ask Flex anything about fitness..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} disabled={chatLoading} />
                    <button className="chat-send" onClick={sendChat} disabled={chatLoading || !chatInput.trim()}>➤</button>
                  </div>
                  <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}`}</style>
                </>
              )}

              {/* ── ADAPTIVE FITNESS ── */}
              {tab === "adaptive" && (
                <>
                  <div className="page-title">🧠 Adaptive Fitness</div>
                  <div className="page-sub">Get a workout recommendation based on how you feel today</div>
                  <div className="card">
                    <div className="card-title">How Are You Feeling?</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {[["tired", "😴 Tired"], ["normal", "😊 Normal"], ["energetic", "⚡ Energetic"]].map(([v, l]) => (
                        <button key={v} className={`btn-choice ${mood === v ? "sel" : ""}`} onClick={() => setMood(v)}>{l}</button>
                      ))}
                    </div>
                    <div className="card-title">Time Available</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                      {[["10", "10 min"], ["20", "20 min"], ["30", "30 min"], ["45", "45 min"]].map(([v, l]) => (
                        <button key={v} className={`btn-choice ${timeAvail === v ? "sel" : ""}`} onClick={() => setTimeAvail(v)}>{l}</button>
                      ))}
                    </div>
                    <div className="card-title">Steps Today</div>
                    <input className="f-input" type="number" placeholder="How many steps today?" value={steps} onChange={e => setSteps(e.target.value)} style={{ maxWidth: 220, marginBottom: 14 }} />
                    <br />
                    <button className="btn-primary" onClick={generateAdaptive}>Get My Recommendation 🧠</button>
                  </div>
                  {adaptiveResult && (
                    <div className={`adaptive-result ${adaptiveResult.intensity === "high" ? "adapt-high" : adaptiveResult.intensity === "light" ? "adapt-light" : adaptiveResult.intensity === "rest" ? "adapt-rest" : "adapt-normal"}`}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                        {adaptiveResult.intensity === "high" ? "💪 Full Workout" : adaptiveResult.intensity === "light" ? "🧘 Light Session" : adaptiveResult.intensity === "rest" ? "😴 Rest Day" : "⚡ Moderate Workout"}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text)" }}>{adaptiveResult.suggestion}</div>
                      <div style={{ marginTop: 10, fontSize: 12, color: "var(--muted)" }}>
                        Mood: {adaptiveResult.mood} · Steps: {adaptiveResult.steps.toLocaleString()} · Time: {adaptiveResult.time} min
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── NO EXCUSE MODE ── */}
              {tab === "noexcuse" && (
                <>
                  <div className="page-title">⚡ No-Excuse Mode</div>
                  <div className="page-sub">No time? No equipment? Too tired? We've got you.</div>
                  <div className="card">
                    <div className="card-title">Choose Your Situation</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {[["10min", "⏱ Only 10 Minutes"], ["noequip", "🏠 No Equipment"], ["tired", "😴 Too Tired"]].map(([v, l]) => (
                        <button key={v} className={`btn-choice ${noExcuseMode === v ? "sel" : ""}`} onClick={() => { setNoExcuseMode(v); if (user?.id) updateStreak(user.id); }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  {noExcuseMode && (
                    <div className="card">
                      <div className="card-title">
                        {noExcuseMode === "10min" ? "⏱ 10-Min Blitz Workout" : noExcuseMode === "noequip" ? "🏠 No Equipment Workout" : "😴 Tired? Do This Instead"}
                      </div>
                      <div className="ne-list">
                        {NO_EXCUSE_WORKOUTS[noExcuseMode].map((ex, i) => (
                          <div key={i} className="ne-item">
                            <div className="ne-name">{i + 1}. {ex.name}</div>
                            <div className="ne-dur">{ex.duration}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
              }
