import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, Square, ArrowUp, ArrowLeft, Loader2, RotateCcw } from "lucide-react";

/* ------------------------------------------------------------------
   我是谁? · Who am I?
   记忆碎片进来,轮廓慢慢显出来。所有分析由 Claude 实时完成。
------------------------------------------------------------------- */

const C = {
  paper: "#FFFFFF",
  mist: "#FAF8F5",
  line: "#E9E5DE",
  ink: "#17161A",
  graphite: "#6E6A66",
  dust: "#B4AEA4",
  sage: "#7C8F73",
  indigo: "#35415E",
};

const SERIF =
  '"Songti SC","Noto Serif SC","Source Han Serif SC","Songti TC",Georgia,"Times New Roman",serif';
const SANS =
  '"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,BlinkMacSystemFont,"Helvetica Neue",Arial,sans-serif';

const STORAGE_KEY = "self-archaeology-v1";
const LANG_KEY = "self-archaeology-lang";

const EMPTY = { entries: [], surface: [], deep: [], domains: [] };

/* ------------------------------- 文案 ------------------------------- */

const T = {
  zh: {
    booting: "正在打开",
    title: "我是谁?",
    subtitle: "说出一件想起来的事。一句也行,不用完整,不用按顺序。",
    placeholder: "我小时候经常害怕犯错……",
    me1: "我1",
    me2: "我2",
    listening: "在听",
    micOff: "这个环境不支持语音输入,可以直接打字。",
    micFail: "麦克风没能打开,可以直接打字。",
    surfaceLabel: "浅层",
    deepLabel: "深层",
    merged: "已并入你的地图",
    countZero: "还没有找回记忆",
    count: (n) => `已找回 ${n} 个记忆`,
    clear: "清空",
    clearWarn: "清空后无法恢复。",
    clearYes: "确认清空",
    clearNo: "取消",
    back: "返回",
    empty: "这里还是空的。回到首页,说一件想起来的事。",
    notDiagnosis: "非确诊",
    errAnalyze: "分析没有完成。再发一次,或者把这段话说得短一点。",
    fromN: (n) => `${n} 个记忆`,
    errSave: "这次没能存进档案,内容还在屏幕上。",
    crisis:
      "这里只做记录和整理,处理不了此刻的重量。如果你正处在危险中,请联系当地紧急服务,或身边任何一个你还愿意打电话的人。",
    locale: "zh-CN",
    speech: "zh-CN",
    other: "EN",
  },
  en: {
    booting: "Opening",
    title: "Who am I?",
    subtitle:
      "Say one thing you remember. A sentence is enough — it doesn't have to be complete or in order.",
    placeholder: "As a kid I was always afraid of getting things wrong…",
    me1: "Me 1",
    me2: "Me 2",
    listening: "Listening",
    micOff: "Voice input isn't supported here. Typing works.",
    micFail: "The microphone didn't open. Typing works.",
    surfaceLabel: "Surface",
    deepLabel: "Deep",
    merged: "Added to your map",
    countZero: "No memories yet",
    count: (n) => `${n} ${n === 1 ? "memory" : "memories"} recovered`,
    clear: "Clear",
    clearWarn: "This can't be undone.",
    clearYes: "Clear it",
    clearNo: "Cancel",
    back: "Back",
    empty: "Nothing here yet. Go back and say something you remember.",
    notDiagnosis: "Not a diagnosis",
    errAnalyze: "The analysis didn't finish. Send it again, or make it shorter.",
    fromN: (n) => `${n} ${n === 1 ? "memory" : "memories"}`,
    errSave: "That didn't save to your archive. It's still on screen.",
    crisis:
      "This place only records and sorts. It can't carry what you're holding right now. If you're in danger, contact your local emergency services, or anyone you'd still be willing to call.",
    locale: "en-US",
    speech: "en-US",
    other: "中",
  },
};

/* 方向词表:中文为规范键,英文为显示名 */
const DOMAINS = {
  创伤后应激方向: "Post-traumatic stress",
  抑郁情绪方向: "Depressive mood",
  焦虑与过度警觉方向: "Anxiety and hypervigilance",
  社交回避方向: "Social avoidance",
  强迫倾向方向: "Obsessive-compulsive tendency",
  解离方向: "Dissociation",
  情绪调节困难方向: "Emotion dysregulation",
  依恋不安全方向: "Insecure attachment",
  羞耻与自我否定方向: "Shame and self-negation",
  躯体化与睡眠方向: "Somatization and sleep",
  人际信任受损方向: "Impaired interpersonal trust",
  注意力困难方向: "Attention difficulty",
};

