import { useState, useEffect } from "react";
import consistentieIcon from "./consistentie-icon.png";

/*
  BAIND QUICKSCAN  AI & Merkconsistentie
  Stijl gebaseerd op baind.nl: donker teal, clean, goud accent, 
  zachte ronde vormen, veel witruimte, modern sans-serif.
  Geen em-dashes in de tekst.
*/

const C = {
  bg: "#00302E",
  card: "#003D3A",
  cardHover: "#004845",
  border: "#2B4443",
  borderHover: "#3A5A58",
  white: "#E9F4F2",
  muted: "#96A2A2",
  subtle: "#7D8C8C",
  accent: "#FFBF00",
  accentDim: "rgba(255,191,0,0.12)",
  accentGlow: "rgba(255,191,0,0.30)",
  teal: "#04C6C0",
  cream: "#F9F7F5",
  red: "#FF6B6B",
  orange: "#FFB347",
  green: "#04C6C0",
  dimGreen: "rgba(4,198,192,0.12)",
  dimOrange: "rgba(255,179,71,0.12)",
  dimRed: "rgba(255,107,107,0.12)",
  divider: "#063F3D",
};

const FONT = `'DM Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
const MONO = `'JetBrains Mono', 'SF Mono', 'Fira Code', monospace`;

const DIMENSIONS = {
  merkfundament: { label: "Merkfundament", icon: "\u25C6", color: C.accent, dimColor: C.accentDim },
  aiadoptie: { label: "AI-adoptie", icon: "\u26A1", color: C.teal, dimColor: C.dimGreen },
  consistentie: { label: "Consistentie", iconSrc: consistentieIcon, color: C.accent, dimColor: C.accentDim },
};

function DimIcon({ dim, size = 14 }) {
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
      { text: "AI is geintegreerd in onze workflows met duidelijke richtlijnen", score: 4 },
    ],
  },
  {
    id: 5, dim: "aiadoptie",
    q: "Op welke afdelingen wordt AI ingezet?",
    sub: "Selecteer de optie die het beste past bij jullie situatie.",
    opts: [
      { text: "Nergens structureel", score: 1 },
      { text: "Alleen marketing of communicatie", score: 2 },
      { text: "Meerdere afdelingen, maar los van elkaar", score: 3 },
      { text: "Organisatiebreed met een gedeelde aanpak", score: 4 },
    ],
  },
  {
    id: 6, dim: "aiadoptie",
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
    id: 7, dim: "consistentie",
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
    id: 8, dim: "consistentie",
    q: "Hoe herkenbaar is jullie merk in AI-gegenereerde teksten?",
    sub: "Zou een klant het verschil merken tussen AI-content en handgeschreven content?",
    opts: [
      { text: "AI-content is duidelijk robotachtig of generiek", score: 1 },
      { text: "Het is oke, maar mist onze unieke stem", score: 2 },
      { text: "Redelijk herkenbaar, maar nog niet perfect", score: 3 },
      { text: "Onze AI-content is niet te onderscheiden van handgeschreven", score: 4 },
    ],
  },
  {
    id: 9, dim: "consistentie",
    q: "Hoeveel tijd besteedt jullie team aan het herschrijven van AI-output?",
    sub: "Een indicatie van hoe goed AI aansluit bij jullie merk.",
    opts: [
      { text: "We gebruiken AI (nog) niet, dus niet van toepassing", score: 1 },
      { text: "Veel, bijna alles moet herschreven worden", score: 2 },
      { text: "Redelijk wat, aanpassingen in tone en stijl zijn nodig", score: 3 },
      { text: "Minimaal, de output is direct bruikbaar", score: 4 },
    ],
  },
];

function BaindLogo() {
  return (
    <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="19" fill={C.white} fontFamily={FONT} fontWeight="700" fontSize="20" letterSpacing="-0.5">baind</text>
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

  if (mf <= 6) {
    out.push({ dim: "merkfundament", prio: "hoog", text: "Begin met het vastleggen van jullie merkidentiteit. Zonder een stevig fundament kan AI nooit consistent op-merk communiceren. Denk aan een tone of voice document, merkwaarden en communicatierichtlijnen.", cta: "Baind helpt jullie merkfundament te vertalen naar een AI-klare basis." });
  } else if (mf <= 9) {
    out.push({ dim: "merkfundament", prio: "middel", text: "Jullie merkbasis staat, maar kan aangescherpt worden voor AI-gebruik. Specifieke voorbeelden en contra-voorbeelden maken het verschil.", cta: "Baind's merkexperts helpen jullie guidelines AI-proof te maken." });
  } else {
    out.push({ dim: "merkfundament", prio: "laag", text: "Uitstekend merkfundament! Jullie zijn klaar om dit te vertalen naar een AI-omgeving die jullie merk versterkt.", cta: "Met Baind zetten jullie dit fundament om in een krachtige AI-omgeving." });
  }

  if (ai <= 6) {
    out.push({ dim: "aiadoptie", prio: "hoog", text: "Er liggen grote kansen om AI in te zetten voor communicatie. Start met concrete use cases en bouw van daaruit op.", cta: "Baind levert concrete toepassingen in de vorm van merk-specifieke prompts." });
  } else if (ai <= 9) {
    out.push({ dim: "aiadoptie", prio: "middel", text: "Goede start met AI! De volgende stap is om van losse experimenten naar een gestructureerde aanpak te gaan, afgestemd op jullie merk.", cta: "Baind helpt jullie AI-gebruik te structureren en op te schalen." });
  } else {
    out.push({ dim: "aiadoptie", prio: "laag", text: "Jullie AI-adoptie is ver gevorderd. Focus nu op het maximaal afstemmen van alle AI-output op jullie merkidentiteit.", cta: "Baind optimaliseert jullie bestaande AI-setup voor maximale merkconsistentie." });
  }

  if (co <= 6) {
    out.push({ dim: "consistentie", prio: "hoog", text: "De AI-output sluit nog niet goed aan bij jullie merk. Dit is het gebied waar de meeste winst te behalen is, en waar Baind het verschil maakt.", cta: "Baind traint AI specifiek op jullie merk, zodat output direct herkenbaar is." });
  } else if (co <= 9) {
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

  useEffect(() => {
    const l = document.createElement("link");
    l.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;700&display=swap";
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
    }, 350);
  };

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

  const overallLabel = pct <= 35 ? "Beginner" : pct <= 60 ? "Explorer" : pct <= 82 ? "Gevorderd" : "Expert";

  const wrap = {
    minHeight: "100vh",
    background: `radial-gradient(ellipse at 50% 0%, rgba(4,198,192,0.15) 0%, ${C.bg} 60%), ${C.bg}`,
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
          
          <BaindLogo />

          <div style={{
            marginTop: 48,
            display: "inline-flex",
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

          <h1 style={{
            marginTop: 28,
            fontSize: "clamp(34px, 7vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}>
            Hoe AI-ready<br/>
            <span style={{ color: C.accent }}>is jouw merk?</span>
          </h1>

          <p style={{
            marginTop: 20,
            fontSize: 17,
            lineHeight: 1.65,
            color: C.muted,
            maxWidth: 420,
          }}>
            Ontdek in 2 minuten waar de grootste kansen liggen om AI in te zetten, zonder je merkidentiteit te verliezen.
          </p>

          <button
            onClick={() => setPhase("scan")}
            style={{
              marginTop: 44,
              background: C.accent,
              color: C.bg,
              border: "none",
              borderRadius: 100,
              padding: "18px 52px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 0 48px ${C.accentGlow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Start de scan
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
            9 vragen · 3 dimensies · direct resultaat
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
            transform: sliding ? "translateY(16px)" : "translateY(0)",
            transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}>
            <h2 style={{
              fontSize: "clamp(22px, 4.5vw, 28px)",
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: "-0.015em",
              margin: "0 0 8px 0",
            }}>
              {q.q}
            </h2>
            <p style={{ fontSize: 14, color: C.subtle, margin: "0 0 32px 0", lineHeight: 1.55 }}>
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
                      border: `1.5px solid ${sel ? "rgba(255,191,0,0.35)" : C.border}`,
                      borderRadius: 16,
                      padding: "16px 18px",
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
                      minWidth: 30, height: 30, borderRadius: 9,
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
            display: "inline-flex", padding: "6px 16px", borderRadius: 100,
            background: C.accentDim, fontSize: 12, fontWeight: 600,
            color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO,
          }}>Bijna klaar</div>

          <h2 style={{
            marginTop: 24, fontSize: "clamp(24px, 5vw, 36px)", fontWeight: 700,
            textAlign: "center", letterSpacing: "-0.02em", lineHeight: 1.15,
          }}>
            Wie mogen we feliciteren<br/>met dit inzicht?
          </h2>

          <p style={{
            marginTop: 14, fontSize: 15, color: C.muted, textAlign: "center", maxWidth: 380, lineHeight: 1.6,
          }}>
            Vul je gegevens in voor je persoonlijke rapport, of bekijk direct je resultaat.
          </p>

          <div style={{ width: "100%", maxWidth: 380, marginTop: 36, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { k: "naam", ph: "Naam" },
              { k: "bedrijf", ph: "Bedrijfsnaam" },
              { k: "email", ph: "E-mailadres", type: "email" },
              { k: "telefoon", ph: "Telefoonnummer (optioneel)" },
            ].map(f => (
              <input
                key={f.k}
                type={f.type || "text"}
                placeholder={f.ph}
                value={contact[f.k]}
                onChange={e => setContact(p => ({ ...p, [f.k]: e.target.value }))}
                style={{
                  background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 16,
                  padding: "15px 18px", fontSize: 15, color: C.white, fontFamily: FONT, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = C.teal}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            ))}

            <button
              onClick={() => { setPhase("result"); setTimeout(() => setRevealed(true), 80); }}
              style={{
                marginTop: 8, background: C.accent, color: C.bg, border: "none",
                borderRadius: 100, padding: "17px 44px", fontSize: 16, fontWeight: 600,
                cursor: "pointer", fontFamily: FONT, transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Bekijk mijn resultaat
            </button>

            <button
              onClick={() => { setPhase("result"); setTimeout(() => setRevealed(true), 80); }}
              style={{
                background: "none", border: "none", color: C.subtle, fontSize: 13,
                cursor: "pointer", fontFamily: FONT, padding: "8px 0",
              }}
            >
              Overslaan en direct resultaat bekijken
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
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <BaindLogo />
          <div style={{
            marginTop: 32, display: "inline-flex", padding: "6px 16px", borderRadius: 100,
            background: C.accentDim, fontSize: 12, fontWeight: 600,
            color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: MONO,
          }}>Jouw resultaat</div>

          <h2 style={{
            marginTop: 24, fontSize: "clamp(26px, 5.5vw, 42px)", fontWeight: 700,
            letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>
            {contact.bedrijf || "Jullie organisatie"} scoort{" "}
            <span style={{ color: C.accent }}>{pct}%</span>
          </h2>
          <p style={{ marginTop: 10, fontSize: 16, color: C.muted }}>
            Niveau: <strong style={{ color: C.white }}>{overallLabel}</strong>
          </p>
        </div>

        <div style={{
          display: "flex", justifyContent: "center", gap: "clamp(20px, 5vw, 44px)",
          marginBottom: 52, flexWrap: "wrap",
        }}>
          {Object.entries(DIMENSIONS).map(([key, dim]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <Ring pct={(dimScores[key] || 0) / (dimMax[key] || 1)} color={dim.color} size={100} strokeWidth={4}>
                <span style={{ fontSize: 22, fontWeight: 700, color: dim.color, fontFamily: FONT }}>
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
                background: C.card, borderRadius: 32, padding: "28px 30px",
                border: `1.5px solid ${C.border}`,
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
          borderRadius: 32,
          padding: "44px 36px",
          textAlign: "center",
          marginBottom: 40,
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 12px 0", letterSpacing: "-0.015em", color: C.bg }}>
            Klaar om je merk te verbinden met AI?
          </h3>
          <p style={{ fontSize: 15, color: "#5A6B6B", margin: "0 0 28px 0", maxWidth: 380, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            Baind helpt je AI te integreren in je organisatie, volledig in lijn met jouw merk. Plan een vrijblijvend gesprek.
          </p>
          <a
            href="https://www.baind.nl/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", background: C.accent, color: C.bg, textDecoration: "none",
              borderRadius: 16, padding: "17px 44px", fontSize: 16, fontWeight: 600, fontFamily: FONT,
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = `0 0 48px ${C.accentGlow}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            Plan een gesprek met Baind
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
