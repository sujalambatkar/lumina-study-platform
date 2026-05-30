"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, XCircle, Trophy, RotateCcw, Sparkles, FileText, Minus, Plus, Download } from "lucide-react";
import type { Document, QuizQuestion } from "@/types";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

type State = "select" | "loading" | "question" | "score" | "report";

interface AnswerRecord {
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  chosen: string | null;
  isCorrect: boolean;
}

export default function QuizPage() {
  const { docId } = useParams<{ docId: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [state, setState] = useState<State>("select");
  const [topic, setTopic] = useState("");
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  useEffect(() => { api.getDocument(docId).then(setDoc).catch(() => {}); }, [docId]);

  const start = async () => {
    if (!topic.trim()) return;
    setState("loading");
    try {
      const r = await api.generateQuiz(docId, topic.trim(), questionCount);
      // Trim/extend to requested count
      setQuestions(r.questions.slice(0, questionCount));
      setIdx(0); setAnswers([]); setSelected(null);
      setState("question");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate quiz");
      setState("select");
    }
  };

  const pick = (opt: string) => {
    if (selected) return;
    const letter = opt[0];
    setSelected(letter);
  };

  const next = () => {
    const q = questions[idx];
    const record: AnswerRecord = {
      question: q.question,
      options: q.options,
      correct: q.correct,
      explanation: q.explanation,
      chosen: selected,
      isCorrect: selected === q.correct,
    };
    const newAnswers = [...answers, record];
    setAnswers(newAnswers);

    if (idx + 1 >= questions.length) {
      const score = newAnswers.filter((a) => a.isCorrect).length;
      api.submitQuiz({ document_id: docId, topic, score, total: questions.length }).catch(() => {});
      setState("score");
    } else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  };

  const reset = () => { setState("select"); setTopic(""); setQuestions([]); setAnswers([]); setSelected(null); };
  const retry = () => { setState("question"); setIdx(0); setSelected(null); setAnswers([]); };

  const downloadPDF = () => {
    const scoreColor = pct >= 80 ? "#16a34a" : pct >= 60 ? "#d97706" : "#dc2626";
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Quiz Report — ${topic}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 680px; margin: 48px auto; color: #1a1a1a; line-height: 1.6; padding: 0 24px; }
    h1 { font-size: 26px; font-weight: 700; margin-bottom: 4px; }
    .meta { color: #777; font-size: 13px; margin-bottom: 28px; }
    .score-block { display: flex; align-items: baseline; gap: 16px; margin-bottom: 32px; padding: 20px 24px; background: #fafafa; border: 1px solid #eee; border-radius: 10px; }
    .score-num { font-size: 52px; font-weight: 700; color: ${scoreColor}; line-height: 1; }
    .score-detail { font-size: 14px; color: #555; }
    .divider { border: none; border-top: 1px solid #eee; margin: 28px 0; }
    .question-block { margin-bottom: 28px; padding: 20px; border: 1px solid #eee; border-radius: 10px; page-break-inside: avoid; }
    .q-number { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
    .q-text { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
    .option { padding: 4px 0; font-size: 13px; color: #555; display: flex; align-items: center; gap: 8px; }
    .option.correct { color: #16a34a; font-weight: 600; }
    .option.wrong { color: #dc2626; font-weight: 600; }
    .badge { font-size: 10px; padding: 2px 7px; border-radius: 99px; font-weight: 700; }
    .badge-correct { background: #dcfce7; color: #16a34a; }
    .badge-wrong { background: #fee2e2; color: #dc2626; }
    .explanation { margin-top: 14px; padding: 12px 14px; background: #fffbeb; border-left: 3px solid #d97706; border-radius: 0 6px 6px 0; font-size: 13px; color: #555; }
    .explanation strong { color: #d97706; }
    footer { margin-top: 40px; text-align: center; font-size: 11px; color: #bbb; }
    @media print {
      body { margin: 32px; }
      .question-block { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>Quiz Report</h1>
  <p class="meta">Topic: <strong>${topic}</strong> &nbsp;·&nbsp; ${answers.length} questions &nbsp;·&nbsp; ${doc?.title ?? ""}</p>
  <div class="score-block">
    <div class="score-num">${pct}%</div>
    <div class="score-detail">
      <div style="font-size:18px;font-weight:700;color:#1a1a1a">${score} of ${answers.length} correct</div>
      <div style="color:#999;font-size:13px;margin-top:4px">${pct >= 80 ? "Excellent performance" : pct >= 60 ? "Good — keep reviewing" : "Needs more practice"}</div>
    </div>
  </div>
  <hr class="divider" />
  ${answers.map((a, i) => `
    <div class="question-block">
      <div class="q-number">Question ${i + 1}</div>
      <div class="q-text">${a.question}</div>
      ${a.options.map((opt) => {
        const letter = opt[0];
        const isCorrect = letter === a.correct;
        const isChosen = letter === a.chosen;
        const cls = isCorrect ? "correct" : isChosen && !isCorrect ? "wrong" : "";
        const badge = isCorrect
          ? `<span class="badge badge-correct">Correct</span>`
          : isChosen && !isCorrect
          ? `<span class="badge badge-wrong">Your answer</span>`
          : "";
        return `<div class="option ${cls}">${isCorrect ? "✓" : isChosen && !isCorrect ? "✗" : "○"} &nbsp;${opt} ${badge}</div>`;
      }).join("")}
      <div class="explanation"><strong>Explanation:</strong> ${a.explanation}</div>
    </div>
  `).join("")}
  <footer>Generated by Lumina · lumina.study</footer>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) { toast.error("Allow popups to download the report"); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const score = answers.filter((a) => a.isCorrect).length;
  const pct = answers.length > 0 ? Math.round((score / answers.length) * 100) : 0;
  const scoreColor = pct >= 80 ? "#4caf7d" : pct >= 60 ? "#e8a84c" : "#e85c5c";

  return (
    <div style={{ padding: "40px", maxWidth: 620, margin: "0 auto" }}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <Link href={`/chat/${docId}`} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, fontWeight: 500, textDecoration: "none",
            color: "#e8a84c", padding: "6px 12px", borderRadius: 6,
            background: "rgba(232,168,76,0.08)",
            border: "1px solid rgba(232,168,76,0.2)",
          }}>
            <ArrowLeft size={13} /> Back to Chat
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 500, color: "#ede9e0" }}>Quiz</h1>
            {doc && <p style={{ fontSize: 11, color: "#4a4642", marginTop: 2 }}>{doc.title}</p>}
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Topic select ── */}
          {state === "select" && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(232,168,76,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <Sparkles size={20} color="#e8a84c" />
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#ede9e0", marginBottom: 24 }}>
                  Set up your quiz
                </h2>

                {/* Topic */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#8a8278", marginBottom: 6, fontWeight: 500 }}>Topic</label>
                  <input
                    style={{ width: "100%", padding: "11px 14px", background: "#161622", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#ede9e0", fontSize: 14, outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" as const }}
                    placeholder="e.g. Neural Networks, Mitosis, Supply & Demand…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && start()}
                    onFocus={(e) => { e.target.style.borderColor = "rgba(232,168,76,0.5)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  />
                </div>

                {/* Question count */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, color: "#8a8278", marginBottom: 10, fontWeight: 500 }}>
                    Number of questions
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                      onClick={() => setQuestionCount((n) => Math.max(1, n - 1))}
                      style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "#161622", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8278" }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: "#ede9e0", minWidth: 40, textAlign: "center" }}>
                      {questionCount}
                    </span>
                    <button
                      onClick={() => setQuestionCount((n) => Math.min(20, n + 1))}
                      style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "#161622", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8a8278" }}
                    >
                      <Plus size={14} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <input
                        type="range" min={1} max={20} value={questionCount}
                        onChange={(e) => setQuestionCount(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#e8a84c" }}
                      />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 10, color: "#4a4642" }}>1</span>
                        <span style={{ fontSize: 10, color: "#4a4642" }}>20</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={start}
                  disabled={!topic.trim()}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 8, border: "none",
                    background: topic.trim() ? "linear-gradient(135deg,#e8a84c,#d4863e)" : "rgba(232,168,76,0.3)",
                    color: "#0a0a0f", fontWeight: 600, fontSize: 14,
                    cursor: topic.trim() ? "pointer" : "not-allowed", fontFamily: "var(--font-body)",
                  }}
                >
                  Generate {questionCount} question{questionCount !== 1 ? "s" : ""}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Loading ── */}
          {state === "loading" && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 0", gap: 16 }}>
              <div style={{ width: 28, height: 28, border: "2px solid rgba(255,255,255,0.08)", borderTopColor: "#e8a84c", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              <p style={{ color: "#6b6560", fontSize: 14 }}>Generating {questionCount} questions on <strong style={{ color: "#ede9e0" }}>{topic}</strong>…</p>
            </motion.div>
          )}

          {/* ── Question ── */}
          {state === "question" && questions[idx] && (
            <motion.div key={`q-${idx}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }} transition={{ duration: 0.2 }}>
              {/* Progress */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#4a4642" }}>Q{idx + 1} of {questions.length}</span>
                  <span style={{ fontSize: 12, color: "#4a4642" }}>{answers.filter((a) => a.isCorrect).length} correct</span>
                </div>
                <div style={{ height: 3, background: "#161622", borderRadius: 99 }}>
                  <div style={{ height: "100%", background: "#e8a84c", borderRadius: 99, width: `${((idx + 1) / questions.length) * 100}%`, transition: "width 0.3s" }} />
                </div>
              </div>

              <div style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 }}>
                <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 500, color: "#ede9e0", marginBottom: 24, lineHeight: 1.4 }}>
                  {questions[idx].question}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {questions[idx].options.map((opt) => {
                    const letter = opt[0];
                    const isSelected = selected === letter;
                    const isCorrect = letter === questions[idx].correct;
                    const show = !!selected;
                    let bg = "#161622", border = "rgba(255,255,255,0.08)", color = "#ede9e0";
                    if (show) {
                      if (isCorrect) { bg = "rgba(76,175,125,0.08)"; border = "rgba(76,175,125,0.4)"; color = "#4caf7d"; }
                      else if (isSelected) { bg = "rgba(232,92,92,0.08)"; border = "rgba(232,92,92,0.4)"; color = "#e85c5c"; }
                    }
                    return (
                      <motion.button key={opt} whileTap={!selected ? { scale: 0.99 } : {}} onClick={() => pick(opt)} disabled={!!selected}
                        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1px solid ${border}`, background: bg, color, fontSize: 13, textAlign: "left", cursor: selected ? "default" : "pointer", transition: "all 0.15s", fontFamily: "var(--font-body)" }}>
                        <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: show && isCorrect ? "#4caf7d" : show && isSelected && !isCorrect ? "#e85c5c" : "#0a0a0f", color: show && (isCorrect || (isSelected && !isCorrect)) ? "white" : "#6b6560" }}>
                          {letter}
                        </span>
                        <span style={{ flex: 1 }}>{opt.slice(3)}</span>
                        {show && isCorrect && <CheckCircle size={15} color="#4caf7d" />}
                        {show && isSelected && !isCorrect && <XCircle size={15} color="#e85c5c" />}
                      </motion.button>
                    );
                  })}
                </div>
                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: 16, overflow: "hidden" }}>
                      <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(232,168,76,0.06)", border: "1px solid rgba(232,168,76,0.15)" }}>
                        <p style={{ fontSize: 10, fontWeight: 700, color: "#e8a84c", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Explanation</p>
                        <p style={{ fontSize: 13, color: "#8a8278", lineHeight: 1.6 }}>{questions[idx].explanation}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {selected && (
                <button onClick={next} style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#e8a84c,#d4863e)", color: "#0a0a0f", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  {idx + 1 >= questions.length ? "See results" : "Next →"}
                </button>
              )}
            </motion.div>
          )}

          {/* ── Score ── */}
          {state === "score" && (
            <motion.div key="score" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 0" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: `${scoreColor}15`, border: `2px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <Trophy size={36} color={scoreColor} />
              </div>
              <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                style={{ fontFamily: "var(--font-display)", fontSize: 72, fontWeight: 500, color: "#ede9e0", lineHeight: 1, marginBottom: 8 }}>
                {pct}%
              </motion.p>
              <p style={{ fontSize: 14, color: "#6b6560", marginBottom: 4 }}>{score} of {answers.length} correct</p>
              <p style={{ fontSize: 12, color: "#4a4642", marginBottom: 36 }}>Topic: {topic}</p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
                <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "transparent", color: "#8a8278", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}>
                  <RotateCcw size={13} /> New quiz
                </button>
                <button onClick={retry} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "linear-gradient(135deg,#e8a84c,#d4863e)", color: "#0a0a0f", border: "none", fontFamily: "var(--font-body)" }}>
                  Retry
                </button>
                <button onClick={() => setState("report")} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#161622", color: "#ede9e0", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={13} /> View report
                </button>
              </div>
              <Link href="/tracker" style={{ fontSize: 12, color: "#4a4642", textDecoration: "none" }}>View tracker →</Link>
            </motion.div>
          )}

          {/* ── Report ── */}
          {state === "report" && (
            <motion.div key="report" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 500, color: "#ede9e0" }}>
                  Quiz Report
                </h2>
                <button onClick={() => setState("score")} style={{ fontSize: 13, color: "#6b6560", background: "none", border: "none", cursor: "pointer" }}>
                  ← Back to score
                </button>
              </div>

              {/* Summary bar */}
              <div style={{ background: "#0f0f18", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 24 }}>
                <div>
                  <p style={{ fontSize: 11, color: "#4a4642", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Score</p>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 500, color: scoreColor }}>{pct}%</p>
                </div>
                <div style={{ flex: 1, height: 6, background: "#161622", borderRadius: 99 }}>
                  <div style={{ height: "100%", background: scoreColor, borderRadius: 99, width: `${pct}%`, transition: "width 0.5s" }} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 11, color: "#4a4642", marginBottom: 2 }}>{score}/{answers.length} correct</p>
                  <p style={{ fontSize: 11, color: "#4a4642" }}>{topic}</p>
                </div>
              </div>

              {/* Question breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {answers.map((a, i) => (
                  <div key={i} style={{ background: "#0f0f18", border: `1px solid ${a.isCorrect ? "rgba(76,175,125,0.2)" : "rgba(232,92,92,0.2)"}`, borderRadius: 12, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                      <span style={{ width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: a.isCorrect ? "rgba(76,175,125,0.15)" : "rgba(232,92,92,0.15)" }}>
                        {a.isCorrect
                          ? <CheckCircle size={13} color="#4caf7d" />
                          : <XCircle size={13} color="#e85c5c" />}
                      </span>
                      <p style={{ fontSize: 14, color: "#ede9e0", lineHeight: 1.5, flex: 1 }}>
                        <span style={{ fontSize: 11, color: "#4a4642", marginRight: 6 }}>Q{i + 1}.</span>
                        {a.question}
                      </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginLeft: 32, marginBottom: 12 }}>
                      {a.options.map((opt) => {
                        const letter = opt[0];
                        const isChosen = letter === a.chosen;
                        const isCorrect = letter === a.correct;
                        let color = "#4a4642";
                        if (isCorrect) color = "#4caf7d";
                        else if (isChosen && !isCorrect) color = "#e85c5c";
                        return (
                          <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                            <span style={{ color, fontWeight: isCorrect || isChosen ? 700 : 400 }}>
                              {letter}.
                            </span>
                            <span style={{ color: isCorrect ? "#4caf7d" : isChosen && !isCorrect ? "#e85c5c" : "#6b6560" }}>
                              {opt.slice(3)}
                            </span>
                            {isCorrect && <span style={{ fontSize: 10, color: "#4caf7d", marginLeft: 4 }}>✓ correct</span>}
                            {isChosen && !isCorrect && <span style={{ fontSize: 10, color: "#e85c5c", marginLeft: 4 }}>✗ your answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ marginLeft: 32, padding: "8px 12px", borderRadius: 8, background: "rgba(232,168,76,0.05)", border: "1px solid rgba(232,168,76,0.1)" }}>
                      <p style={{ fontSize: 10, color: "#e8a84c", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Explanation</p>
                      <p style={{ fontSize: 12, color: "#8a8278", lineHeight: 1.6 }}>{a.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={reset} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "transparent", color: "#8a8278", border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}>
                  <RotateCcw size={13} /> New quiz
                </button>
                <button onClick={retry} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "linear-gradient(135deg,#e8a84c,#d4863e)", color: "#0a0a0f", border: "none", fontFamily: "var(--font-body)" }}>
                  Retry quiz
                </button>
                <button onClick={downloadPDF} style={{ padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", background: "#161622", color: "#4caf7d", border: "1px solid rgba(76,175,125,0.3)", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6 }}>
                  <Download size={13} /> Download PDF
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #4a4642; }
        input[type=range] { height: 4px; }
      `}</style>
    </div>
  );
}