/* ----------------------------- Claude 调用 ----------------------------- */

async function askClaude(prompt) {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error("network");
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}

function parseJSON(raw) {
  let t = (raw || "").trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("parse");
  return JSON.parse(t.slice(s, e + 1));
}

function profileDigest(p) {
  const surface = p.surface.slice(0, 12).map((k) => `${k.keyword}(${k.weight})`).join("、");
  const deep = p.deep.slice(0, 12).map((d) => `${d.term}(${d.weight})`).join("、");
  const recent = p.entries.slice(-4).map((en) => `- ${en.text.slice(0, 60)}`).join("\n");
  return `已有表层关键词:${surface || "无"}\n已有深层构念:${deep || "无"}\n最近的记忆:\n${
    recent || "无"
  }`;
}

const INGEST_PROMPT = (text, digest, lang) => `你是一个长期陪伴用户做自我考古的分析引擎。用户零散地说出记忆、人生事件、突然想起的片段。你要把每个片段整理成结构化记录,并更新他的身份地图。

用户已有的档案:
${digest}

用户这次输入:
"""
${text}
"""

请只输出一个 JSON 对象,不要有任何前后文字、不要用 markdown 代码块。结构:
{
  "reply": "60-110字(英文时 60-100 words)的分析。用第二人称,直接说出:当时的他在那件事里处于什么状态、表现出什么特性、这些特性是怎么被情境逼出来的、现在还在怎么运作。落到他说的细节上,不回避不好听的部分。",
  "event": {
    "title": "6字以内的事件名",
    "time": "如'童年''高中''去年''不详'",
    "ageStage": "幼年/童年/青春期/成年早期/成年/不详",
    "people": ["涉及的人物关系"],
    "content": "一句话事实描述",
    "emotion": ["情绪词 2-4 个"],
    "behavior": "他当时的行为反应,一句话"
  },
  "surface": [
    {"keyword": "中文日常词", "en": "对应的英文日常词", "evidence": "这个词从这段话的哪里来,一句话"}
  ],
  "deep": [
    {"term": "English psychological construct", "zh": "中文译名", "evidence": "依据,一句话", "strength": 70}
  ],
  "domains": [
    {"name": "受控词表里的中文方向名", "strength": 60}
  ],
  "safety": "none"
}

输出语言:reply、event 各字段、evidence 一律使用${
  lang === "en" ? "英文" : "中文"
}。但 surface 的 keyword 字段永远写中文(它是跨语言的合并键),同时必须给出 en 字段;deep 的 term 永远写英文,zh 写中文译名;domains 的 name 永远写中文原词。

规则:
- reply 里绝对不要出现任何问句,不要反问,不要以问题结尾,不要邀请他多讲。他只想直接拿到分析结果。信息不足就基于现有内容做出有限但明确的判断。
- surface 描述的是他在这件事发生的当下所呈现出来的特性,是对故事里那个人的客观描述,不是对他整个人的评价。以事件中实际发生的行为为准:他做了什么、没做什么、怎么反应。
- 负面的特性必须如实给出:懦弱、退缩、讨好、隐忍、麻木、不敢开口、认命、逞强、自我怀疑。不要因为怕伤人就回避,也不要把一段被欺负、被压制的经历里的沉默说成"坚强"。
- 正面的特性同样要给出,只要事件里真的存在:撑住了、护住了别人、忍着把事做完、事后还愿意讲出来、观察力敏锐。不要为了平衡而硬加,也不要为了深刻而只留难看的部分。哪一面在故事里更明显,就让哪一面更多。
- surface 必须恰好给 10 个,按与这段叙述的相关度从高到低排列。必须是普通人一看就懂的日常词,禁止任何专业术语。已有的词再次出现时,keyword 用完全相同的字符串。
- 凑满 10 个的办法是把这段叙述看得更细:他当时的姿态、说话方式、对他人的反应、对自己的反应、事后的处理方式,都可以各出一个词。不要为了凑数编造叙述里没有的内容——每一个词都必须能在他说的话里指出依据。如果材料实在太短,可以给出程度较弱、更具体的特性,但依然不许无中生有。
- deep 给 1-4 个,使用人格心理学、依恋理论、创伤心理学、认知行为理论、精神分析、神经科学中的描述性构念,例如:Attachment Anxiety、Hypervigilance、Emotional Suppression、Maladaptive Perfectionism、Avoidant Coping、Negative Self-Schema、Conditional Self-Worth、Fear of Failure Schema、Emotional Invalidation、Parentification、Learned Helplessness、Shame-Based Identity、Identification with the Aggressor、Dissociative Detachment、Reaction Formation、Repression、Displacement、Splitting、Intellectualization、Somatization、Freeze Response。已有的构念再次出现时,term 用完全相同的英文字符串。
- strength 是 0-100 的整数,表示这一段材料对该项的支持强度:证据直接明确给 75-95,间接推断给 40-70,只是苗头给 20-40。
- domains 是"值得关注的方向",给 0-3 个,只能从下面这个固定词表里原样选取,不得自创、不得改写:创伤后应激方向、抑郁情绪方向、焦虑与过度警觉方向、社交回避方向、强迫倾向方向、解离方向、情绪调节困难方向、依恋不安全方向、羞耻与自我否定方向、躯体化与睡眠方向、人际信任受损方向、注意力困难方向。材料里没有依据的方向就不要给,宁可少给。
- 绝对禁止输出任何疾病名称、诊断标签、DSM-5 或 ICD-11 分类名,以及"确诊""疑似""符合……标准"这类措辞。你做的是模式描述,不是诊断。
- 如果输入里出现自伤、自杀、想消失或严重危机的信号,把 safety 设为 "crisis",surface、deep、domains 都返回空数组,reply 改为温柔地关心他此刻的状态、并邀请他联系身边可信任的人或专业支持。
- 如果只是很痛苦但没有危机信号,safety 设为 "distress",其余照常。
- 如果输入完全不是关于个人经历,reply 正常回应,event 各字段留空,surface、deep、domains 返回空数组。`;

