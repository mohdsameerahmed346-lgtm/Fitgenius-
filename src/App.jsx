import { useState, useRef, useEffect } from "react";
import { supabase } from './supabaseClient';

const PLANS = [
  {
    id: "free", name: "Starter", price: "₹0", period: "forever", color: "#475569",
    features: ["3 AI chats with Flex per month", "All other features locked", "No step tracker", "No workout plans", "No diet plans"],
    cta: "Start Free", popular: false, limit: 3,
  },
  {
    id: "pro", name: "Pro", price: "₹199", period: "/month", color: "#00C896",
    features: ["Unlimited AI sessions", "All workout modes", "Budget diet planner", "Yoga guide", "Cardio tracker", "AI trainer chat", "Progress analytics"],
    cta: "Go Pro — ₹199/mo", popular: true, limit: 999,
  },
  {
    id: "premium", name: "Elite", price: "₹399", period: "/month", color: "#F59E0B",
    features: ["Everything in Pro", "Supplement guide", "Injury recovery plans", "Custom macros", "1-on-1 AI mentor", "Priority support"],
    cta: "Go Elite — ₹399/mo", popular: false, limit: 999,
  },
];

async function callAI(prompt, system = "") {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: system || "You are FitGenius AI — India's most advanced AI fitness coach. You give practical, science-based advice tailored for Indian users. Always be encouraging, specific, and actionable.",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error);

  return data.reply;
      }

const TOOLS = [
  { id: "steps", icon: "👟", label: "Step Tracker" },
  { id: "workout", icon: "💪", label: "Workout Planner" },
  { id: "yoga", icon: "🧘", label: "Yoga Guide" },
  { id: "cardio", icon: "🏃", label: "Cardio Tracker" },
  { id: "diet", icon: "🥗", label: "Diet Planner" },
  { id: "chat", icon: "🤖", label: "AI Trainer" },
];

