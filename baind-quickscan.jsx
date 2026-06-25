import { useState, useEffect } from "react";
import consistentieIcon from "./consistentie-icon.png";
import baindLogoWit from "./baind-logo-wit.png";

/*
  BAIND QUICKSCAN  AI & Merkconsistentie
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
    display: "-0.0114em", // -1 / 88
    h1: "-0.047em",       // -3 / 64
    h2: "-0.0417em",      // -2 / 48
    h3: "-0.0313em",      // -1 / 32
    h4: "0",
  },
};

// Accent / state colors (kept outside the Figma token contract, used for the
// quickscan's advice/results visualisations).
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

// Reusable button style factory matching the Figma button/primary spec
// (bg/border/text swap on hover, 2px border, radius/main).
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

function RegisteredIcon({ size = 14 }) {
  const boxSize = Math.round(size * 1.25);
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: boxSize,
        height: boxSize,
        borderRadius: "50%",
        border: `1.5px solid currentColor`,
        fontFamily: FONT,
        fontSize: Math.round(boxSize * 0.7),
        fontWeight: 700,
        lineHeight: 1,
        color: "currentColor",
        flexShrink: 0,
        boxSizing: "border-box",
        paddingTop: 1,
      }}
    >
      R
    </span>
  );
}

const DIMENSIONS = {
  merkfundament: { label: "Merkfundament", IconComp: RegisteredIcon, color: C.accent, dimColor: C.accentDim },
  aiadoptie: { label: "AI-adoptie", icon: "\u26A1", color: C.teal, dimColor: C.dimGreen },
  consistentie: { label: "Consistentie", iconSrc: consistentieIcon, color: C.accent, dimColor: C.accentDim },
};

function DimIcon({ dim, size = 14 }) {
  if (dim.IconComp) {
    const IconComp = dim.IconComp;
    return <IconComp size={size} />;
  }
  if (dim.iconSrc) {
    const imgSize = size * 1.35;
    return <img src={dim.iconSrc} alt="" style={{
      width: imgSize, height: imgSize,
      filter: "brightness(0) saturate(100%) invert(75%) sepia(98%) saturate(1028%) hue-rotate(1deg) brightness(107%) contrast(104%)",
    }} />;
  }
  return <span style={{ fontSize: size }}>{dim.icon}</span>;
}

const QUESTIONS = [
  {
    id: 1, dim: "merkfundament",
    q: "Hoe goed is jullie merkidentiteit gedocumenteerd?",
    sub: "Denk aan tone of voice, brand guidelines, visuele identiteit, do's en don'ts.",
    opts: [
      { text: "We hebben geen vastgelegde merkrichtlijnen", score: 1 },
      { text: "Er zijn basisafspraken, maar niet alles staat op papier", score: 2 },
      { text: "We hebben uitgebreide brand guidelines die actueel zijn", score: 3 },
      { text: "Onze guidelines zijn levend en worden continu bijgewerkt", score: 4 },
    ],
  },
  {
    id: 2, dim: "merkfundament",
    q: "Hebben jullie een vastgelegde tone of voice?",
    sub: "Een beschrijving van hoe jullie merk klinkt in tekst en communicatie.",
    opts: [
      { text: "Nee, iedereen schrijft op eigen gevoel", score: 1 },
      { text: "Informeel afgesproken, maar niet op papier", score: 2 },
      { text: "Ja, gedocumenteerd en gedeeld met het team", score: 3 },
      { text: "Ja, inclusief voorbeelden en contra-voorbeelden", score: 4 },
    ],
  },
  {
    id: 3, dim: "merkfundament",
    q: "Hoe consistent is jullie communicatie over verschillende kanalen?",
    sub: "Van website en social media tot offertes en e-mails.",
    opts: [
      { text: "Elk kanaal heeft een eigen stijl, weinig samenhang", score: 1 },
      { text: "Redelijk consistent, maar het verschilt per medewerker", score: 2 },
      { text: "Grotendeels consistent dankzij duidelijke afspraken", score: 3 },
      { text: "Volledig consistent, ons merk is overal herkenbaar", score: 4 },
    ],
  },
  {
    id: 4, dim: "aiadoptie",
    q: "Hoe wordt AI momenteel ingezet voor communicatie en content?",
    sub: "Denk aan ChatGPT, Copilot, Gemini of andere AI-tools.",
    opts: [
      { text: "We gebruiken nog geen AI voor communicatie", score: 1 },
      { text: "Individuele medewerkers experimenteren op eigen initiatief", score: 2 },
      { text: "We gebruiken AI structureel voor bepaalde taken", score: 3 },
      { text: "AI is geïntegreerd in onze workflows met duidelijke richtlijnen", score: 4 },
    ],
  },
  {
    id: 5, dim: "aiadoptie",
    q: "Zijn AI-prompts afgestemd op jullie merkidentiteit?",
    sub: "Worden er prompts gebruikt die rekening houden met jullie tone of voice en merkwaarden?",
    opts: [
      { text: "Nee, we gebruiken standaard prompts", score: 1 },
      { text: "Soms, maar het is niet gestandaardiseerd", score: 2 },
      { text: "Ja, we hebben enkele merk-specifieke prompts", score: 3 },
      { text: "Ja, we hebben een volledig prompt-framework op merk", score: 4 },
    ],
  },
  {
    id: 6, dim: "consistentie",
    q: "Wie bewaakt de kwaliteit van AI-gegenereerde content?",
    sub: "Is er een review- of goedkeuringsproces?",
    opts: [
      { text: "Niemand, output gaat direct naar buiten", score: 1 },
      { text: "De maker checkt het zelf, maar zonder richtlijnen", score: 2 },
      { text: "Er is een reviewproces, maar niet specifiek voor AI-content", score: 3 },
      { text: "Er is een specifiek QA-proces voor AI-gegenereerde content", score: 4 },
    ],
  },
  {
    id: 7, dim: "consistentie",
    q: "Hoe herkenbaar is jullie merk in AI-gegenereerde teksten?",
    sub: "Zou een klant het verschil merken tussen AI-content en handgeschreven content?",
    opts: [
      { text: "AI-content is duidelijk robotachtig of generiek", score: 1 },
      { text: "Het is oké, maar mist onze unieke stem", score: 2 },
      { text: "Redelijk herkenbaar, maar nog niet perfect", score: 3 },
      { text: "Onze AI-content is niet te onderscheiden van handgeschreven", score: 4 },
    ],
  },
];

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
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.divider} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
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

function getAdvice(dimScores) {
  const out = [];
  const { merkfundament: mf = 0, aiadoptie: ai = 0, consistentie: co = 0 } = dimScores;

  if (mf <= 5) {
    out.push({ dim: "merkfundament", prio: "hoog", text: "Begin met het vastleggen van jullie merkidentiteit. Zonder een stevig fundament kan AI nooit consistent op-merk communiceren. Denk aan een tone of voice document, merkwaarden en communicatierichtlijnen.", cta: "Baind helpt jullie merkfundament te vertalen naar een AI-klare basis." });
  } else if (mf <= 9) {
    out.push({ dim: "merkfundament", prio: "middel", text: "Jullie merkbasis staat, maar kan aangescherpt worden voor AI-gebruik. Specifieke voorbeelden en contra-voorbeelden maken het verschil.", cta: "Baind's merkexperts helpen jullie guidelines AI-proof te maken." });
  } else {
    out.push({ dim: "merkfundament", prio: "laag", text: "Uitstekend merkfundament! Jullie zijn klaar om dit te vertalen naar een AI-omgeving die jullie merk versterkt.", cta: "Met Baind zetten jullie dit fundament om in een krachtige AI-omgeving." });
  }

  if (ai <= 3) {
    out.push({ dim: "aiadoptie", prio: "hoog", text: "Er liggen grote kansen om AI in te zetten voor communicatie. Start met concrete use cases en bouw van daaruit op.", cta: "Baind levert concrete toepassingen in de vorm van merk-specifieke prompts." });
  } else if (ai <= 6) {
    out.push({ dim: "aiadoptie", prio: "middel", text: "Goede start met AI! De volgende stap is om van losse experimenten naar een gestructureerde aanpak te gaan, afgestemd op jullie merk.", cta: "Baind helpt jullie AI-gebruik te structureren en op te schalen." });
  } else {
    out.push({ dim: "aiadoptie", prio: "laag", text: "Jullie AI-adoptie is ver gevorderd. Focus nu op het maximaal afstemmen van alle AI-output op jullie merkidentiteit.", cta: "Baind optimaliseert jullie bestaande AI-setup voor maximale merkconsistentie." });
  }

  if (co <= 3) {
    out.push({ dim: "consistentie", prio: "hoog", text: "De AI-output sluit nog niet goed aan bij jullie merk. Dit is het gebied waar de meeste winst te behalen is, en waar Baind het verschil maakt.", cta: "Baind traint AI specifiek op jullie merk, zodat output direct herkenbaar is." });
  } else if (co <= 6) {
    out.push({ dim: "consistentie", prio: "middel", text: "De basis is er, maar finetuning is nodig. Met de juiste prompts en training wordt jullie AI-content niet te onderscheiden van handgeschreven tekst.", cta: "Baind's merkexperts finetunen jullie AI voor perfecte merkconsistentie." });
  } else {
    out.push({ dim: "consistentie", prio: "laag", text: "Indrukwekkende consistentie! Jullie zijn een voorbeeld van hoe AI en merk samen kunnen gaan.", cta: "Met Baind schalen jullie dit op naar alle afdelingen en touchpoints." });
  }
  return out;
}

export default function QuickScan() {
  const [phase, setPhase] = useState("intro");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [sliding, setSliding] = useState(false);
  const [contact, setContact] = useState({ naam: "", bedrijf: "", email: "", telefoon: "" });
  const [revealed, setRevealed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [reportPdfUrl, setReportPdfUrl] = useState(null);
  const [reportPdfFileName, setReportPdfFileName] = useState(null);

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=Rethink+Sans:ital,wght@0,400..800;1,400..800&family=JetBrains+Mono:wght@400;500;700&display=swap";
    l.rel = "stylesheet";
    document.head.appendChild(l);
  }, []);

  const pick = (qId, score) => {
    if (sliding) return;
    setSliding(true);
    setAnswers(p => ({ ...p, [qId]: score }));
    setTimeout(() => {
      if (qIdx < QUESTIONS.length - 1) setQIdx(i => i + 1);
      else setPhase("contact");
      setSliding(false);
    }, 300);
  };

  useEffect(() => {
    if (phase !== "scan") return;
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      const key = e.key.toLowerCase();
      const idx = key.charCodeAt(0) - 97;
      const q = QUESTIONS[qIdx];
      if (idx >= 0 && idx < q.opts.length) {
        e.preventDefault();
        pick(q.id, q.opts[idx].score);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [phase, qIdx, sliding]);

  const goBack = () => { if (qIdx > 0) setQIdx(i => i - 1); };

  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxTotal = QUESTIONS.length * 4;
  const pct = Math.round((total / maxTotal) * 100);

  const dimScores = {};
  const dimMax = {};
  QUESTIONS.forEach(q => {
    dimScores[q.dim] = (dimScores[q.dim] || 0) + (answers[q.id] || 0);
    dimMax[q.dim] = (dimMax[q.dim] || 0) + 4;
  });

  const overallLabel = pct <= 35 ? "Starter" : pct <= 60 ? "Explorer" : pct <= 82 ? "Gevorderd" : "Expert";
  const overallSub = pct <= 35
    ? "Jullie staan aan het begin. Dat betekent volop ruimte om te groeien."
    : pct <= 60
    ? "Een goede basis is gelegd. De volgende stappen maken het verschil."
    : pct <= 82
    ? "Jullie zijn al goed op weg. Tijd om door te pakken."
    : "Sterke positie! Kleine optimalisaties kunnen nog meer impact maken.";

  const goToResult = () => {
    setPhase("result");
    setTimeout(() => setRevealed(true), 80);
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
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wantPdfDownload,
          contact: {
            naam,
            bedrijf,
            email,
            telefoon,
          },
          answers,
          dimScores,
          dimMax,
          pct,
          overallLabel,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Opslaan mislukt");
      setReportPdfUrl(typeof data.reportUrl === "string" ? data.reportUrl : null);
      setReportPdfFileName(
        typeof data.reportUrl === "string" && typeof data.reportFileName === "string"
          ? data.reportFileName
          : null,
      );
    } catch (err) {
      setReportPdfUrl(null);
      setReportPdfFileName(null);
      setSubmitError(err?.message || "Opslaan mislukt. Probeer het opnieuw.");
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    goToResult();
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
            Hoe AI-ready<br/>
            <span style={{ color: C.accent }}>is jouw merk?</span>
          </h1>

          <p style={{
            marginTop: tokens.space[3] + 4,
            fontSize: tokens.fontSize.textMain - 3,
            lineHeight: 1.65,
            color: C.muted,
            maxWidth: 420,
          }}>
            Ontdek in 2 minuten waar de grootste kansen liggen om AI in te zetten, zonder je merkidentiteit te verliezen.
          </p>

          <button
            onClick={() => setPhase("scan")}
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
            {Object.values(DIMENSIONS).map(d => (
              <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: C.subtle }}>
                <span style={{ color: d.color, fontSize: 14, display: "inline-flex", alignItems: "center" }}><DimIcon dim={d} size={14} /></span>
                {d.label}
              </div>
            ))}
          </div>

          <p style={{ marginTop: 52, fontSize: 12, color: C.subtle, fontFamily: MONO }}>
            7 vragen · 3 dimensies · direct resultaat
          </p>
        </div>
      </div>
    );
  }

  // SCAN
  if (phase === "scan") {
    const q = QUESTIONS[qIdx];
    const dim = DIMENSIONS[q.dim];

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
              {qIdx + 1}/{QUESTIONS.length}
            </div>
          </div>

          <ProgressDots current={qIdx} total={QUESTIONS.length} />

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
                const sel = answers[q.id] === opt.score;
                return (
                  <button
                    key={i}
                    onClick={() => pick(q.id, opt.score)}
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
                    onMouseEnter={e => { if (!sel) { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.background = C.cardHover; }}}
                    onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.card; }}}
                  >
                    <span style={{
                      minWidth: 30, height: 30, borderRadius: tokens.radius.small,
                      background: sel ? C.accent : C.divider,
                      color: sel ? C.bg : C.subtle,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, fontFamily: MONO,
                      transition: "all 0.18s ease",
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          {qIdx > 0 && (
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
            Nog een stap naar<br/>jullie resultaat
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
              onMouseEnter={e => { e.currentTarget.querySelector("[data-tip]").style.opacity = 1; e.currentTarget.querySelector("[data-tip]").style.pointerEvents = "auto"; }}
              onMouseLeave={e => { e.currentTarget.querySelector("[data-tip]").style.opacity = 0; e.currentTarget.querySelector("[data-tip]").style.pointerEvents = "none"; }}
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
            ].map(f => (
              <input
                key={f.k}
                type={f.type || "text"}
                placeholder={f.ph}
                value={contact[f.k]}
                onChange={e => setContact(p => ({ ...p, [f.k]: e.target.value }))}
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
                onFocus={e => e.target.style.borderColor = C.teal}
                onBlur={e => e.target.style.borderColor = C.border}
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
              onMouseEnter={e => { if (!submitting) hoverPrimaryOn(e); }}
              onMouseLeave={e => { if (!submitting) hoverPrimaryOff(e); }}
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
  const advice = getAdvice(dimScores);
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
            }}>Jullie AI-readiness</div>
          </div>

          <h2 style={{
            marginTop: 24,
            fontSize: `clamp(32px, 6vw, ${tokens.fontSize.h2}px)`,
            fontWeight: 400,
            letterSpacing: tokens.letterSpacing.h2,
            lineHeight: 1.2,
          }}>
            <span style={{ color: C.accent }}>{pct}%</span> AI-ready
          </h2>
          <div style={{
            marginTop: 14, display: "flex", width: "fit-content", margin: "14px auto 0", padding: "6px 18px", borderRadius: 100,
            background: C.card, border: `1px solid ${C.border}`,
            fontSize: 13, fontWeight: 600, color: C.white, fontFamily: MONO,
          }}>
            Niveau: {overallLabel}
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
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Ring pct={(dimScores[key] || 0) / (dimMax[key] || 1)} color={dim.color} size={100} strokeWidth={4}>
                <span style={{ fontSize: 22, fontWeight: 500, color: dim.color, fontFamily: FONT }}>
                  {dimScores[key] || 0}
                </span>
                <span style={{ fontSize: 10, color: C.subtle, fontFamily: MONO }}>/{dimMax[key]}</span>
              </Ring>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <DimIcon dim={dim} size={12} /> {dim.label}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
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
            Klaar om AI écht aan<br/>het werk te zetten?
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
            href={`mailto:hai@baind.nl?subject=${encodeURIComponent("Resultaten Quickscan")}&body=${encodeURIComponent(`Hoi Baind,\n\nIk heb de Quickscan ingevuld en scoorde ${pct}% (niveau: ${overallLabel}).\n\nIk zou graag een gesprek plannen om de resultaten te bespreken.\n\nMet vriendelijke groet,\n${contact.naam || ""}\n${contact.bedrijf || ""}`)}`}
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
