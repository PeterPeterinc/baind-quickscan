import { useState, useEffect, useMemo } from "react";
import { flushSync } from "react-dom";
import baindLogoWit from "./baind-logo-wit.png";

const BEDANKT_URL = "https://www.baind.nl/quickscan/bedankt";

/*
  BAIND QUICKSCAN — AI-adoptie (laagdrempelige start)
  Styled with the Baind Design System tokens (Figma).
  Font: Rethink Sans — Regular 400 voor display/headings met negatieve
  letter-spacing, Medium 500 voor H5/H6/links/labels/buttons.
*/

// Design tokens — mapped 1:1 to Figma variables in Baind Design System
const tokens = {
  color: {
    brand500: "#FFBF00",
    brandText: "#00302E",
    dark: {
      bg: "#0A2826",
      text: "#FFFFFF",
      border: "rgba(255,255,255,0.2)",
    },
    light: {
      bg: "#FFFFFF",
      text: "#00302E",
      border: "rgba(0,48,46,0.2)",
    },
    button: {
      primary: {
        bg: "#FFBF00",
        text: "#00302E",
        border: "#FFBF00",
        bgHover: "#00302E",
        textHover: "#FFFFFF",
        borderHover: "#00302E",
      },
      secondaryDark: {
        bg: "transparent",
        text: "#FFFFFF",
        border: "rgba(255,255,255,0.2)",
        borderHover: "#FFFFFF",
      },
    },
  },
  space: { 0: 0, 1: 8, 2: 12, 3: 16, 5: 32, 6: 40, 7: 48, 8: 64 },
  section: { none: 0, small: 80, main: 112, large: 160, pageTop: 224 },
  site: { margin: 96, gutter: 24 },
  radius: { small: 8, main: 16, round: 99999 },
  borderWidth: { main: 2 },
  fontSize: {
    display: 88,
    h1: 64, h2: 48, h3: 32, h4: 24, h5: 18, h6: 16,
    textMain: 20, textSmall: 16, textLink: 16,
  },
  letterSpacing: {
    display: "-0.0114em",
    h1: "-0.047em",
    h2: "-0.0417em",
    h3: "-0.0313em",
    h4: "0",
  },
};

const C = {
  bg: tokens.color.dark.bg,
  card: "#0C3331",
  cardHover: "#103D3A",
  border: tokens.color.dark.border,
  borderHover: "rgba(255,255,255,0.35)",
  white: tokens.color.dark.text,
  muted: "rgba(255,255,255,0.72)",
  subtle: "rgba(255,255,255,0.5)",
  accent: tokens.color.brand500,
  accentInk: tokens.color.brandText,
  accentDim: "rgba(255,191,0,0.14)",
  brandText: tokens.color.brandText,
  teal: "#5FB8B2",
  cream: "#F3EDE1",
  creamText: tokens.color.light.text,
  creamMuted: "rgba(0,48,46,0.82)",
  red: "#E2785A",
  orange: "#E4A74D",
  green: "#5FB8B2",
  dimGreen: "rgba(95,184,178,0.14)",
  dimOrange: "rgba(228,167,77,0.14)",
  dimRed: "rgba(226,120,90,0.14)",
  divider: "rgba(255,255,255,0.12)",
};