const TRANSLATE_PROMPT = (surfaceWords, deepTerms) => `把下面两组心理词汇补全成中英对照。

第一组是中文日常人格词,需要英文对应词。要求:普通人一看就懂的日常英文,不要用临床术语,不要解释,一个词或一个短语。
${JSON.stringify(surfaceWords)}

第二组是英文心理学构念名,需要中文译名。要求:使用心理学中文文献里的通行译法,不要音译,不要加括号注释。
${JSON.stringify(deepTerms)}

请只输出一个 JSON 对象,不要有任何前后文字、不要用 markdown 代码块:
{
  "surface": {"中文词": "English word"},
  "deep": {"English Construct": "中文译名"}
}
两组都必须原样使用给定的字符串作为键,一个不漏,不要新增。`;

/* ------------------------------ 合并逻辑 ------------------------------ */

function scoreOf(sum, weight) {
  const avg = (sum || 50) / weight;
  return Math.min(100, Math.round(avg * (1 + 0.16 * (weight - 1))));
}

function mergeProfile(prev, entryId, result) {
  const surface = prev.surface.map((k) => ({ ...k }));
  (result.surface || []).forEach((s) => {
    if (!s || !s.keyword) return;
    const key = s.keyword.trim();
    const hit = surface.find((k) => k.keyword === key);
    if (hit) {
      hit.weight += 1;
      if (s.en && !hit.en) hit.en = s.en;
      hit.sources = [...hit.sources, { entryId, evidence: s.evidence || "" }];
    } else {
      surface.push({
        keyword: key,
        en: s.en || key,
        weight: 1,
        sources: [{ entryId, evidence: s.evidence || "" }],
      });
    }
  });

  const deep = prev.deep.map((d) => ({ ...d }));
  (result.deep || []).forEach((s) => {
    if (!s || !s.term) return;
    const st = Math.max(0, Math.min(100, Number(s.strength) || 50));
    const hit = deep.find((d) => d.term === s.term.trim());
    if (hit) {
      hit.weight += 1;
      hit.strengthSum = (hit.strengthSum || 50) + st;
      if (s.zh && !hit.zh) hit.zh = s.zh;
      hit.sources = [...hit.sources, { entryId, evidence: s.evidence || "" }];
    } else {
      deep.push({
        term: s.term.trim(),
        zh: s.zh || "",
        weight: 1,
        strengthSum: st,
        sources: [{ entryId, evidence: s.evidence || "" }],
      });
    }
  });
  deep.forEach((d) => (d.score = scoreOf(d.strengthSum, d.weight)));

  const domains = (prev.domains || []).map((d) => ({ ...d }));
  (result.domains || []).forEach((s) => {
    if (!s || !s.name) return;
    const name = s.name.trim();
    if (!DOMAINS[name]) return; // 只接受词表内的项
    const st = Math.max(0, Math.min(100, Number(s.strength) || 50));
    const hit = domains.find((d) => d.name === name);
    if (hit) {
      hit.weight += 1;
      hit.strengthSum = (hit.strengthSum || 50) + st;
    } else {
      domains.push({ name, weight: 1, strengthSum: st });
    }
  });
  domains.forEach((d) => (d.score = scoreOf(d.strengthSum, d.weight)));

  surface.sort((a, b) => b.weight - a.weight);
  deep.sort((a, b) => (b.score || 0) - (a.score || 0));
  domains.sort((a, b) => (b.score || 0) - (a.score || 0));
  return { surface, deep, domains };
}

