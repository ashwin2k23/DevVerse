"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Terminal as TerminalIcon, Sparkles, Send } from "lucide-react";

const coffeeQuotes = [
  "☕ Converting coffee to code...",
  "☕ Programmers: devices for turning caffeine into software.",
  "☕ Coffee: because stack overflow doesn't compile itself.",
  "☕ Fuel levels stable. Ready to squash bugs.",
  "☕ java.lang.NoCaffeineException resolved.",
  "☕ If you configure your compiler correctly, coffee flows automatically.",
];

const duckResponses = [
  "🐤 Quack! Have you tried console.log()?",
  "🐤 Quack! Is that variable actually defined in this scope?",
  "🐤 Quack! Read the error stack trace carefully.",
  "🐤 Quack! Try restarting your dev server. It works 80% of the time.",
  "🐤 Quack! Take a 5-minute walk. The solution will come to you.",
  "🐤 Quack! Did you forget to import the component?",
  "🐤 Quack! If it compiled on the first try, something is wrong.",
];

const terminalCommands: Record<string, string> = {
  help: "Available commands: help, joke, hack, git-push, clear, coffee, whoami",
  whoami: "You are an elite developer. The compiler fears you.",
  joke: "Why do programmers wear glasses? Because they can't C#.",
  hack: "⚡ Accessing mainframe... ⚡ Access Granted! (Just kidding, it's a mock console!)",
  "git-push": "🚀 Pushing changes... force pushing to main... done! (Please don't do this in real projects!)",
  coffee: "☕ Refilled! Fuel status is at 100%.",
  clear: "clear",
};

export default function DevPlayground() {
  const [activeTab, setActiveTab] = useState<"fuel" | "duck" | "terminal">("fuel");
  const [fuel, setFuel] = useState(40);
  const [fuelQuote, setFuelQuote] = useState("☕ Fuel levels critical. Drink coffee.");
  const [duckText, setDuckText] = useState("Click me to explain your bug...");
  const [duckWobble, setDuckWobble] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "DevVerse terminal v1.0.0",
    "Type 'help' to see list of console commands.",
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const handleDrinkCoffee = () => {
    if (fuel >= 100) {
      setFuelQuote("⚠️ Caffeine overflow! Maximum energy reached.");
      return;
    }
    setFuel((prev) => Math.min(prev + 20, 100));
    const randomQuote = coffeeQuotes[Math.floor(Math.random() * coffeeQuotes.length)];
    setFuelQuote(randomQuote);
  };

  const handleDuckClick = () => {
    setDuckWobble(true);
    const randomResponse = duckResponses[Math.floor(Math.random() * duckResponses.length)];
    setDuckText(randomResponse);
    setTimeout(() => setDuckWobble(false), 500);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalInput.trim().toLowerCase();
    if (!cmd) return;

    const output = terminalCommands[cmd] || `Command not found: ${cmd}. Type 'help' for suggestions.`;

    if (output === "clear") {
      setTerminalLogs([]);
    } else {
      setTerminalLogs((prev) => [...prev, `> ${terminalInput}`, output]);
    }

    if (cmd === "coffee") {
      setFuel(100);
      setFuelQuote("☕ Refilled! Fuel status is at 100%.");
    }

    setTerminalInput("");
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
      className="card-hover"
    >
      {/* Tab headers */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={15} style={{ color: "var(--warning)" }} />
          Dev Playground
        </h2>

        <div style={{ display: "flex", background: "var(--background)", padding: 3, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          {[
            { id: "fuel" as const, label: "Fuel" },
            { id: "duck" as const, label: "Duck" },
            { id: "terminal" as const, label: "Console" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "4px 10px",
                fontSize: 11,
                fontWeight: 600,
                border: "none",
                borderRadius: "var(--radius-sm)",
                background: activeTab === t.id ? "var(--surface-elevated)" : "transparent",
                color: activeTab === t.id ? "var(--accent)" : "var(--secondary)",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      <div style={{ minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <AnimatePresence mode="wait">
          {/* Fuel Tab */}
          {activeTab === "fuel" && (
            <motion.div
              key="fuel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}
            >
              {/* Animated Cup */}
              <div style={{ position: "relative", cursor: "pointer" }} onClick={handleDrinkCoffee}>
                <svg width="70" height="70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--primary)" }}>
                  <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                  <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                  <line x1="6" y1="2" x2="6" y2="4" strokeDasharray="1 1" />
                  <line x1="10" y1="2" x2="10" y2="4" strokeDasharray="1 1" />
                  <line x1="14" y1="2" x2="14" y2="4" strokeDasharray="1 1" />
                </svg>
                {/* Coffee Liquid Fill */}
                <motion.div
                  animate={{ height: `${fuel * 0.35}px` }}
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 14,
                    width: 32,
                    background: "linear-gradient(to top, #4A2c11, #6F4E37)",
                    borderRadius: "2px 2px 8px 8px",
                    zIndex: -1,
                  }}
                />
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Fuel Meter: {fuel}%</div>
                <div style={{ height: 6, width: 140, background: "var(--border)", borderRadius: 3, margin: "6px auto", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${fuel}%`,
                      background: fuel > 30 ? "linear-gradient(90deg, #6F4E37, #A0522D)" : "#EF4444",
                      transition: "width 300ms",
                    }}
                  />
                </div>
                <p style={{ fontSize: 12, color: "var(--secondary)", minHeight: 34, marginTop: 4 }}>{fuelQuote}</p>
              </div>

              <button
                id="drink-coffee-btn"
                onClick={handleDrinkCoffee}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  background: "var(--accent)",
                  color: "white",
                  fontSize: 12,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Coffee size={13} />
                Drink Coffee
              </button>
            </motion.div>
          )}

          {/* Duck Debugger Tab */}
          {activeTab === "duck" && (
            <motion.div
              key="duck"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center" }}
            >
              {/* Wobbling Duck */}
              <motion.div
                animate={duckWobble ? { rotate: [-10, 10, -10, 10, 0] } : {}}
                onClick={handleDuckClick}
                style={{ fontSize: 44, cursor: "pointer", userSelect: "none" }}
              >
                🐤
              </motion.div>

              <div
                style={{
                  background: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius)",
                  padding: "10px 14px",
                  fontSize: 12,
                  maxWidth: 240,
                  lineHeight: 1.5,
                  minHeight: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {duckText}
              </div>

              <p style={{ fontSize: 11, color: "var(--muted)" }}>
                Click the duck to explain your logic bug.
              </p>
            </motion.div>
          )}

          {/* Terminal Console Tab */}
          {activeTab === "terminal" && (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: "flex", flexDirection: "column", height: 180 }}
            >
              {/* Log panel */}
              <div
                style={{
                  flex: 1,
                  background: "black",
                  borderRadius: "var(--radius)",
                  padding: 10,
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#00FF00",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  textAlign: "left",
                  border: "1px solid #333",
                }}
              >
                {terminalLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
                <div ref={logEndRef} />
              </div>

              {/* Form Input */}
              <form onSubmit={handleTerminalSubmit} style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <input
                  id="terminal-input"
                  type="text"
                  placeholder="Type command..."
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "6px 12px",
                    background: "var(--background)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    fontSize: 12,
                    fontFamily: "monospace",
                    color: "var(--primary)",
                    outline: "none",
                  }}
                />
                <button
                  id="terminal-submit"
                  type="submit"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "var(--radius)",
                    background: "var(--accent)",
                    color: "white",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Send size={12} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