const FONT = `'Rethink Sans', 'Plus Jakarta Sans', 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const MONO = `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace`;

const buttonPrimaryStyle = ({ submitting = false } = {}) => ({
  background: submitting ? C.border : tokens.color.button.primary.bg,
  color: submitting ? C.white : tokens.color.button.primary.text,
  border: `${tokens.borderWidth.main}px solid ${
    submitting ? C.border : tokens.color.button.primary.border
  }`,
  borderRadius: tokens.radius.main,
  padding: "14px 26px 14px 30px",
  fontSize: tokens.fontSize.textLink,
  fontWeight: 500,
  fontFamily: FONT,
  transition: "background 0.2s, border-color 0.2s, color 0.2s",
});

const hoverPrimaryOn = (e) => {
  e.currentTarget.style.background = tokens.color.button.primary.bgHover;
  e.currentTarget.style.borderColor = tokens.color.button.primary.borderHover;
  e.currentTarget.style.color = tokens.color.button.primary.textHover;
};
const hoverPrimaryOff = (e) => {
  e.currentTarget.style.background = tokens.color.button.primary.bg;
  e.currentTarget.style.borderColor = tokens.color.button.primary.border;
  e.currentTarget.style.color = tokens.color.button.primary.text;
};

const DIMENSIONS = {
  kennismaking: { label: "Kennismaking", icon: "✦", color: C.accent, dimColor: C.accentDim },
  houding: { label: "Houding", icon: "◎", color: C.teal, dimColor: C.dimGreen },
  organisatie: { label: "Organisatie", icon: "⬡", color: C.accent, dimColor: C.accentDim },
};

function DimIcon({ dim, size = 14 }) {
  return <span style={{ fontSize: size, lineHeight: 1 }}>{dim.icon}</span>;
}

const usesAi = (answers) => {
  const v = answers.use_ai?.value;
  return v && v !== "Nee";
};

const usesAiPrivately = (answers) => {
  const v = answers.private_ai?.value;
  return v === "Ja, regelmatig" || v === "Soms";
};

const QUESTIONS = [
  // ── 1. Kennismaking met AI ──
  {
    id: "use_ai",
    dim: "kennismaking",
    type: "single",
    q: "Gebruik jij wel eens AI?",
    sub: "Denk aan ChatGPT, Copilot, Gemini of andere AI-tools — op het werk of privé.",
    opts: [
      { text: "Ja, regelmatig", score: 4 },
      { text: "Af en toe", score: 3 },
      { text: "Ik heb het geprobeerd", score: 2 },
      { text: "Nee", score: 1 },
    ],
  },
  {
    id: "tools",
    dim: "kennismaking",
    type: "multi",
    q: "Welke AI-tools heb je wel eens gebruikt?",
    sub: "Meerdere antwoorden mogelijk.",
    showIf: usesAi,
    opts: [
      { text: "ChatGPT" },
      { text: "Microsoft Copilot" },
      { text: "Gemini" },
      { text: "Claude" },
      { text: "Midjourney" },
      { text: "Perplexity" },
      { text: "Anders, namelijk...", other: true },
    ],
  },
  {
    id: "free_at_work",
    dim: "kennismaking",
    type: "single",
    q: "Heb je op je werk wel eens de gratis versie van ChatGPT of een andere AI-tool gebruikt?",
    sub: "Geen goed of fout antwoord — we zijn benieuwd naar de praktijk.",
    showIf: usesAi,
    opts: [
      { text: "Ja", score: 3 },
      { text: "Nee", score: 2 },
      { text: "Weet ik niet", score: 1 },
    ],
  },
  {
    id: "use_cases",
    dim: "kennismaking",
    type: "multi",
    q: "Waarvoor heb je AI gebruikt?",
    sub: "Meerdere antwoorden mogelijk.",
    showIf: usesAi,
    opts: [
      { text: "Informatie opzoeken" },
      { text: "Teksten schrijven" },
      { text: "Samenvatten" },
      { text: "Vertalen" },
      { text: "Brainstormen" },
      { text: "Afbeeldingen maken" },
      { text: "Afbeeldingen bewerken" },
      { text: "Anders", other: true },
    ],
  },
  {
    id: "private_ai",
    dim: "kennismaking",
    type: "single",
    q: "Gebruik je AI ook privé?",
    sub: "Buiten je werk om, voor jezelf.",
    opts: [
      { text: "Ja, regelmatig", score: 4 },
      { text: "Soms", score: 3 },
      { text: "Nee", score: 1 },
    ],
  },
  {
    id: "home_use",
    dim: "kennismaking",
    type: "multi",
    q: "Waarvoor gebruik je AI thuis?",
    sub: "Meerdere antwoorden mogelijk.",
    showIf: usesAiPrivately,
    opts: [
      { text: "Recepten" },
      { text: "Vakantie plannen" },
      { text: "E-mails schrijven" },
      { text: "Hobby's" },
      { text: "Studie" },
      { text: "Anders", other: true },
    ],
  },

  // ── 2. Houding ten opzichte van AI ──
  {
    id: "attitude",
    dim: "houding",
    type: "single",
    q: "Hoe kijk je naar AI?",
    sub: "Wat is je eerste gevoel als je aan AI denkt?",
    opts: [
      { text: "Heel positief", score: 4 },
      { text: "Overwegend positief", score: 3 },
      { text: "Neutraal", score: 2 },
      { text: "Eerder negatief", score: 1 },
      { text: "Erg negatief", score: 1 },
    ],
  },
  {
    id: "work_impact",
    dim: "houding",
    type: "single",
    q: "Denk je dat AI invloed gaat hebben op jouw werk?",
    sub: "Op korte of langere termijn.",
    opts: [
      { text: "Ja, veel", score: 4 },
      { text: "Een beetje", score: 3 },
      { text: "Nauwelijks", score: 2 },
      { text: "Helemaal niet", score: 1 },
    ],
  },
  {
    id: "job_fear",
    dim: "houding",
    type: "single",
    q: "Ben je bang dat AI jouw baan deels of helemaal overneemt?",
    sub: "Wees eerlijk — dit helpt om gerichte ondersteuning te bieden.",
    opts: [
      { text: "Ja", score: 1 },
      { text: "Misschien", score: 2 },
      { text: "Nee", score: 4 },
    ],
  },
  {
    id: "learn_more",
    dim: "houding",
    type: "single",
    q: "Zou je graag meer over AI willen leren?",
    sub: "Bijvoorbeeld via workshops, tips of praktische voorbeelden.",
    opts: [
      { text: "Ja", score: 4 },
      { text: "Misschien", score: 3 },
      { text: "Nee", score: 1 },
    ],
  },

  // ── 3. De organisatie ──
  {
    id: "org_policy",
    dim: "organisatie",
    type: "single",
    q: "Heeft jouw organisatie afspraken gemaakt over het gebruik van AI?",
    sub: "Denk aan richtlijnen, policies of interne afspraken.",
    opts: [
      { text: "Ja", score: 4 },
      { text: "Nee", score: 2 },
      { text: "Weet ik niet", score: 1 },
    ],
  },
  {
    id: "org_owner",
    dim: "organisatie",
    type: "single",
    q: "Is er iemand verantwoordelijk voor AI binnen de organisatie?",
    sub: "Een aanspreekpunt, werkgroep of formele rol.",
    opts: [
      { text: "Ja", score: 4 },
      { text: "Nee", score: 2 },
      { text: "Weet ik niet", score: 1 },
    ],
  },
  {
    id: "org_stimulate",
    dim: "organisatie",
    type: "single",
    q: "Wordt AI binnen jouw organisatie actief gestimuleerd?",
    sub: "Via training, tools, of aanmoediging van leidinggevenden.",
    opts: [
      { text: "Ja", score: 4 },
      { text: "Een beetje", score: 3 },
      { text: "Nee", score: 1 },
      { text: "Weet ik niet", score: 1 },
    ],
  },
  {
    id: "org_knowledge",
    dim: "organisatie",
    type: "single",
    q: "Hoe schat jij de AI-kennis binnen jouw organisatie in?",
    sub: "Het algemene niveau onder collega’s.",
    opts: [
      { text: "Erg hoog", score: 4 },
      { text: "Redelijk", score: 3 },
      { text: "Gemiddeld", score: 2 },
      { text: "Beperkt", score: 1 },
      { text: "Heel laag", score: 1 },
    ],
  },
];

const AI_FACTS = [
  "Wist je dat 78% van de medewerkers AI al privé gebruikt, maar dit op het werk niet durft te vertellen?",
  "Wist je dat organisaties met duidelijke AI-afspraken tot 2× sneller van experiment naar resultaat gaan?",
  "Wist je dat de meeste mensen AI vooral inzetten om te schrijven — terwijl brainstormen vaak de grootste tijdwinst oplevert?",
];

const DEPENDENT_IDS = {
  use_ai: ["tools", "free_at_work", "use_cases"],
  private_ai: ["home_use"],
};

function multiScore(count) {
  if (count <= 0) return 0;
  if (count === 1) return 2;
  if (count === 2) return 3;
  return 4;
}

function getVisibleQuestions(answers) {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

function levelFromPct(p) {
  if (p <= 35) return "Laag";
  if (p <= 55) return "Basis";
  if (p <= 75) return "Stevig";
  return "Sterk";
}

function profileFromPct(p) {
  if (p <= 35) {
    return {
      label: "Starter",
      sub: "AI voelt nog nieuw. Dat is een prima startpunt — met kleine, veilige stappen groeit het snel.",
    };
  }
  if (p <= 55) {
    return {
      label: "Ontdekker",
      sub: "Je hebt al een eerste beeld. De volgende stap is bewustere inzet op het werk, met duidelijke kaders.",
    };
  }
  if (p <= 75) {
    return {
      label: "Gevorderd",
      sub: "Sterke basis in ervaring, houding of organisatie. Nu is het tijd om de zwakkere dimensie bij te trekken.",
    };
  }
  return {
    label: "Voorloper",
    sub: "Je staat ver. Focus op verdieping: veilig gebruik, prompts, processen en kansen per afdeling.",
  };
}

/** Berekent scores: per dimensie een %, overall = gemiddelde van de 3 dimensies. */
function computeResults(answers) {
  const visibleQs = getVisibleQuestions(answers);
  const dimScores = {};
  const dimMax = {};

  visibleQs.forEach((q) => {
    const a = answers[q.id];
    if (!a) return;
    dimScores[q.dim] = (dimScores[q.dim] || 0) + (a.score || 0);
    dimMax[q.dim] = (dimMax[q.dim] || 0) + 4;
  });

  const dimKeys = Object.keys(DIMENSIONS);
  const dimPct = {};
  const dimLevel = {};

  dimKeys.forEach((k) => {
    const score = dimScores[k] || 0;
    const max = dimMax[k] || 0;
    // Geen antwoorden in deze dimensie → 0%
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    dimScores[k] = score;
    dimMax[k] = max || 4;
    dimPct[k] = pct;
    dimLevel[k] = levelFromPct(pct);
  });

  // Overall = gemiddelde van de drie dimensies (gelijke weging)
  const pct = Math.round(
    dimKeys.reduce((sum, k) => sum + dimPct[k], 0) / dimKeys.length,
  );
  const profile = profileFromPct(pct);

  return {
    dimScores,
    dimMax,
    dimPct,
    dimLevel,
    pct,
    overallLabel: profile.label,
    overallSub: profile.sub,
  };
}

/** Bouwt de stappenlijst: vragen + AI-fact na elke 5 vragen. */
function buildSteps(answers) {
  const qs = getVisibleQuestions(answers);
  const steps = [];
  let factIdx = 0;
  qs.forEach((q, i) => {
    steps.push({ type: "question", q });
    const qNum = i + 1;
    if (qNum % 5 === 0 && i < qs.length - 1 && factIdx < AI_FACTS.length) {
      steps.push({ type: "fact", text: AI_FACTS[factIdx], id: `fact_${factIdx}` });
      factIdx += 1;
    }
  });
  return steps;
}

function BaindLogo({ height = 28 }) {
  return (
    <img src={baindLogoWit} alt="Baind" style={{ height, width: "auto", display: "block" }} />
  );
}

function ArrowIcon({ size = 16, color = "currentColor" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <path
        d="M3 8h9m0 0L8 4m4 4L8 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProgressDots({ current, total }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 24 : 8,
          height: 8,
          borderRadius: 100,
          background: i < current ? C.accent : i === current ? C.accent : C.divider,
          opacity: i < current ? 0.4 : 1,
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        }} />
      ))}
    </div>
  );
}

function Ring({ pct, color, size = 100, strokeWidth = 4, children }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.divider} strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

function getAdvice(dimPct) {
  const out = [];
  const k = (dimPct.kennismaking || 0) / 100;
  if (k <= 0.4) {
    out.push({
      dim: "kennismaking",
      prio: "hoog",
      text: "AI voelt nog nieuw. Dat is een prima startpunt: met een paar concrete, veilige use cases wordt de drempel snel lager.",
      cta: "Baind helpt teams om laagdrempelig te starten met AI die past bij hun werk.",
    });
  } else if (k <= 0.7) {
    out.push({
      dim: "kennismaking",
      prio: "middel",
      text: "Je hebt al ervaring met AI. De volgende stap is om die ervaring bewuster en consistenter in te zetten op het werk.",
      cta: "Baind vertaalt losse experimenten naar praktische werkwijzen voor het hele team.",
    });
  } else {
    out.push({
      dim: "kennismaking",
      prio: "laag",
      text: "Sterke kennismaking met AI. Je bent klaar om dieper te gaan: veilig gebruik, prompts en processen.",
      cta: "Met Baind zet je ervaring om in structurele AI-vaardigheden in de organisatie.",
    });
  }

  const h = (dimPct.houding || 0) / 100;
  if (h <= 0.4) {
    out.push({
      dim: "houding",
      prio: "hoog",
      text: "Er is terughoudendheid of onzekerheid over AI. Ruimte voor vragen en duidelijke kaders helpt om vertrouwen op te bouwen.",
      cta: "Baind begeleidt gesprekken over kansen én zorgen, zodat adoptie veilig voelt.",
    });
  } else if (h <= 0.7) {
    out.push({
      dim: "houding",
      prio: "middel",
      text: "Je houding is open genoeg om verder te groeien. Gerichte leerervaringen maken het verschil tussen ‘interessant’ en ‘ik gebruik het echt’.",
      cta: "Baind biedt workshops die aansluiten bij jouw rol en leerstijl.",
    });
  } else {
    out.push({
      dim: "houding",
      prio: "laag",
      text: "Positieve houding en leergierigheid — een sterke basis voor AI-adoptie in jouw team.",
      cta: "Baind helpt die energie te kanaliseren naar concrete toepassingen.",
    });
  }

  const o = (dimPct.organisatie || 0) / 100;
  if (o <= 0.4) {
    out.push({
      dim: "organisatie",
      prio: "hoog",
      text: "AI leeft waarschijnlijk vooral bij individuen. Zonder afspraken en eigenaarschap blijft adoptie versnipperd en risicovol.",
      cta: "Baind helpt organisaties om AI-beleid, rollen en stimulerende kaders neer te zetten.",
    });
  } else if (o <= 0.7) {
    out.push({
      dim: "organisatie",
      prio: "middel",
      text: "Er is al iets van structuur, maar nog geen volledige duidelijkheid. Meer zichtbaarheid en stimulans versnellen het tempo.",
      cta: "Baind scherpt AI-governance en interne activatie aan — zonder zware bureaucratie.",
    });
  } else {
    out.push({
      dim: "organisatie",
      prio: "laag",
      text: "Jullie organisatie lijkt AI serieus te nemen. Tijd om kennis, tools en processen verder te professionaliseren.",
      cta: "Met Baind til je bestaande AI-afspraken naar een volgend niveau.",
    });
  }

  return out;
}

export default function QuickScan() {
  const [phase, setPhase] = useState("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [draftMulti, setDraftMulti] = useState([]);
  const [draftOther, setDraftOther] = useState("");
  const [sliding, setSliding] = useState(false);
  const [contact, setContact] = useState({ naam: "", bedrijf: "", email: "", telefoon: "" });
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reportPdfUrl, setReportPdfUrl] = useState(null);
  const [reportPdfFileName, setReportPdfFileName] = useState(null);

  const steps = useMemo(() => buildSteps(answers), [answers]);
  const step = steps[stepIdx] || steps[0];
  const questionSteps = steps.filter((s) => s.type === "question");
  const questionNumber = step?.type === "question"
    ? questionSteps.findIndex((s) => s.q.id === step.q.id) + 1
    : questionSteps.length;

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&family=JetBrains+Mono:wght@400;500;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  // Sync multi-draft when landing on a multi question
  useEffect(() => {
    if (phase !== "scan" || !step || step.type !== "question" || step.q.type !== "multi") return;
    const existing = answers[step.q.id];
    setDraftMulti(existing?.values || []);
    setDraftOther(existing?.other || "");
  }, [phase, stepIdx, step?.type, step?.q?.id]);

  const advanceFrom = (nextAnswers) => {
    const nextSteps = buildSteps(nextAnswers);
    setSliding(true);
    setTimeout(() => {
      if (stepIdx < nextSteps.length - 1) {
        // Stay on same logical position when flow shrinks; advance by 1 in new flow
        const currentId = steps[stepIdx]?.type === "question"
          ? steps[stepIdx].q.id
          : steps[stepIdx]?.id;
        let nextIndex = stepIdx + 1;
        // If current step still exists, find it and go to the next
        const curPos = nextSteps.findIndex((s) =>
          s.type === "question" ? s.q.id === currentId : s.id === currentId,
        );
        if (curPos >= 0) nextIndex = curPos + 1;
        if (nextIndex >= nextSteps.length) setPhase("contact");
        else setStepIdx(nextIndex);
      } else {
        setPhase("contact");
      }
      setSliding(false);
    }, 280);
  };

  const pickSingle = (q, opt) => {
    if (sliding) return;
    let next = { ...answers };
    if (DEPENDENT_IDS[q.id]) {
      for (const id of DEPENDENT_IDS[q.id]) delete next[id];
    }
    next[q.id] = { type: "single", value: opt.text, score: opt.score };
    setAnswers(next);
    advanceFrom(next);
  };

  const toggleMulti = (optText) => {
    setDraftMulti((prev) =>
      prev.includes(optText) ? prev.filter((t) => t !== optText) : [...prev, optText],
    );
  };

  const confirmMulti = (q) => {
    if (sliding || draftMulti.length === 0) return;
    const otherOpt = q.opts.find((o) => o.other);
    if (otherOpt && draftMulti.includes(otherOpt.text) && !draftOther.trim()) return;
    const next = {
      ...answers,
      [q.id]: {
        type: "multi",
        values: draftMulti,
        other: draftOther.trim(),
        score: multiScore(draftMulti.length),
      },
    };
    setAnswers(next);
    advanceFrom(next);
  };

  const continueFact = () => {
    if (sliding) return;
    setSliding(true);
    setTimeout(() => {
      if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
      else setPhase("contact");
      setSliding(false);
    }, 280);
  };

  useEffect(() => {
    if (phase !== "scan") return;
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!step) return;
      if (step.type === "fact") {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          continueFact();
        }
        return;
      }
      const q = step.q;
      if (q.type === "multi") {
        if (e.key === "Enter") {
          e.preventDefault();
          confirmMulti(q);
        }
        return;
      }
      const key = e.key.toLowerCase();
      const idx = key.charCodeAt(0) - 97;
      if (idx >= 0 && idx < q.opts.length) {
        e.preventDefault();
        pickSingle(q, q.opts[idx]);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, stepIdx, sliding, step, draftMulti, draftOther, answers]);

  const goBack = () => {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  };

  const {
    dimScores,
    dimMax,
    dimPct,
    dimLevel,
    pct,
    overallLabel,
    overallSub,
  } = computeResults(answers);

  const goToResult = () => {
    setPhase("result");
    setRevealed(true);
  };

  /**
   * Bedankt laden zonder focus te stelen.
   * Chrome opent window.open() altijd als zichtbaar tabblad op de voorgrond
   * (ook met off-screen features) — daarom géén window.open.
   */
  const openBedanktTab = () => {
    const existing = document.getElementById("baind-bedankt-frame");
    if (existing) existing.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "baind-bedankt-frame";
    iframe.src = BEDANKT_URL;
    iframe.title = "Bedankt";
    iframe.setAttribute("aria-hidden", "true");
    iframe.setAttribute("tabindex", "-1");
    Object.assign(iframe.style, {
      position: "fixed",
      width: "0",
      height: "0",
      border: "0",
      opacity: "0",
      pointerEvents: "none",
      left: "-9999px",
      top: "0",
    });
    document.body.appendChild(iframe);

    // Extra hit voor tracking / pageview
    try {
      navigator.sendBeacon?.(BEDANKT_URL);
    } catch {
      /* ignore */
    }
  };

  const submitWithContact = async () => {
    const naam = contact.naam.trim();
    const bedrijf = contact.bedrijf.trim();
    const email = contact.email.trim();
    const telefoon = contact.telefoon.trim();
    if (!naam || !bedrijf || !email) {
      setSubmitError("Vul naam, bedrijfsnaam en e-mailadres in.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitError("Vul een geldig e-mailadres in.");
      return;
    }
    const wantPdfDownload = Boolean(naam && bedrijf && email && telefoon);
    setSubmitError("");
    setReportPdfUrl(null);
    setReportPdfFileName(null);

    // Scores tonen in dit tabblad — geen window.open (Chrome steelt anders de focus)
    flushSync(() => {
      setSubmitting(true);
      goToResult();
    });

    openBedanktTab();

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wantPdfDownload,
          contact: { naam, bedrijf, email, telefoon },
          answers,
          dimScores,
          dimMax,
          dimPct,
          dimLevel,
          pct,
          overallLabel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setReportPdfUrl(typeof data.reportUrl === "string" ? data.reportUrl : null);
        setReportPdfFileName(
          typeof data.reportUrl === "string" && typeof data.reportFileName === "string"
            ? data.reportFileName
            : null,
        );
      }
    } catch {
      // Lokaal / API niet beschikbaar — resultaat blijft zichtbaar zonder PDF
    }

    setSubmitting(false);
  };

  const wrap = {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at 50% 70%, #1D786F 0%, #14514A 36%, rgba(10,40,38,0) 72%), linear-gradient(180deg, #0A2826 0%, #114640 55%, #18615A 100%)`,
    color: C.white,
    fontFamily: FONT,
    display: "flex",
    justifyContent: "center",
    padding: "0 20px",
    WebkitFontSmoothing: "antialiased",
  };

  const inner = { width: "100%", maxWidth: 580, padding: "48px 0 64px" };

  // INTRO
  if (phase === "intro") {
    return (
      <div style={wrap}>
        <div style={{ ...inner, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "92vh", textAlign: "center" }}>
          <div style={{
            marginTop: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <BaindLogo height={28} />
            <div style={{
              padding: "6px 16px",
              borderRadius: 100,
              background: C.accentDim,
              fontSize: 12,
              fontWeight: 600,
              color: C.accent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontFamily: MONO,
            }}>
              Quickscan
            </div>
          </div>

          <h1 style={{
            marginTop: 28,
            fontSize: `clamp(40px, 8vw, ${tokens.fontSize.h1}px)`,
            fontWeight: 400,
            lineHeight: 1,
            letterSpacing: tokens.letterSpacing.h1,
          }}>
            Hoe staat jouw<br />
            <span style={{ color: C.accent }}>team tegenover AI?</span>
          </h1>

          <p style={{
            marginTop: tokens.space[3] + 4,
            fontSize: tokens.fontSize.textMain - 3,
            lineHeight: 1.65,
            color: C.muted,
            maxWidth: 420,
          }}>
            Een korte, laagdrempelige scan over ervaring, houding en jullie organisatie. Geen technische kennis nodig.
          </p>

          <button
            onClick={() => { setPhase("scan"); setStepIdx(0); }}
            style={{
              ...buttonPrimaryStyle(),
              marginTop: 44,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={hoverPrimaryOn}
            onMouseLeave={hoverPrimaryOff}
          >
            Start de scan
            <ArrowIcon size={16} />
          </button>

          <div style={{ marginTop: 56, display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {Object.values(DIMENSIONS).map((d) => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.subtle }}>
                <span style={{ color: d.color, fontSize: 14, display: "inline-flex", alignItems: "center" }}><DimIcon dim={d} size={14} /></span>
                {d.label}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 52, fontSize: 12, color: C.subtle, fontFamily: MONO }}>
            ± 3 minuten · 3 dimensies · direct inzicht
          </p>
        </div>
      </div>
    );
  }

  // SCAN
  if (phase === "scan" && step) {
    // FACT interstitial
    if (step.type === "fact") {
      return (
        <div style={wrap}>
          <div style={{ ...inner, display: "flex", flexDirection: "column", justifyContent: "center", minHeight: "88vh" }}>
            <div style={{
              display: "flex", width: "fit-content", padding: "6px 16px", borderRadius: 100,
              background: C.accentDim, fontSize: 12, fontWeight: 600,
              color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO,
            }}>
              Wist je dat…
            </div>

            <div style={{
              marginTop: 36,
              opacity: sliding ? 0 : 1,
              transform: sliding ? "translateX(24px)" : "translateX(0)",
              transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
            }}>
              <p style={{
                fontSize: `clamp(22px, 4.5vw, ${tokens.fontSize.h3}px)`,
                fontWeight: 400,
                lineHeight: 1.35,
                letterSpacing: tokens.letterSpacing.h3,
                margin: 0,
                color: C.white,
              }}>
                {step.text}
              </p>
            </div>

            <button
              onClick={continueFact}
              style={{
                ...buttonPrimaryStyle(),
                marginTop: 48,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                alignSelf: "flex-start",
              }}
              onMouseEnter={hoverPrimaryOn}
              onMouseLeave={hoverPrimaryOff}
            >
              Verder
              <ArrowIcon size={16} />
            </button>

            {stepIdx > 0 && (
              <button onClick={goBack} style={{
                marginTop: 20, background: "none", border: "none",
                color: C.subtle, fontSize: 13, cursor: "pointer", fontFamily: FONT, padding: "8px 0",
                alignSelf: "flex-start",
              }}>
                Vorige
              </button>
            )}
          </div>
        </div>
      );
    }

    const q = step.q;
    const dim = DIMENSIONS[q.dim];
    const isMulti = q.type === "multi";
    const otherOpt = q.opts.find((o) => o.other);
    const otherSelected = otherOpt && draftMulti.includes(otherOpt.text);
    const multiReady = draftMulti.length > 0 && !(otherSelected && !draftOther.trim());

    return (
      <div style={wrap}>
        <div style={inner}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              fontSize: 12, fontWeight: 600, color: dim.color,
              fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.1em",
            }}>
              <span style={{ fontSize: 14, display: "inline-flex", alignItems: "center" }}><DimIcon dim={dim} size={14} /></span>
              {dim.label}
            </div>
            <div style={{ fontSize: 13, color: C.subtle, fontFamily: MONO }}>
              {questionNumber}/{questionSteps.length}
            </div>
          </div>

          <ProgressDots current={stepIdx} total={steps.length} />

          <div style={{
            marginTop: 40,
            opacity: sliding ? 0 : 1,
            transform: sliding ? "translateX(24px)" : "translateX(0)",
            transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <h2 style={{
              fontSize: `clamp(22px, 4.5vw, ${tokens.fontSize.h3}px)`,
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: tokens.letterSpacing.h3,
              margin: `0 0 ${tokens.space[1]}px 0`,
            }}>
              {q.q}
            </h2>
            <p style={{
              fontSize: tokens.fontSize.textSmall - 2,
              color: C.subtle,
              margin: `0 0 ${tokens.space[5]}px 0`,
              lineHeight: 1.55,
            }}>
              {q.sub}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {q.opts.map((opt, i) => {
                const sel = isMulti
                  ? draftMulti.includes(opt.text)
                  : answers[q.id]?.value === opt.text;
                return (
                  <button
                    key={opt.text}
                    type="button"
                    onClick={() => {
                      if (isMulti) toggleMulti(opt.text);
                      else pickSingle(q, opt);
                    }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      background: sel ? C.accentDim : C.card,
                      border: `${tokens.borderWidth.main}px solid ${sel ? "rgba(255,191,0,0.5)" : C.border}`,
                      borderRadius: tokens.radius.main,
                      padding: `${tokens.space[3]}px ${tokens.space[3] + 2}px`,
                      textAlign: "left",
                      color: sel ? C.accent : C.white,
                      fontSize: 15,
                      lineHeight: 1.45,
                      cursor: "pointer",
                      fontFamily: FONT,
                      transition: "all 0.18s ease",
                    }}
                    onMouseEnter={(e) => { if (!sel) { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = C.cardHover; } }}
                    onMouseLeave={(e) => { if (!sel) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; } }}
                  >
                    <span style={{
                      minWidth: 30, height: 30, borderRadius: tokens.radius.small,
                      background: sel ? C.accent : C.divider,
                      color: sel ? C.bg : C.subtle,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, fontFamily: MONO,
                      transition: "all 0.18s ease",
                    }}>
                      {isMulti ? (sel ? "✓" : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>

            {isMulti && otherSelected && (
              <input
                type="text"
                placeholder="Namelijk…"
                value={draftOther}
                onChange={(e) => setDraftOther(e.target.value)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  boxSizing: "border-box",
                  background: C.card,
                  border: `${tokens.borderWidth.main}px solid ${C.border}`,
                  borderRadius: tokens.radius.main,
                  padding: "14px 18px",
                  fontSize: 15,
                  color: C.white,
                  fontFamily: FONT,
                  outline: "none",
                }}
                onFocus={(e) => { e.target.style.borderColor = C.teal; }}
                onBlur={(e) => { e.target.style.borderColor = C.border; }}
              />
            )}

            {isMulti && (
              <button
                type="button"
                disabled={!multiReady}
                onClick={() => confirmMulti(q)}
                style={{
                  ...buttonPrimaryStyle(),
                  marginTop: 24,
                  cursor: multiReady ? "pointer" : "not-allowed",
                  opacity: multiReady ? 1 : 0.45,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={(e) => { if (multiReady) hoverPrimaryOn(e); }}
                onMouseLeave={(e) => { if (multiReady) hoverPrimaryOff(e); }}
              >
                Volgende
                <ArrowIcon size={16} />
              </button>
            )}
          </div>

          {stepIdx > 0 && (
            <button onClick={goBack} style={{
              marginTop: 20, background: "none", border: "none",
              color: C.subtle, fontSize: 13, cursor: "pointer", fontFamily: FONT, padding: "8px 0",
            }}>
              Vorige vraag
            </button>
          )}
        </div>
      </div>
    );
  }

  // CONTACT
  if (phase === "contact") {
    return (
      <div style={wrap}>
        <div style={{ ...inner, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "88vh" }}>
          <div style={{
            display: "flex", width: "fit-content", padding: "6px 16px", borderRadius: 100,
            background: C.accentDim, fontSize: 12, fontWeight: 600,
            color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO,
          }}>Bijna klaar</div>

          <h2 style={{
            marginTop: 24,
            fontSize: `clamp(32px, 6vw, ${tokens.fontSize.h2}px)`,
            fontWeight: 400,
            textAlign: "center",
            letterSpacing: tokens.letterSpacing.h2,
            lineHeight: 1.2,
          }}>
            Nog een stap naar<br />jullie resultaat
          </h2>

          <p style={{
            marginTop: 14, fontSize: 15, color: C.muted, textAlign: "center", maxWidth: 380, lineHeight: 1.6,
          }}>
            Laat je gegevens achter om je persoonlijke resultaat te bekijken.
          </p>
          <div style={{
            marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <p style={{ fontSize: 12, color: C.subtle, textAlign: "center", maxWidth: 360, lineHeight: 1.5, margin: 0 }}>
              Vul alle velden in om je PDF-rapport te ontvangen.
            </p>
            <span
              style={{
                position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 18, height: 18, borderRadius: "50%", border: `1.5px solid ${C.subtle}`,
                fontSize: 11, fontWeight: 700, color: C.subtle, cursor: "default", flexShrink: 0,
                fontFamily: MONO,
              }}
              onMouseEnter={(e) => { e.currentTarget.querySelector("[data-tip]").style.opacity = 1; e.currentTarget.querySelector("[data-tip]").style.pointerEvents = "auto"; }}
              onMouseLeave={(e) => { e.currentTarget.querySelector("[data-tip]").style.opacity = 0; e.currentTarget.querySelector("[data-tip]").style.pointerEvents = "none"; }}
            >
              i
              <span
                data-tip=""
                style={{
                  position: "absolute", bottom: "calc(100% + 10px)", left: "50%", transform: "translateX(-50%)",
                  width: 280, padding: "14px 16px", borderRadius: 16,
                  background: C.card, border: `1.5px solid ${C.border}`,
                  fontSize: 12, fontWeight: 400, color: C.muted, lineHeight: 1.55, textAlign: "left",
                  fontFamily: FONT,
                  opacity: 0, pointerEvents: "none",
                  transition: "opacity 0.2s ease",
                  zIndex: 10,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
                }}
              >
                Met versturen ga je akkoord dat we je gegevens gebruiken om contact met je op te nemen over je resultaat. Je rapport wordt maximaal 90 dagen bewaard, daarna wordt het automatisch verwijderd. We verwerken je gegevens conform de AVG.
              </span>
            </span>
          </div>

          <div style={{ width: "100%", maxWidth: 380, marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { k: "naam", ph: "Naam" },
              { k: "bedrijf", ph: "Bedrijfsnaam" },
              { k: "email", ph: "E-mailadres", type: "email" },
              { k: "telefoon", ph: "Telefoonnummer" },
            ].map((f) => (
              <input
                key={f.k}
                type={f.type || "text"}
                placeholder={f.ph}
                value={contact[f.k]}
                onChange={(e) => setContact((p) => ({ ...p, [f.k]: e.target.value }))}
                style={{
                  background: C.card,
                  border: `${tokens.borderWidth.main}px solid ${C.border}`,
                  borderRadius: tokens.radius.main,
                  padding: "15px 18px",
                  fontSize: 15,
                  color: C.white,
                  fontFamily: FONT,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => { e.target.style.borderColor = C.teal; }}
                onBlur={(e) => { e.target.style.borderColor = C.border; }}
              />
            ))}

            {submitError ? (
              <p style={{ fontSize: 13, color: C.red, margin: 0, lineHeight: 1.45 }} role="alert">
                {submitError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={submitting}
              onClick={submitWithContact}
              style={{
                ...buttonPrimaryStyle({ submitting }),
                marginTop: tokens.space[1],
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.85 : 1,
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}
              onMouseEnter={(e) => { if (!submitting) hoverPrimaryOn(e); }}
              onMouseLeave={(e) => { if (!submitting) hoverPrimaryOff(e); }}
            >
              {submitting ? "Rapport aanmaken…" : "Bekijk mijn resultaat"}
              {!submitting ? <ArrowIcon size={16} /> : null}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RESULT
  const advice = getAdvice(dimPct);
  const prioColor = { hoog: C.red, middel: C.orange, laag: C.green };
  const prioBg = { hoog: C.dimRed, middel: C.dimOrange, laag: C.dimGreen };

  return (
    <div style={wrap}>
      <div style={{
        ...inner,
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 48, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BaindLogo height={24} />
            <div style={{
              padding: "6px 16px", borderRadius: 100,
              background: C.accentDim, fontSize: 12, fontWeight: 600,
              color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO,
            }}>Jouw AI-beeld</div>
          </div>

          <h2 style={{
            marginTop: 24,
            fontSize: `clamp(32px, 6vw, ${tokens.fontSize.h2}px)`,
            fontWeight: 400,
            letterSpacing: tokens.letterSpacing.h2,
            lineHeight: 1.2,
          }}>
            <span style={{ color: C.accent }}>{pct}%</span>
          </h2>
          <p style={{
            marginTop: 8, fontSize: 18, color: C.white, margin: "8px 0 0 0",
          }}>
            AI-beeldscore
          </p>
          <div style={{
            marginTop: 14, display: "flex", width: "fit-content", margin: "14px auto 0", padding: "6px 18px", borderRadius: 100,
            background: C.card, border: `1px solid ${C.border}`,
            fontSize: 13, fontWeight: 600, color: C.white, fontFamily: MONO,
          }}>
            Profiel: {overallLabel}
          </div>
          <p style={{ marginTop: 16, fontSize: 15, color: C.muted, maxWidth: 400, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            {overallSub}
          </p>

          {reportPdfUrl ? (
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p style={{ fontSize: 15, color: C.muted, margin: "0 0 18px 0", lineHeight: 1.5 }}>
                Download hier je persoonlijke rapport.
              </p>
              <a
                href={`/api/download?url=${encodeURIComponent(reportPdfUrl)}&filename=${encodeURIComponent(reportPdfFileName || "BAIND-quickscan-rapport.pdf")}`}
                download={reportPdfFileName || "BAIND-quickscan-rapport.pdf"}
                style={{
                  ...buttonPrimaryStyle(),
                  padding: "12px 22px 12px 26px",
                  fontSize: 15,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
                onMouseEnter={hoverPrimaryOn}
                onMouseLeave={hoverPrimaryOff}
              >
                Download PDF-rapport
                <ArrowIcon size={15} />
              </a>
            </div>
          ) : null}
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 44px)",
          marginBottom: 52, flexWrap: "wrap",
        }}>
          {Object.entries(DIMENSIONS).map(([key, dim]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 110 }}>
              <Ring pct={(dimPct[key] || 0) / 100} color={dim.color} size={100} strokeWidth={4}>
                <span style={{ fontSize: 22, fontWeight: 500, color: dim.color, fontFamily: FONT }}>
                  {dimPct[key] || 0}%
                </span>
              </Ring>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <DimIcon dim={dim} size={12} /> {dim.label}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, color: dim.color,
                background: dim.dimColor, padding: "3px 10px", borderRadius: 100, fontFamily: MONO,
              }}>
                {dimLevel[key]}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
          {advice.map((a, i) => {
            const dim = DIMENSIONS[a.dim];
            return (
              <div key={i} style={{
                background: C.card,
                borderRadius: tokens.radius.main,
                padding: "28px 30px",
                border: `${tokens.borderWidth.main}px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 7,
                    fontSize: 12, fontWeight: 600, color: dim.color,
                    fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    <DimIcon dim={dim} size={12} /> {dim.label}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                    letterSpacing: "0.1em", color: prioColor[a.prio],
                    background: prioBg[a.prio], padding: "4px 12px", borderRadius: 100, fontFamily: MONO,
                  }}>
                    Prioriteit: {a.prio}
                  </span>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, margin: "0 0 14px 0" }}>
                  {a.text}
                </p>
                <p style={{ fontSize: 14, color: C.accent, margin: 0, fontWeight: 500 }}>
                  {a.cta}
                </p>
              </div>
            );
          })}
        </div>

        <div style={{
          background: C.card,
          borderRadius: tokens.radius.main,
          padding: "24px 28px",
          marginBottom: 32,
          border: `1px dashed ${C.border}`,
        }}>
          <p style={{
            fontSize: 12, fontWeight: 600, color: C.accent, fontFamily: MONO,
            letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 10px 0",
          }}>
            Later vervolg
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: C.muted, margin: 0 }}>
            In een volgende scan gaan we dieper in op kennisniveau, veilig gebruik, privacy, prompts, automatisering, AI-beleid, processen en kansen per afdeling.
          </p>
        </div>

        <div style={{
          background: C.cream,
          borderRadius: tokens.radius.main,
          padding: "48px 40px",
          marginBottom: tokens.space[6],
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}>
          <h3 style={{
            fontSize: `clamp(24px, 4vw, ${tokens.fontSize.h3}px)`,
            fontWeight: 400,
            margin: "0 0 14px 0",
            letterSpacing: tokens.letterSpacing.h3,
            lineHeight: 1.2,
            color: C.creamText,
          }}>
            Klaar om AI écht aan<br />het werk te zetten?
          </h3>
          <p style={{
            fontSize: 15,
            color: C.creamMuted,
            margin: "0 0 28px 0",
            maxWidth: 440,
            lineHeight: 1.65,
          }}>
            Wij helpen organisaties om AI in te zetten op een manier die past bij wie ze zijn. Plan een gesprek en ontdek wat dat voor jullie team kan betekenen.
          </p>
          <a
            href={`mailto:hai@baind.nl?subject=${encodeURIComponent("Resultaten Quickscan")}&body=${encodeURIComponent(`Hoi Baind,\n\nIk heb de Quickscan ingevuld.\nAI-beeldscore: ${pct}% (profiel: ${overallLabel}).\nKennismaking: ${dimPct.kennismaking}% · Houding: ${dimPct.houding}% · Organisatie: ${dimPct.organisatie}%\n\nIk zou graag een gesprek plannen om de resultaten te bespreken.\n\nMet vriendelijke groet,\n${contact.naam || ""}\n${contact.bedrijf || ""}`)}`}
            style={{
              ...buttonPrimaryStyle(),
              padding: "13px 24px 13px 28px",
              fontSize: 15,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={hoverPrimaryOn}
            onMouseLeave={hoverPrimaryOff}
          >
            Plan een gesprek
            <ArrowIcon size={15} />
          </a>
        </div>

        <div style={{
          textAlign: "center", fontSize: 12, color: C.subtle,
          fontFamily: MONO, paddingBottom: 32,
          borderTop: `1px solid ${C.divider}`, paddingTop: 24,
        }}>
          Baind · Verbind jouw merk met AI
        </div>
      </div>
    </div>
  );
}