function getRandom(arr, count, exclude = []) {
  const filtered = arr.filter(x => !exclude.includes(x));
  return filtered.sort(() => 0.5 - Math.random()).slice(0, count);
}

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [tool, setTool] = useState("steps");
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authName, setAuthName] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [motivation, setMotivation] = useState("");

  const [steps, setSteps] = useState("0");
  const [stepGoal, setStepGoal] = useState("10000");
  const [wLevel, setWLevel] = useState("Beginner");
  const [wMuscle, setWMuscle] = useState("Full Body");
  const [yGoal, setYGoal] = useState("Flexibility");
  const [yLevel, setYLevel] = useState("Beginner");
  const [yDuration, setYDuration] = useState("30");
  const [cType, setCType] = useState("Running");
  const [cDuration, setCDuration] = useState("30");
  const [cIntensity, setCIntensity] = useState("Medium");
  const [cWeight, setCWeight] = useState("70");
  const [dBudget, setDBudget] = useState("100");
  const [dGoal, setDGoal] = useState("Weight Loss");
  const [dDiet, setDDiet] = useState("Vegetarian");
  const [dAllergy, setDAllergy] = useState("");
  const [chatMsgs, setChatMsgs] = useState([
    { role: "assistant", content: "Hey! I'm Flex, your AI fitness coach! 💪 Ask me anything about workouts, nutrition, or fitness goals!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [payPlan] = useState(null);
  const [payStep, setPayStep] = useState(1);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);

  useEffect(() => {
    if (page === "dashboard" && !motivation) {
      callAI("Give me ONE powerful short motivational quote for fitness. Just quote and author. Max 20 words.")
        .then(m => setMotivation(m))
        .catch(() => setMotivation('"The body achieves what the mind believes." — Unknown'));
    }
  }, [page, motivation]);
async function saveMessage(userId, content, role) {
  await supabase.from("messages").insert([
    { user_id: userId, content, role }
  ]);
}

async function loadMessages(userId) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data || [];
  }
  
  async function handleAuth() {
    setAuthErr(""); setAuthLoading(true);
    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail, password: authPass,
        });
        if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
        const msgs = await loadMessages(data.user.id);
        setChatMsgs(msgs.length > 0 ? msgs.map(m => ({ role: m.role, content: m.content })) : [
          { role: "assistant", content: "Hey! I'm Flex, your AI fitness coach! 💪 Ask me anything!" }
        ]);
        setUser({ id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || "User", plan: "free", uses: 0 });
        setPage("dashboard");
      } else {
        if (!authName || !authEmail || !authPass) { setAuthErr("Fill all fields."); setAuthLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email: authEmail, password: authPass,
          options: { data: { name: authName } }
        });
        if (error) { setAuthErr(error.message); setAuthLoading(false); return; }
        setUser({ id: data.user.id, email: authEmail, name: authName, plan: "free", uses: 0 });
        setPage("dashboard");
      }
    } catch (e) { setAuthErr("Something went wrong. Try again."); }
    setAuthLoading(false);
}

  async function runTool() {
    const planInfo = PLANS.find(p => p.id === (user?.plan || "free"));
    if (user?.plan === "free" && tool !== "chat") {
      setErr("⛔ Locked! Upgrade to Pro ₹199/month to unlock all features!"); return;
    }
    if (user?.plan === "free" && user.uses >= planInfo.limit) {
      setErr("Monthly limit reached! 3 free chats used. Upgrade to Pro! 🔒"); return;
    }
    setLoading(true); setResult(""); setErr("");
    try {
      let prompt = "", sys = "";
      if (tool === "steps") {
        const pct = Math.min(100, Math.round((parseInt(steps) / parseInt(stepGoal)) * 100));
        sys = "You are a motivating fitness coach.";
        prompt = `I walked ${steps} steps today. My goal is ${stepGoal} steps. That's ${pct}% of my goal.\n\nGive me:\n1. A motivating message about my progress\n2. Estimated calories burned (I weigh 70kg)\n3. Health benefits of today's steps\n4. Tips to reach my goal tomorrow\n5. Fun fact about walking`;
      } else if (tool === "workout") {
        sys = "You are an expert certified personal trainer who specialises in Indian gym culture.";
        prompt = `Create a complete ${wMuscle} workout plan for a ${wLevel} level person.\n\nFor each exercise include:\n- Exercise name\n- Sets x Reps\n- Rest time\n- Correct form tips\n- Common mistakes to avoid\n\nMake it practical for an Indian gym. Include warmup and cooldown.`;
      } else if (tool === "yoga") {
        sys = "You are a certified yoga instructor with deep knowledge of traditional and modern yoga.";
        prompt = `Create a complete ${yDuration}-minute yoga session for ${yGoal} at ${yLevel} level.\n\nFor each pose include:\n- Pose name (Sanskrit + English)\n- Duration\n- Step-by-step instructions\n- Benefits\n- Breathing instructions\n\nInclude proper warmup and relaxation at end.`;
      } else if (tool === "cardio") {
        sys = "You are an expert sports science and cardio fitness coach.";
        prompt = `I did ${cDuration} minutes of ${cType} at ${cIntensity} intensity. My weight is ${cWeight}kg.\n\nProvide:\n1. Calories burned\n2. Distance covered estimate\n3. Heart rate zone\n4. Benefits of today's session\n5. Recovery tips\n6. How to improve next session\n7. Weekly cardio plan recommendation`;
      } else if (tool === "diet") {
        sys = "You are an expert Indian nutritionist who specialises in budget-friendly healthy Indian food.";
        prompt = `Create a COMPLETE day meal plan with budget of exactly ₹${dBudget} for someone with goal: ${dGoal}, diet: ${dDiet}${dAllergy ? `, allergies: ${dAllergy}` : ""}.\n\nInclude:\n1. Early morning\n2. Breakfast with recipe\n3. Mid-morning snack\n4. Lunch with recipe\n5. Evening snack\n6. Dinner with recipe\n\nFor each meal show price breakdown.\nAt end: Total cost, daily macros, shopping list.\nUse ONLY common Indian foods.`;
      }
      const r = await callAI(prompt, sys);
      setResult(r);
      if (user) setUser(prev => ({ ...prev, uses: prev.uses + 1 }));
    } catch (e) {
      setErr(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

async function sendChat() {
    const planInfo = PLANS.find(p => p.id === (user?.plan || "free"));
    if (user?.plan === "free" && user.uses >= planInfo.limit) {
      setChatMsgs(prev => [...prev, { role: "assistant", content: "⛔ 3 free chats used this month! Upgrade to Pro for unlimited access! 💪" }]);
      return;
    }
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    const newMsgs = [...chatMsgs, { role: "user", content: msg }];
    setChatMsgs(newMsgs);
    if (user?.id) await saveMessage(user.id, msg, "user");
    try {
      const r = await callAI(
        newMsgs.map(m => `${m.role === "user" ? "User" : "Flex"}: ${m.content}`).join("\n") + "\nFlex:",
        "You are Flex — a friendly Indian fitness coach AI. Keep responses short (3-4 sentences), practical and motivating. Use fitness emojis. Know Indian diet and gym culture well."
      );
      setChatMsgs([...newMsgs, { role: "assistant", content: r }]);
      if (user?.id) await saveMessage(user.id, r, "assistant");
      setUser(prev => ({ ...prev, uses: prev.uses + 1 }));
    } catch {
      setChatMsgs([...newMsgs, { role: "assistant", content: "Sorry, something went wrong! Try again 💪" }]);
    }
        }

  const planInfo = PLANS.find(p => p.id === (user?.plan || "free"));
  const stepPct = Math.min(100, Math.round((parseInt(steps || 0) / parseInt(stepGoal || 10000)) * 100));

  return (
    <div style={{ minHeight: "100vh", background: "#030609", color: "#E8F5F0", fontFamily: "sans-serif", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#00C89633;border-radius:3px}
        :root{--g:#00C896;--g2:#00A87E;--gold:#F59E0B;--bg:#030609;--s:#080F0C;--s2:#0D1A15;--border:rgba(0,200,150,0.12);--text:#E8F5F0;--muted:#4A7A66}
        .nav{position:sticky;top:0;z-index:100;background:rgba(3,6,9,0.92);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:14px 28px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
        .logo{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px}
        .logo-icon{width:32px;height:32px;background:linear-gradient(135deg,var(--g),var(--g2));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px}
        .logo span{background:linear-gradient(90deg,var(--g),#7FFFDF);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        .nav-r{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .nb{background:transparent;border:1px solid rgba(0,200,150,0.25);color:var(--g);padding:8px 16px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap}
        .nb:hover{background:rgba(0,200,150,0.08)}
        .nb.solid{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;border-color:transparent}
        .nb.solid:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,200,150,0.35)}
        .nb.ghost{border-color:rgba(255,255,255,0.08);color:#94A3B8}
        .upill{background:var(--s2);border:1px solid var(--border);border-radius:20px;padding:6px 12px;display:flex;align-items:center;gap:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px}
        .pbadge{background:rgba(0,200,150,0.15);color:var(--g);border-radius:8px;padding:2px 8px;font-size:11px;font-weight:700;text-transform:uppercase}
        .hero{padding:100px 28px 80px;text-align:center;position:relative;overflow:hidden}
        .hero-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(0,200,150,0.06) 0%,transparent 70%);pointer-events:none}
        .hero-lines{position:absolute;inset:0;background-image:linear-gradient(rgba(0,200,150,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,200,150,0.03) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at center,black 20%,transparent 75%);pointer-events:none}
        .htag{display:inline-flex;align-items:center;gap:8px;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:20px;padding:6px 16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:var(--g);font-weight:600;margin-bottom:28px;letter-spacing:.5px;animation:fadeDown .6s ease}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .h1{font-family:'Space Grotesk',sans-serif;font-size:clamp(40px,7vw,80px);font-weight:700;line-height:1;letter-spacing:-2px;margin-bottom:24px;animation:fadeUp .7s ease .1s both}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .h1 .g{background:linear-gradient(90deg,var(--g),#7FFFDF,var(--g));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:200% auto;animation:shimmer 3s linear infinite}
        @keyframes shimmer{to{background-position:200% center}}
        .hero-p{font-family:'Plus Jakarta Sans',sans-serif;font-size:18px;color:#6B9E8A;max-width:560px;margin:0 auto 40px;line-height:1.7;animation:fadeUp .7s ease .2s both}
        .hero-btns{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;animation:fadeUp .7s ease .3s both}
        .bp{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;border:none;padding:15px 36px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s}
        .bp:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,200,150,0.4)}
        .bs{background:transparent;color:var(--text);border:1px solid rgba(255,255,255,0.1);padding:15px 36px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s}
        .bs:hover{background:rgba(255,255,255,0.04)}
        .stats{display:flex;justify-content:center;gap:48px;padding:40px 28px;border-top:1px solid rgba(255,255,255,0.03);border-bottom:1px solid rgba(255,255,255,0.03);flex-wrap:wrap}
        .stat{text-align:center}
        .sn{font-family:'Space Grotesk',sans-serif;font-size:40px;font-weight:700;background:linear-gradient(135deg,var(--g),#7FFFDF);-webkit-background-clip:text;-webkit-text-fill-color:transparent;letter-spacing:-1px}
        .sl{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--muted);margin-top:4px}
        .sec{padding:80px 28px;max-width:1100px;margin:0 auto}
        .sec-t{font-family:'Space Grotesk',sans-serif;font-size:38px;font-weight:700;text-align:center;margin-bottom:12px;letter-spacing:-1px}
        .sec-s{font-family:'Plus Jakarta Sans',sans-serif;font-size:16px;color:var(--muted);text-align:center;margin-bottom:52px}
        .feat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px}
        .feat-c{background:var(--s);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all .3s;cursor:pointer;position:relative;overflow:hidden}
        .feat-c:hover{border-color:rgba(0,200,150,0.3);transform:translateY(-4px);box-shadow:0 12px 32px rgba(0,200,150,0.08)}
        .feat-icon{font-size:36px;margin-bottom:16px}
        .feat-t{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:8px}
        .feat-d{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--muted);line-height:1.65}
        .feat-badge{display:inline-block;background:rgba(0,200,150,0.1);color:var(--g);font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;padding:3px 8px;border-radius:20px;margin-top:10px;letter-spacing:.5px}
        .price-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px}
        .plan-c{background:var(--s);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:32px;position:relative;transition:all .25s}
        .plan-c:hover{transform:translateY(-4px)}
        .plan-c.pop{border-color:var(--g);box-shadow:0 0 60px rgba(0,200,150,0.1)}
        .pop-b{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;padding:4px 16px;border-radius:20px;white-space:nowrap}
        .pname{font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px}
        .pprice{font-family:'Space Grotesk',sans-serif;font-size:52px;font-weight:700;letter-spacing:-2px;line-height:1}
        .pper{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--muted);margin-bottom:26px}
        .pfeats{list-style:none;display:flex;flex-direction:column;gap:10px;margin-bottom:26px}
        .pfeat{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#94A3B8;display:flex;align-items:flex-start;gap:10px}
        .pfeat::before{content:'✓';color:var(--g);font-weight:700;font-size:12px;flex-shrink:0}
        .pbtn{width:100%;padding:13px;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;border:none}
        .tgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:18px}
        .tc{background:var(--s);border:1px solid rgba(255,255,255,0.04);border-radius:16px;padding:22px}
        .tstars{color:var(--gold);font-size:13px;margin-bottom:12px}
        .ttop{display:flex;align-items:center;gap:12px;margin-bottom:12px}
        .tav{width:40px;height:40px;background:linear-gradient(135deg,var(--g),var(--g2));border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#030609;flex-shrink:0}
        .tname{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:700;color:var(--text)}
        .tcity{font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:var(--muted)}
        .ttext{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#6B9E8A;line-height:1.65;font-style:italic}
        .auth-wrap{max-width:420px;margin:0 auto;padding:60px 20px}
        .auth-box{background:var(--s);border:1px solid var(--border);border-radius:24px;padding:36px}
        .auth-t{font-family:'Space Grotesk',sans-serif;font-size:30px;font-weight:700;margin-bottom:6px;letter-spacing:-1px}
        .auth-s{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--muted);margin-bottom:24px}
        .field{margin-bottom:14px}
        .field label{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;color:var(--muted);letter-spacing:.8px;text-transform:uppercase;margin-bottom:7px}
        .finp{width:100%;background:var(--bg);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:12px 14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;outline:none;transition:border-color .2s}
        .finp:focus{border-color:rgba(0,200,150,0.4)}
        .finp::placeholder{color:#1A3A2E}
        .auth-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:#030609;cursor:pointer;transition:all .2s;margin-top:8px}
        .auth-btn:disabled{opacity:.4;cursor:not-allowed}
        .auth-sw{text-align:center;margin-top:18px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--muted)}
        .auth-sw span{color:var(--g);cursor:pointer;font-weight:600}
        .aerr{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#EF4444;margin-top:10px;text-align:center}
        .demo-h{background:rgba(0,200,150,0.06);border:1px solid rgba(0,200,150,0.15);border-radius:10px;padding:11px 14px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;color:#6B9E8A;margin-bottom:18px}
        .dash{display:grid;grid-template-columns:220px 1fr;min-height:calc(100vh - 57px)}
        .sidebar{background:var(--s);border-right:1px solid var(--border);padding:20px 14px;display:flex;flex-direction:column;gap:4px}
        .sb-lbl{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px;text-transform:uppercase;padding:8px 12px 4px;margin-top:8px}
        .sb-item{display:flex;align-items:center;gap:11px;padding:11px 13px;border-radius:12px;cursor:pointer;transition:all .2s;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;color:#4A7A66;border:1px solid transparent}
        .sb-item:hover{background:rgba(0,200,150,0.06);color:var(--text)}
        .sb-item.active{background:rgba(0,200,150,0.1);border-color:rgba(0,200,150,0.2);color:var(--g)}
        .sb-icon{font-size:17px;width:22px;text-align:center}
        .main{padding:28px;overflow-y:auto}
        .main-t{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;margin-bottom:4px;letter-spacing:-.5px}
        .main-s{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--muted);margin-bottom:22px}
        .mot{background:linear-gradient(135deg,var(--s),var(--s2));border:1px solid var(--border);border-radius:16px;padding:20px 22px;margin-bottom:22px}
        .mot-lbl{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;color:var(--g);letter-spacing:1px;text-transform:uppercase;margin-bottom:8px}
        .mot-text{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#6B9E8A;line-height:1.7;font-style:italic}
        .usage-b{background:var(--s);border:1px solid var(--border);border-radius:12px;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
        .usage-t{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--muted)}
        .upl{font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;color:var(--g);cursor:pointer;background:rgba(0,200,150,0.08);border:1px solid rgba(0,200,150,0.2);border-radius:8px;padding:5px 12px;white-space:nowrap}
        .form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:18px}
        .sel{width:100%;background:var(--bg);border:1px solid rgba(255,255,255,0.06);border-radius:10px;padding:11px 14px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none;cursor:pointer;appearance:none}
        .sel:focus{border-color:rgba(0,200,150,0.4)}
        .step-card{background:var(--s);border:1px solid var(--border);border-radius:20px;padding:24px;margin-bottom:20px}
        .step-big{font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:700;color:var(--g);letter-spacing:-2px;line-height:1}
        .prog-bar{height:10px;background:rgba(0,200,150,0.1);border-radius:10px;overflow:hidden;margin-bottom:8px}
        .prog-fill{height:100%;background:linear-gradient(90deg,var(--g),#7FFFDF);border-radius:10px;transition:width .5s ease}
        .run-btn{padding:13px 28px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:15px;font-weight:700;color:#030609;cursor:pointer;transition:all .25s}
        .run-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,200,150,0.35)}
        .run-btn:disabled{opacity:.35;cursor:not-allowed}
        .result-box{background:var(--s);border:1px solid var(--border);border-radius:16px;padding:24px;margin-top:18px;white-space:pre-wrap;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;line-height:1.8;color:#6B9E8A;animation:fadeUp .4s ease}
        .load-box{background:var(--s);border:1px solid var(--border);border-radius:16px;padding:40px;margin-top:18px;text-align:center}
        .spinner{width:40px;height:40px;border:3px solid rgba(0,200,150,0.15);border-top-color:var(--g);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 14px}
        @keyframes spin{to{transform:rotate(360deg)}}
        .err-msg{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#EF4444;margin-top:10px}
        .limit-box{background:rgba(0,200,150,0.05);border:1px solid rgba(0,200,150,0.15);border-radius:12px;padding:16px;margin-top:12px;text-align:center}
        .chat-msgs{height:340px;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;background:var(--s);border:1px solid var(--border);border-radius:16px;margin-bottom:14px}
        .msg-row{display:flex;gap:10px;animation:fadeUp .3s ease}
        .msg-row.user{flex-direction:row-reverse}
        .msg-av{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0}
        .msg-av.bot{background:linear-gradient(135deg,var(--g),var(--g2))}
        .msg-av.user{background:var(--s2);border:1px solid var(--border)}
        .bubble{max-width:78%;padding:11px 15px;border-radius:16px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13.5px;line-height:1.65}
        .bubble.bot{background:var(--s2);color:var(--text);border:1px solid var(--border);border-bottom-left-radius:4px}
        .bubble.user{background:linear-gradient(135deg,var(--g),var(--g2));color:#030609;font-weight:600;border-bottom-right-radius:4px}
        .chat-row{display:flex;gap:10px}
        .chat-inp{flex:1;background:var(--s);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;outline:none;transition:border-color .2s}
        .chat-inp:focus{border-color:rgba(0,200,150,0.4)}
        .chat-inp::placeholder{color:#1A3A2E}
        .chat-send{width:44px;height:44px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:12px;color:#030609;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
        .chat-send:hover{transform:scale(1.05)}
        .pay-wrap{max-width:460px;margin:0 auto;padding:50px 20px}
        .pay-box{background:var(--s);border:1px solid var(--border);border-radius:24px;padding:34px}
        .card-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .pay-btn{width:100%;padding:14px;background:linear-gradient(135deg,var(--g),var(--g2));border:none;border-radius:12px;font-family:'Space Grotesk',sans-serif;font-size:17px;font-weight:700;color:#030609;cursor:pointer;margin-top:8px}
        .spinner2{width:36px;height:36px;border:3px solid rgba(0,200,150,0.15);border-top-color:var(--g);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px}
        .footer{text-align:center;padding:36px 28px;border-top:1px solid rgba(255,255,255,0.03);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#1A3A2E}
        @media(max-width:768px){
          .dash{grid-template-columns:1fr}
          .sidebar{display:none}
          .mob-tabs{display:flex;overflow-x:auto;gap:7px;padding:12px 14px;background:var(--s);border-bottom:1px solid var(--border);-ms-overflow-style:none;scrollbar-width:none}
          .mob-tabs::-webkit-scrollbar{display:none}
          .mob-tab{flex-shrink:0;padding:8px 14px;border-radius:20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;border:1px solid var(--border);color:var(--muted);background:transparent;white-space:nowrap;transition:all .2s}
          .mob-tab.active{background:rgba(0,200,150,0.1);border-color:rgba(0,200,150,0.3);color:var(--g)}
        }
        @media(min-width:769px){.mob-tabs{display:none}}
      `}</style>

      <nav className="nav">
        <div className="logo" onClick={() => setPage("landing")}>
          <div className="logo-icon">⚡</div>
          <span>FitGenius AI</span>
        </div>
        <div className="nav-r">
          <button className="nb ghost" onClick={() => setPage("pricing")}>Pricing</button>
          {user ? (
            <>
              <div className="upill">💪 {user.name.split(" ")[0]}<span className="pbadge">{user.plan}</span></div>
              <button className="nb" onClick={() => setPage("dashboard")}>Dashboard</button>
              <button className="nb ghost" onClick={async () => { await supabase.auth.signOut(); setUser(null); setPage("landing"); }}>Logout</button>
            </>
          ) : (
            <>
              <button className="nb" onClick={() => { setAuthMode("login"); setPage("auth"); }}>Login</button>
              <button className="nb solid" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Start Free →</button>
            </>
          )}
        </div>
      </nav>

      {page === "landing" && <>
        <div className="hero">
          <div className="hero-bg"/><div className="hero-lines"/>
          <div className="htag">🇮🇳 India's #1 AI Fitness Toolkit — Free to Start</div>
          <h1 className="h1">Your Complete<br /><span className="g">AI Fitness</span><br />Companion</h1>
          <p className="hero-p">Workout plans, yoga guides, cardio tracking, and India's only budget-based AI diet planner. Everything you need to get fit.</p>
          <div className="hero-btns">
            <button className="bp" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Start Free — No Card Needed →</button>
            <button className="bs" onClick={() => setPage("pricing")}>View Plans</button>
          </div>
        </div>
        <div className="stats">
          {[["50K+","Active Users"],["92%","Goal Achievement"],["₹50","Min Diet Budget"],["4.9★","App Rating"]].map(([n,l]) => (
            <div key={l} className="stat"><div className="sn">{n}</div><div className="sl">{l}</div></div>
          ))}
        </div>
        <div className="sec">
          <div className="sec-t">Everything in One Toolkit</div>
          <div className="sec-s">6 powerful AI tools built for Indian fitness goals</div>
          <div className="feat-grid">
            {[
              {icon:"👟",title:"Step Tracker",desc:"Track daily steps, set goals, and get personalised motivation based on your progress.",badge:"PRO"},
              {icon:"💪",title:"Workout Planner",desc:"AI creates complete gym workout plans with sets, reps, form tips and mistakes to avoid.",badge:"PRO"},
              {icon:"🧘",title:"Yoga Guide",desc:"Personalised yoga sessions for flexibility, stress relief, weight loss or strength.",badge:"PRO"},
              {icon:"🏃",title:"Cardio Tracker",desc:"Calculate calories burned, heart rate zones and get improvement tips for any cardio.",badge:"PRO"},
              {icon:"🥗",title:"Budget Diet Planner",desc:"Enter your daily budget (₹50-500) and get a complete Indian meal plan that fits exactly!",badge:"🔥 VIRAL"},
              {icon:"🤖",title:"AI Trainer — Flex",desc:"Chat with Flex, your personal AI trainer. Get instant answers about workouts and nutrition.",badge:"PRO"},
            ].map(f => (
              <div key={f.title} className="feat-c" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>
                <div className="feat-icon">{f.icon}</div>
                <div className="feat-t">{f.title}</div>
                <div className="feat-d">{f.desc}</div>
                <div className="feat-badge">{f.badge}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="sec" style={{paddingTop:0}}>
          <div className="sec-t">Indians Love FitGenius</div>
          <div className="sec-s">Real results from real people</div>
          <div className="tgrid">
            {[
              {name:"Ravi K.",city:"Mumbai",text:"Lost 8kg in 2 months following the AI diet plans. The ₹100 budget plan is absolutely genius!",a:"R"},
              {name:"Priya M.",city:"Bangalore",text:"The workout planner gave me better plans than my gym trainer. Saving ₹3000/month!",a:"P"},
              {name:"Aakash S.",city:"Delhi",text:"As a yoga beginner, the step-by-step guidance is perfect. Feel so much better after 3 weeks!",a:"A"},
            ].map(t => (
              <div key={t.name} className="tc">
                <div className="tstars">★★★★★</div>
                <div className="ttop">
                  <div className="tav">{t.a}</div>
                  <div><div className="tname">{t.name}</div><div className="tcity">{t.city}</div></div>
                </div>
                <div className="ttext">"{t.text}"</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{textAlign:"center",padding:"60px 28px 80px"}}>
          <div style={{fontFamily:"'Space Grotesk'",fontSize:"clamp(30px,5vw,52px)",fontWeight:700,letterSpacing:"-2px",marginBottom:"16px"}}>
            Start Free Today 💪
          </div>
          <p style={{fontFamily:"'Plus Jakarta Sans'",fontSize:"16px",color:"#4A7A66",marginBottom:"28px"}}>Join 50,000+ Indians who transformed their health</p>
          <button className="bp" onClick={() => { setAuthMode("signup"); setPage("auth"); }}>Create Free Account →</button>
        </div>
      </>}

      {page === "pricing" && (
        <div className="sec">
          <div className="sec-t">Simple Pricing</div>
          <div className="sec-s">Start free. Upgrade when ready.</div>
          <div className="price-grid">
            {PLANS.map(p => (
              <div key={p.id} className={`plan-c ${p.popular?"pop":""}`}>
                {p.popular && <div className="pop-b">⭐ MOST POPULAR</div>}
                <div className="pname">{p.name}</div>
                <div className="pprice" style={{color:p.color}}>{p.price}</div>
                <div className="pper">{p.period}</div>
                <ul className="pfeats">{p.features.map(f => <li key={f} className="pfeat">{f}</li>)}</ul>
                <button className="pbtn"
                  style={p.popular?{background:"linear-gradient(135deg,var(--g),var(--g2))",color:"#030609"}:{background:"transparent",border:`1px solid ${p.color}44`,color:p.color}}
                  onClick={() => user ? setPage("dashboard") : (setAuthMode("signup"),setPage("auth"))}
                >{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "auth" && (
        <div className="auth-wrap">
          <div className="auth-box">
            <div className="auth-t">{authMode==="login"?"Welcome Back 💪":"Start Your Journey 🚀"}</div>
            <div className="auth-s">{authMode==="login"?"Login to FitGenius":"Create your free account"}</div>
            <div className="demo-h">✅ Create a free account to get started!</div>
            {authMode==="signup" && <div className="field"><label>Full Name</label><input className="finp" placeholder="Arjun Singh" value={authName} onChange={e=>setAuthName(e.target.value)}/></div>}
            <div className="field"><label>Email</label><input className="finp" type="email" placeholder="you@email.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/></div>
            <div className="field"><label>Password</label><input className="finp" type="password" placeholder="••••••••" value={authPass} onChange={e=>setAuthPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/></div>
            <button className="auth-btn" onClick={handleAuth} disabled={authLoading}>{authLoading?"⏳ Loading...":authMode==="login"?"LOGIN →":"CREATE ACCOUNT →"}</button>
            {authErr && <div className="aerr">⚠️ {authErr}</div>}
            <div className="auth-sw">{authMode==="login"?<>No account? <span onClick={()=>{setAuthMode("signup");setAuthErr("");}}>Sign up free</span></>:<>Have account? <span onClick={()=>{setAuthMode("login");setAuthErr("");}}>Login</span></>}</div>
          </div>
        </div>
      )}

      {page === "dashboard" && user && (
        <div>
          <div className="mob-tabs">
            {TOOLS.map(t => (
              <button key={t.id} className={`mob-tab ${tool===t.id?"active":""}`} onClick={() => { setTool(t.id); setResult(""); setErr(""); }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="dash">
            <div className="sidebar">
              <div className="sb-lbl">Fitness Tools</div>
              {TOOLS.map(t => (
                <div key={t.id} className={`sb-item ${tool===t.id?"active":""}`} onClick={() => { setTool(t.id); setResult(""); setErr(""); }}>
                  <span className="sb-icon">{t.icon}</span>{t.label}
                </div>
              ))}
              <div style={{marginTop:"auto",paddingTop:"16px",borderTop:"1px solid var(--border)"}}>
                <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"12px",color:"var(--muted)",marginBottom:"8px"}}>Plan: <strong style={{color:"var(--text)"}}>{planInfo?.name}</strong></div>
                {user.plan==="free" && <button className="upl" onClick={()=>setPage("pricing")} style={{width:"100%",textAlign:"center",display:"block"}}>⚡ Upgrade to Pro</button>}
              </div>
            </div>
            <div className="main">
              <div className="mot">
                <div className="mot-lbl">💡 Daily Motivation</div>
                <div className="mot-text">{motivation || "Loading motivation..."}</div>
              </div>
              <div className="usage-b">
                <div className="usage-t">Plan: <strong style={{color:"var(--text)"}}>{planInfo?.name}</strong> &nbsp;·&nbsp;
                  {user.plan==="free"?<>Today: <strong style={{color:"var(--text)"}}>{user.uses}/{planInfo?.limit}</strong> sessions</>:<strong style={{color:"var(--g)"}}>Unlimited ✅</strong>}
                </div>
                {user.plan==="free" && <div className="upl" onClick={()=>setPage("pricing")}>Upgrade ⚡</div>}
              </div>

              {tool === "steps" && <>
                <div className="main-t">👟 Step Tracker</div>
                <div className="main-s">Track your daily steps and crush your fitness goals</div>
                <div className="step-card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:"12px"}}>
                    <div>
                      <div className="step-big">{parseInt(steps||0).toLocaleString()}</div>
                      <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"13px",color:"var(--muted)"}}>steps today</div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"Space Grotesk",fontSize:"24px",fontWeight:700,color:"var(--g)"}}>{stepPct}%</div>
                      <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"13px",color:"var(--muted)"}}>of goal</div>
                    </div>
                  </div>
                  <div className="prog-bar"><div className="prog-fill" style={{width:`${stepPct}%`}}/></div>
                  <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"13px",color:"var(--g)",textAlign:"right"}}>Goal: {parseInt(stepGoal||10000).toLocaleString()} steps</div>
                </div>
                <div className="form-grid">
                  <div className="field"><label>Steps Today</label><input className="finp" type="number" placeholder="Enter your steps" value={steps} onChange={e=>setSteps(e.target.value)}/></div>
                  <div className="field"><label>Daily Goal</label><input className="finp" type="number" placeholder="10000" value={stepGoal} onChange={e=>setStepGoal(e.target.value)}/></div>
                </div>
              </>}

              {tool === "workout" && <>
                <div className="main-t">💪 Workout Planner</div>
                <div className="main-s">AI creates your perfect gym workout with sets, reps and form tips</div>
                <div className="form-grid">
                  <div className="field"><label>Fitness Level</label>
                    <select className="sel" value={wLevel} onChange={e=>setWLevel(e.target.value)}>
                      {["Beginner","Intermediate","Advanced"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Target Muscle</label>
                    <select className="sel" value={wMuscle} onChange={e=>setWMuscle(e.target.value)}>
                      {["Full Body","Chest","Back","Legs","Arms","Shoulders","Core","Push","Pull"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </>}

              {tool === "yoga" && <>
                <div className="main-t">🧘 Yoga Guide</div>
                <div className="main-s">Personalised yoga sessions for your goals and level</div>
                <div className="form-grid">
                  <div className="field"><label>Goal</label>
                    <select className="sel" value={yGoal} onChange={e=>setYGoal(e.target.value)}>
                      {["Flexibility","Stress Relief","Weight Loss","Strength","Better Sleep","Focus"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Level</label>
                    <select className="sel" value={yLevel} onChange={e=>setYLevel(e.target.value)}>
                      {["Beginner","Intermediate","Advanced"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Duration</label>
                    <select className="sel" value={yDuration} onChange={e=>setYDuration(e.target.value)}>
                      {["15","30","45","60"].map(o=><option key={o}>{o} minutes</option>)}
                    </select>
                  </div>
                </div>
              </>}

              {tool === "cardio" && <>
                <div className="main-t">🏃 Cardio Tracker</div>
                <div className="main-s">Calculate calories burned and get improvement tips</div>
                <div className="form-grid">
                  <div className="field"><label>Activity</label>
                    <select className="sel" value={cType} onChange={e=>setCType(e.target.value)}>
                      {["Running","Cycling","Swimming","Walking","Jump Rope","HIIT","Zumba","Badminton"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Duration (mins)</label><input className="finp" type="number" placeholder="30" value={cDuration} onChange={e=>setCDuration(e.target.value)}/></div>
                  <div className="field"><label>Intensity</label>
                    <select className="sel" value={cIntensity} onChange={e=>setCIntensity(e.target.value)}>
                      {["Low","Medium","High","Very High"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Weight (kg)</label><input className="finp" type="number" placeholder="70" value={cWeight} onChange={e=>setCWeight(e.target.value)}/></div>
                </div>
              </>}

              {tool === "diet" && <>
                <div className="main-t">🥗 Budget Diet Planner</div>
                <div className="main-s">India's only AI meal planner based on your exact budget</div>
                <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"12px",padding:"14px",marginBottom:"18px",fontFamily:"Plus Jakarta Sans",fontSize:"13px",color:"var(--g)"}}>
                  🔥 Enter any budget from ₹50 to ₹500 — get a complete Indian day meal plan!
                </div>
                <div className="form-grid">
                  <div className="field"><label>Daily Budget (₹)</label><input className="finp" type="number" placeholder="100" value={dBudget} onChange={e=>setDBudget(e.target.value)}/></div>
                  <div className="field"><label>Your Goal</label>
                    <select className="sel" value={dGoal} onChange={e=>setDGoal(e.target.value)}>
                      {["Weight Loss","Muscle Gain","Maintain Weight","Improve Energy","Better Immunity"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Diet Type</label>
                    <select className="sel" value={dDiet} onChange={e=>setDDiet(e.target.value)}>
                      {["Vegetarian","Non-Vegetarian","Vegan","Eggetarian"].map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Allergies (optional)</label><input className="finp" placeholder="Nuts, dairy, etc." value={dAllergy} onChange={e=>setDAllergy(e.target.value)}/></div>
                </div>
              </>}

              {tool === "chat" && <>
                <div className="main-t">🤖 AI Trainer — Flex</div>
                <div className="main-s">Your personal AI fitness coach. Ask anything!</div>
                <div className="chat-msgs" ref={chatRef}>
                  {chatMsgs.map((m,i) => (
                    <div key={i} className={`msg-row ${m.role==="user"?"user":""}`}>
                      <div className={`msg-av ${m.role==="assistant"?"bot":"user"}`}>{m.role==="assistant"?"⚡":"👤"}</div>
                      <div className={`bubble ${m.role==="assistant"?"bot":"user"}`}>{m.content}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-row">
                  <input className="chat-inp" placeholder="Ask Flex anything about fitness..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
                  <button className="chat-send" onClick={sendChat}>➤</button>
                </div>
              </>}

              {tool !== "chat" && (
                <div style={{display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap",marginTop:"4px"}}>
                  <button className="run-btn" disabled={loading} onClick={runTool}>
                    {loading ? "⏳ AI Working..." : "✨ Generate with AI"}
                  </button>
                  {result && <button onClick={()=>{setResult("");setErr("");}} style={{background:"transparent",border:"1px solid rgba(255,255,255,0.08)",color:"#4A7A66",padding:"11px 18px",borderRadius:"10px",cursor:"pointer",fontFamily:"Plus Jakarta Sans",fontSize:"13px"}}>Clear ✕</button>}
                </div>
              )}

              {err && (
                <div>
                  <div className="err-msg">⚠️ {err}</div>
                  {err.includes("limit") && (
                    <div className="limit-box">
                      <p style={{fontFamily:"Plus Jakarta Sans",fontSize:"14px",color:"#6B9E8A",marginBottom:"10px"}}>Upgrade to Pro for unlimited sessions!</p>
                      <button className="bp" style={{fontSize:"14px",padding:"12px 24px"}} onClick={()=>setPage("pricing")}>Upgrade to Pro ⚡</button>
                    </div>
                  )}
                </div>
              )}

              {loading && tool !== "chat" && (
                <div className="load-box">
                  <div className="spinner"/>
                  <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"14px",color:"var(--muted)"}}>AI is generating your personalised plan...</div>
                </div>
              )}

              {result && !loading && <div className="result-box">{result}</div>}
            </div>
          </div>
        </div>
      )}

      {page === "payment" && payPlan && (
        <div className="pay-wrap">
          <div className="pay-box">
            {payStep === 1 && <>
              <div className="auth-t">Checkout 💳</div>
              <div className="auth-s">Subscribe to FitGenius {payPlan.name}</div>
              <div style={{background:"rgba(0,200,150,0.05)",border:"1px solid rgba(0,200,150,0.15)",borderRadius:"12px",padding:"14px",marginBottom:"24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontFamily:"Space Grotesk",fontSize:"14px",fontWeight:700,color:"var(--text)"}}>FitGenius {payPlan.name}</div>
                  <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"12px",color:"var(--muted)"}}>Billed monthly · Cancel anytime</div>
                </div>
                <div style={{fontFamily:"Space Grotesk",fontSize:"26px",fontWeight:700,color:"var(--g)"}}>{payPlan.price}<span style={{fontSize:"14px",color:"var(--muted)"}}>/mo</span></div>
              </div>
              <div className="field"><label>Name on Card</label><input className="finp" placeholder="Arjun Singh"/></div>
              <div className="field"><label>Card Number</label><input className="finp" placeholder="1234 5678 9012 3456" maxLength={19}/></div>
              <div className="card-row">
                <div className="field"><label>Expiry</label><input className="finp" placeholder="MM/YY" maxLength={5}/></div>
                <div className="field"><label>CVV</label><input className="finp" placeholder="•••" maxLength={3} type="password"/></div>
              </div>
              <button className="pay-btn" onClick={() => { setPayStep(2); setTimeout(() => { setUser(prev=>({...prev,plan:payPlan.id})); setPayStep(3); }, 2500); }}>
                PAY {payPlan.price}/MONTH
              </button>
              <button onClick={() => setPage("pricing")} style={{width:"100%",padding:"12px",background:"transparent",border:"none",color:"var(--muted)",fontFamily:"Plus Jakarta Sans",fontSize:"13px",cursor:"pointer",marginTop:"8px"}}>← Back</button>
              <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"11px",color:"#1A3A2E",textAlign:"center",marginTop:"14px"}}>🔒 Secured by Razorpay</div>
            </>}
            {payStep === 2 && (
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div className="spinner2"/>
                <div style={{fontFamily:"Space Grotesk",fontSize:"22px",fontWeight:700,marginBottom:"8px"}}>Processing...</div>
                <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"14px",color:"var(--muted)"}}>Please wait...</div>
              </div>
            )}
            {payStep === 3 && (
              <div style={{textAlign:"center",padding:"10px 0"}}>
                <div style={{fontSize:"56px",marginBottom:"14px"}}>🎉</div>
                <div style={{fontFamily:"Space Grotesk",fontSize:"28px",fontWeight:700,color:"var(--g)",marginBottom:"10px"}}>Welcome to Pro!</div>
                <div style={{fontFamily:"Plus Jakarta Sans",fontSize:"15px",color:"#6B9E8A",marginBottom:"24px"}}>Unlimited access unlocked!</div>
                <button className="bp" onClick={() => { setPage("dashboard"); setPayStep(1); }}>Start Training →</button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="footer">
        <strong style={{color:"var(--g)"}}>FitGenius AI</strong> · India's #1 AI Fitness Toolkit 🇮🇳
        <div style={{marginTop:"6px"}}>Built with ❤️ for every Indian who wants to get fit</div>
      </div>
    </div>
  );
}
                                                                                             