/* -------------------------------- 主体 -------------------------------- */

export default function SelfArchaeology() {
  const [lang, setLang] = useState("zh");
  const [profile, setProfile] = useState(EMPTY);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home");
  const [origin, setOrigin] = useState("home");
  const [listFilter, setListFilter] = useState(null); // null = 全部记忆
  const [openId, setOpenId] = useState(null);
  const [darkFlow, setDarkFlow] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [reply, setReply] = useState(null);
  const [error, setError] = useState("");
  const [listening, setListening] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const areaRef = useRef(null);
  const recRef = useRef(null);
  const t = T[lang];

  useEffect(() => {
    (async () => {
      try {
        const l = await window.storage.get(LANG_KEY);
        if (l && (l.value === "zh" || l.value === "en")) setLang(l.value);
      } catch (e) {
        /* 首次使用 */
      }
      try {
        const r = await window.storage.get(STORAGE_KEY);
        if (r && r.value) {
          const p = { ...EMPTY, ...JSON.parse(r.value) };
          p.deep = (p.deep || []).map((d) => ({
            ...d,
            strengthSum: d.strengthSum || 50 * d.weight,
            score: d.score != null ? d.score : scoreOf(50 * d.weight, d.weight),
          }));
          setProfile(p);
        }
      } catch (e) {
        /* 空档案 */
      }
      setReady(true);
    })();
  }, []);

  const save = useCallback(
    async (next) => {
      setProfile(next);
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        setError(t.errSave);
      }
    },
    [t]
  );

  /* 补齐词云的另一种语言。旧档案里缺 en / zh 的词会在这里被补上,
     补完写回存档,所以每个词只翻译一次。 */
  const transRef = useRef(false);
  useEffect(() => {
    if (!ready || transRef.current) return;
    const needEn = profile.surface.filter((w) => !w.en || w.en === w.keyword).map((w) => w.keyword);
    const needZh = profile.deep.filter((d) => !d.zh).map((d) => d.term);
    if (needEn.length === 0 && needZh.length === 0) return;
    transRef.current = true;
    (async () => {
      try {
        const raw = await askClaude(TRANSLATE_PROMPT(needEn, needZh));
        const r = parseJSON(raw);
        const surface = profile.surface.map((w) =>
          r.surface && r.surface[w.keyword] ? { ...w, en: r.surface[w.keyword] } : w
        );
        const deep = profile.deep.map((d) =>
          r.deep && r.deep[d.term] ? { ...d, zh: r.deep[d.term] } : d
        );
        await save({ ...profile, surface, deep });
      } catch (e) {
        /* 翻译失败就先用原语言显示,下次进来再试 */
      }
      transRef.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, profile.surface, profile.deep]);

  const switchLang = async () => {
    const next = lang === "zh" ? "en" : "zh";
    setLang(next);
    setError("");
    try {
      await window.storage.set(LANG_KEY, next);
    } catch (e) {
      /* 语言偏好没存上不影响使用 */
    }
  };

  const SR =
    typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

  const toggleMic = () => {
    if (!SR) return;
    if (listening) {
      recRef.current && recRef.current.stop();
      setListening(false);
      return;
    }
    try {
      const rec = new SR();
      rec.lang = t.speech;
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (ev) => {
        let add = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) add += ev.results[i][0].transcript;
        }
        if (add) setText((v) => (v ? v + add : add));
      };
      rec.onerror = () => {
        setListening(false);
        setError(t.micFail);
      };
      rec.onend = () => setListening(false);
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch (e) {
      setError(t.micOff);
    }
  };

  const submit = async () => {
    const v = text.trim();
    if (!v || busy) return;
    setBusy(true);
    setError("");
    setReply(null);
    if (listening) {
      recRef.current && recRef.current.stop();
      setListening(false);
    }
    try {
      const raw = await askClaude(INGEST_PROMPT(v, profileDigest(profile), lang));
      const r = parseJSON(raw);
      const entry = {
        id: "e" + Date.now(),
        text: v,
        at: Date.now(),
        event: r.event || null,
        safety: r.safety || "none",
      };
      const merged = mergeProfile(profile, entry.id, r);
      await save({
        entries: [...profile.entries, entry],
        surface: merged.surface,
        deep: merged.deep,
        domains: merged.domains,
      });
      setReply({
        text: r.reply || "",
        safety: r.safety || "none",
        surface: (r.surface || [])
          .map((x) => (lang === "en" ? x.en || x.keyword : x.keyword))
          .filter(Boolean),
        deep: (r.deep || [])
          .map((x) => (lang === "en" ? x.term : x.zh || x.term))
          .filter(Boolean),
        event: r.event || null,
      });
      setText("");
      if (areaRef.current) areaRef.current.style.height = "auto";
    } catch (e) {
      setError(t.errAnalyze);
    }
    setBusy(false);
  };

  const grow = (el) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 220) + "px";
  };

  const resetAll = async () => {
    await save(EMPTY);
    setReply(null);
    setConfirmReset(false);
    setView("home");
  };

  if (!ready) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: C.paper }}>
        <span className="text-xs tracking-[0.3em]" style={{ color: C.dust, fontFamily: SANS }}>
          {t.booting}
        </span>
      </div>
    );
  }

  const dark = view === "deep" || (darkFlow && (view === "memories" || view === "memory"));

  const openList = (from, filter, isDark) => {
    setOrigin(from);
    setListFilter(filter);
    setDarkFlow(!!isDark);
    setView("memories");
  };

  return (
    <div
      className="w-full min-h-screen transition-colors duration-300"
      style={{
        background: dark ? C.ink : C.paper,
        color: dark ? C.paper : C.ink,
        fontFamily: SANS,
      }}
    >
      <div className="max-w-2xl mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <div className="flex justify-end mb-4">
          <button
            onClick={switchLang}
            className="text-[11px] tracking-[0.18em] px-2 py-1 transition-colors"
            style={{ color: dark ? "rgba(255,255,255,0.45)" : C.dust }}
            aria-label="switch language"
          >
            {t.other}
          </button>
        </div>

        {view === "home" && (
          <Home
            {...{
              t,
              profile,
              text,
              setText,
              busy,
              reply,
              error,
              listening,
              toggleMic,
              submit,
              SR,
              areaRef,
              grow,
              setView,
              confirmReset,
              setConfirmReset,
              resetAll,
              openList,
            }}
          />
        )}

        {view === "surface" && (
          <Surface
            t={t}
            lang={lang}
            profile={profile}
            back={() => setView("home")}
            openList={openList}
          />
        )}

        {view === "deep" && (
          <Deep
            t={t}
            lang={lang}
            profile={profile}
            back={() => setView("home")}
            openList={openList}
          />
        )}

        {view === "memories" && (
          <Memories
            t={t}
            dark={dark}
            profile={profile}
            filter={listFilter}
            back={() => setView(origin)}
            open={(id) => {
              setOpenId(id);
              setView("memory");
            }}
          />
        )}

        {view === "memory" && (
          <MemoryDetail
            t={t}
            lang={lang}
            dark={dark}
            profile={profile}
            id={openId}
            back={() => setView("memories")}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------- 首页 ------------------------------- */

function Home(props) {
  const {
    t,
    profile,
    text,
    setText,
    busy,
    reply,
    error,
    listening,
    toggleMic,
    submit,
    SR,
    areaRef,
    grow,
    setView,
    confirmReset,
    setConfirmReset,
    resetAll,
    openList,
  } = props;
  const count = profile.entries.length;

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-[26px] sm:text-[30px] leading-tight" style={{ fontFamily: SERIF, letterSpacing: "0.06em" }}>
          {t.title}
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed" style={{ color: C.graphite }}>
          {t.subtitle}
        </p>
      </div>

      {reply && (
        <div className="mb-8">
          <div
            className="pl-4 py-1"
            style={{ borderLeft: `2px solid ${reply.safety === "crisis" ? C.indigo : C.sage}` }}
          >
            <p className="text-[15px] leading-[1.9]" style={{ fontFamily: SERIF, color: C.ink }}>
              {reply.text}
            </p>
            {reply.safety === "crisis" && (
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.graphite }}>
                {t.crisis}
              </p>
            )}
          </div>

          {(reply.surface.length > 0 || reply.deep.length > 0) && (
            <div className="mt-6 rounded-xl px-5 py-5" style={{ background: C.mist }}>
              {reply.event && (reply.event.time || reply.event.ageStage) ? (
                <div className="text-[10.5px] tracking-[0.2em] mb-4" style={{ color: C.dust }}>
                  {[reply.event.time, reply.event.ageStage, reply.event.title].filter(Boolean).join(" · ")}
                </div>
              ) : null}

              {reply.surface.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.sage }} />
                    <span className="text-[10.5px] tracking-[0.2em]" style={{ color: C.graphite }}>
                      {t.surfaceLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {reply.surface.map((k) => (
                      <span key={k} className="text-[16px]" style={{ fontFamily: SERIF }}>
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {reply.deep.length > 0 && (
                <div className="mt-5 pt-5" style={{ borderTop: `1px solid ${C.line}` }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: C.indigo }} />
                    <span className="text-[10.5px] tracking-[0.2em]" style={{ color: C.graphite }}>
                      {t.deepLabel}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {reply.deep.map((d) => (
                      <span key={d} className="text-[13.5px]" style={{ fontFamily: SERIF }}>
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-5 text-[11px]" style={{ color: C.dust }}>
                {t.merged}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="rounded-2xl" style={{ border: `1px solid ${C.line}`, background: C.mist }}>
        <textarea
          ref={areaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            grow(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={3}
          placeholder={t.placeholder}
          className="w-full resize-none bg-transparent outline-none px-5 pt-5 pb-2 text-[15px] leading-[1.9] placeholder:text-[#B4AEA4]"
          style={{ fontFamily: SERIF, color: C.ink }}
        />
        <div className="flex items-center justify-between px-4 pb-4 pt-1">
          <button
            onClick={toggleMic}
            disabled={!SR}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity disabled:opacity-30"
            style={{
              border: `1px solid ${listening ? C.sage : C.line}`,
              color: listening ? C.sage : C.graphite,
              background: C.paper,
            }}
          >
            {listening ? <Square size={13} /> : <Mic size={15} />}
          </button>

          <div className="flex items-center gap-3">
            {listening && (
              <span className="text-[11px]" style={{ color: C.sage }}>
                {t.listening}
              </span>
            )}
            <button
              onClick={submit}
              disabled={busy || !text.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity disabled:opacity-25"
              style={{ background: C.ink, color: C.paper }}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-[12px]" style={{ color: C.indigo }}>
          {error}
        </p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-3">
        <LayerButton title={t.me1} onClick={() => setView("surface")} />
        <LayerButton title={t.me2} onClick={() => setView("deep")} dark />
      </div>

      <div className="mt-10 flex items-center justify-between">
        {count === 0 ? (
          <span className="text-[11px]" style={{ color: C.dust }}>
            {t.countZero}
          </span>
        ) : (
          <button
            onClick={() => openList("home", null, false)}
            className="text-[11px] underline underline-offset-4"
            style={{ color: C.dust }}
          >
            {t.count(count)}
          </button>
        )}
        {count > 0 &&
          (confirmReset ? (
            <span className="text-[11px]" style={{ color: C.graphite }}>
              {t.clearWarn}
              <button onClick={resetAll} className="ml-2 underline" style={{ color: C.indigo }}>
                {t.clearYes}
              </button>
              <button onClick={() => setConfirmReset(false)} className="ml-3 underline" style={{ color: C.dust }}>
                {t.clearNo}
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[11px] flex items-center gap-1"
              style={{ color: C.dust }}
            >
              <RotateCcw size={11} /> {t.clear}
            </button>
          ))}
      </div>
    </div>
  );
}

function LayerButton({ title, onClick, dark }) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-5 py-5 transition-opacity hover:opacity-80"
      style={{
        border: `1px solid ${dark ? C.ink : C.line}`,
        background: dark ? C.ink : C.paper,
        color: dark ? C.paper : C.ink,
      }}
    >
      <span className="text-[17px]" style={{ fontFamily: SERIF, letterSpacing: "0.05em" }}>
        {title}
      </span>
    </button>
  );
}

/* ------------------------------- 词云 ------------------------------- */

function Cloud({ items, dark, t, onPick, holdRef }) {
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const max = Math.max(1, ...items.map((i) => i.weight));
  const active = items.find((i) => i.key === hover);

  return (
    <>
      <div
        className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-4 py-8 select-none"
        onPointerMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onPointerLeave={() => setHover(null)}
        {...(holdRef || {})}
      >
        {items.map((it) => {
          const r = it.weight / max;
          const dim = hover !== null && hover !== it.key;
          return (
            <span
              key={it.key}
              onPointerEnter={() => setHover(it.key)}
              onClick={() => onPick(it)}
              className="cursor-pointer transition-opacity duration-200"
              style={{
                fontFamily: SERIF,
                fontSize: 16 + Math.round(r * 25),
                lineHeight: 1.3,
                color: dark ? C.paper : C.ink,
                opacity: dim ? 0.13 : 0.42 + r * 0.58,
              }}
            >
              {it.label}
            </span>
          );
        })}
      </div>

      {active && (
        <div
          className="fixed pointer-events-none text-[11px] tracking-wide"
          style={{
            left: pos.x + 16,
            top: pos.y + 16,
            zIndex: 60,
            color: dark ? "rgba(255,255,255,0.7)" : C.graphite,
          }}
        >
          {t.fromN(active.count)}
        </div>
      )}
    </>
  );
}

const uniqIds = (sources) => Array.from(new Set((sources || []).map((x) => x.entryId)));

/* -------------------------------- 我1 -------------------------------- */

function Surface({ t, lang, profile, back, openList }) {
  const items = profile.surface.map((w) => {
    const ids = uniqIds(w.sources);
    return {
      key: w.keyword,
      label: lang === "en" ? w.en || w.keyword : w.keyword,
      weight: w.weight,
      count: ids.length,
      ids,
    };
  });

  return (
    <div>
      <TopBar back={back} label={t.back} />
      {items.length === 0 ? (
        <Empty text={t.empty} />
      ) : (
        <Cloud
          items={items}
          dark={false}
          t={t}
          onPick={(it) => openList("surface", { label: it.label, ids: it.ids }, false)}
        />
      )}
    </div>
  );
}

/* -------------------------------- 我2 -------------------------------- */

/* 彩蛋:方向那一排默认不出现在界面上。
   条件一,记忆数量达到 REVEAL_AFTER;条件二,在词云上按住不放约 HOLD_MS。
   两个条件同时满足时才浮出来,离开页面即收回。 */
const REVEAL_AFTER = 8;
const HOLD_MS = 1200;

function Deep({ t, lang, profile, back, openList }) {
  const [revealed, setRevealed] = useState(false);
  const timer = useRef(null);
  const fired = useRef(false);

  const items = profile.deep.map((d) => {
    const ids = uniqIds(d.sources);
    return {
      key: d.term,
      label: lang === "en" ? d.term : d.zh || d.term,
      weight: d.weight,
      count: ids.length,
      ids,
    };
  });
  const domains = [...(profile.domains || [])].sort((x, y) => (y.score || 0) - (x.score || 0));
  const unlocked = profile.entries.length >= REVEAL_AFTER && domains.length > 0;

  const holdHandlers = {
    onPointerDown: () => {
      if (!unlocked || revealed) return;
      timer.current = setTimeout(() => {
        fired.current = true;
        setRevealed(true);
      }, HOLD_MS);
    },
    onPointerUp: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    },
    onPointerCancel: () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    },
  };
  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  // 黑底上"由深至浅"反过来读:最相关的最亮
  const shade = (i, n) => {
    const p = n <= 1 ? 0 : i / (n - 1);
    const from = [255, 255, 255];
    const to = [104, 110, 124];
    const c = from.map((v, k) => Math.round(v + (to[k] - v) * p));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };

  return (
    <div>
      <TopBar back={back} label={t.back} dark />
      {items.length === 0 ? (
        <Empty text={t.empty} dark />
      ) : (
        <>
          <Cloud
            items={items}
            dark
            t={t}
            holdRef={holdHandlers}
            onPick={(it) => {
              if (fired.current) {
                fired.current = false;
                return;
              }
              openList("deep", { label: it.label, ids: it.ids }, true);
            }}
          />

          {unlocked && revealed && (
            <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.16)" }}>
              <div
                className="text-[10px] tracking-[0.2em] mb-3"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {t.notDiagnosis}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                {domains.map((d, i) => (
                  <span
                    key={d.name}
                    className="text-[13.5px]"
                    style={{ fontFamily: SERIF, color: shade(i, domains.length) }}
                  >
                    {lang === "en" ? DOMAINS[d.name] || d.name : d.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ----------------------------- 记忆清单 ----------------------------- */

function fmtDate(ts, locale) {
  const d = new Date(ts);
  return d.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function fmtTime(ts, locale) {
  return new Date(ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
}

function Memories({ t, dark, profile, filter, back, open }) {
  const list = (filter ? profile.entries.filter((e) => filter.ids.includes(e.id)) : profile.entries)
    .slice()
    .reverse();

  return (
    <div>
      <TopBar back={back} label={t.back} dark={dark} />
      <div className="flex flex-col">
        {list.map((e) => (
          <button
            key={e.id}
            onClick={() => open(e.id)}
            className="text-left py-3 transition-opacity hover:opacity-60"
            style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.line}` }}
          >
            <span className="text-[12px] tracking-wide" style={{ color: dark ? C.paper : C.ink }}>
              {fmtDate(e.at, t.locale)}
            </span>
            <span
              className="ml-3 text-[11px]"
              style={{ color: dark ? "rgba(255,255,255,0.4)" : C.dust }}
            >
              {fmtTime(e.at, t.locale)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- 记忆详情 ----------------------------- */

function MemoryDetail({ t, lang, dark, profile, id, back }) {
  const e = profile.entries.find((x) => x.id === id);
  if (!e) return <TopBar back={back} label={t.back} dark={dark} />;

  const soft = dark ? "rgba(255,255,255,0.5)" : C.graphite;
  const faint = dark ? "rgba(255,255,255,0.35)" : C.dust;

  const surface = profile.surface
    .filter((w) => uniqIds(w.sources).includes(e.id))
    .map((w) => (lang === "en" ? w.en || w.keyword : w.keyword));
  const deep = profile.deep
    .filter((d) => uniqIds(d.sources).includes(e.id))
    .map((d) => (lang === "en" ? d.term : d.zh || d.term));

  const meta = e.event
    ? [e.event.time, e.event.ageStage, ...(e.event.people || [])].filter(Boolean).join(" · ")
    : "";

  return (
    <div>
      <TopBar back={back} label={t.back} dark={dark} />

      <div className="text-[11px] tracking-[0.18em] mb-5" style={{ color: faint }}>
        {fmtDate(e.at, t.locale)} · {fmtTime(e.at, t.locale)}
      </div>

      <p
        className="text-[15px] leading-[2]"
        style={{ fontFamily: SERIF, color: dark ? C.paper : C.ink }}
      >
        {e.text}
      </p>

      {meta && (
        <div className="mt-5 text-[11.5px]" style={{ color: soft }}>
          {meta}
        </div>
      )}

      {surface.length > 0 && (
        <div className="mt-8 pt-5" style={{ borderTop: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.line}` }}>
          <div className="text-[10px] tracking-[0.2em] mb-2.5" style={{ color: faint }}>
            {t.surfaceLabel}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {surface.map((k) => (
              <span key={k} className="text-[13.5px]" style={{ fontFamily: SERIF }}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {deep.length > 0 && (
        <div className="mt-6 pt-5" style={{ borderTop: `1px solid ${dark ? "rgba(255,255,255,0.12)" : C.line}` }}>
          <div className="text-[10px] tracking-[0.2em] mb-2.5" style={{ color: faint }}>
            {t.deepLabel}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {deep.map((d) => (
              <span key={d} className="text-[13px]" style={{ fontFamily: SERIF }}>
                {d}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ 小组件 ------------------------------ */

function TopBar({ back, label, dark }) {
  return (
    <button
      onClick={back}
      className="flex items-center gap-1.5 text-[12px] mb-8"
      style={{ color: dark ? "rgba(255,255,255,0.55)" : C.graphite }}
    >
      <ArrowLeft size={13} /> {label}
    </button>
  );
}

function Empty({ text, dark }) {
  return (
    <p
      className="text-[13px] leading-relaxed"
      style={{ color: dark ? "rgba(255,255,255,0.55)" : C.graphite }}
    >
      {text}
    </p>
  );
}
