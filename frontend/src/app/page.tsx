"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight, Sparkles, MessageSquare, Network, Brain,
  FileText, Video, Globe, BookOpen, GraduationCap, Microscope, Code2, FlaskConical,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "Chat with your material",
    desc: "Ask anything and get cited answers drawn directly from your document. Every response references the exact source.",
    color: "#52525b",
  },
  {
    icon: Network,
    title: "Visual concept maps",
    desc: "Auto-generated knowledge graphs show how ideas connect. See the big picture at a glance.",
    color: "#0a0a0a",
  },
  {
    icon: Brain,
    title: "AI-powered quizzes",
    desc: "Generate quizzes on any topic. Choose how many questions. Get explanations for every answer.",
    color: "#15803d",
  },
  {
    icon: BookOpen,
    title: "Understanding tracker",
    desc: "Track your mastery across topics. See exactly what needs review and what you've already nailed.",
    color: "#52525b",
  },
];

const SOURCES = [
  { icon: FileText, label: "PDF documents" },
  { icon: Video, label: "YouTube videos" },
  { icon: Globe, label: "Web articles" },
];

const USE_CASES = [
  {
    icon: GraduationCap,
    label: "Exam prep",
    desc: "Upload lecture slides or textbook chapters. Quiz yourself on every topic until you're ready.",
  },
  {
    icon: Microscope,
    label: "Research",
    desc: "Chat with papers and articles. Extract key concepts and understand complex relationships fast.",
  },
  {
    icon: Code2,
    label: "Learning new skills",
    desc: "Drop in a tutorial or documentation. Ask questions, map the concepts, track your progress.",
  },
  {
    icon: FlaskConical,
    label: "Deep understanding",
    desc: "Don't just memorise — understand. See how every idea connects with auto-generated concept maps.",
  },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Upload anything", desc: "PDF, YouTube link, or any web URL. Lumina reads it all." },
  { step: "02", title: "Ask questions", desc: "Chat naturally. Get answers cited directly from your material." },
  { step: "03", title: "Map & quiz", desc: "Visualise concepts as a graph. Test yourself with AI-generated quizzes." },
  { step: "04", title: "Track progress", desc: "See your mastery grow. Know exactly what to review next." },
];

export default function LandingPage() {
  return (
    <div style={{ background: "#ffffff", minHeight: "100dvh", color: "#0a0a0a" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "1px solid rgba(0,0,0,0.08)",
        position: "sticky", top: 0, background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 7,
            background: "linear-gradient(135deg, #0a0a0a, #262626)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Sparkles size={13} color="white" />
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 500, color: "#0a0a0a" }}>
            Lumina
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/dashboard" style={{
            background: "linear-gradient(135deg, #0a0a0a, #262626)",
            color: "#ffffff", padding: "8px 18px", borderRadius: 8,
            fontSize: 14, fontWeight: 500, textDecoration: "none",
          }}>
            Open demo
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 760, margin: "0 auto", padding: "88px 24px 64px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 999,
            background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.12)",
            color: "#0a0a0a", fontSize: 12, marginBottom: 28,
          }}
        >
          <Sparkles size={11} /> Interactive demo · sample data
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 7vw, 5.2rem)",
            fontWeight: 500, lineHeight: 1.08,
            letterSpacing: "-0.02em", marginBottom: 22,
          }}
        >
          Your study material.{" "}
          <span style={{
            background: "linear-gradient(135deg, #262626, #0a0a0a, #262626)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Finally understood.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{ color: "#52525b", fontSize: 17, lineHeight: 1.6, marginBottom: 32 }}
        >
          Upload PDFs, YouTube videos, and web articles. Chat with them, visualise their concepts,
          quiz yourself, and track what you know.
        </motion.p>

        {/* Source chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}
        >
          {SOURCES.map(({ icon: Icon, label }) => (
            <span key={label} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 999,
              background: "#f4f4f5", border: "1px solid rgba(0,0,0,0.09)",
              color: "#71717a", fontSize: 12,
            }}>
              <Icon size={11} />{label}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/dashboard" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "13px 28px", borderRadius: 8,
            background: "linear-gradient(135deg, #0a0a0a, #262626)",
            color: "#ffffff", fontWeight: 600, fontSize: 14, textDecoration: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}>
            Open the demo <ArrowRight size={15} />
          </Link>
          <Link href="/library" style={{
            display: "inline-flex", alignItems: "center",
            padding: "13px 28px", borderRadius: 8,
            border: "1px solid rgba(0,0,0,0.1)",
            color: "#71717a", fontSize: 14, textDecoration: "none",
          }}>
            Browse documents
          </Link>
        </motion.div>

      </section>

      {/* Features */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            Features
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 500, color: "#0a0a0a" }}>
            Everything you need to study smarter
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                background: "#fafafa", border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 14, padding: 22,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                background: `${color}18`, border: `1px solid ${color}28`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={18} color={color} />
              </div>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500, marginBottom: 8, color: "#0a0a0a" }}>
                {title}
              </p>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            How it works
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 500, color: "#0a0a0a" }}>
            From upload to mastery in minutes
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
          {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                background: "#fafafa", border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 14, padding: 22, position: "relative",
              }}
            >
              <p style={{
                fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 600,
                color: "rgba(0,0,0,0.12)", marginBottom: 12, lineHeight: 1,
              }}>
                {step}
              </p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a", marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
            Use cases
          </p>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 500, color: "#0a0a0a" }}>
            Built for serious learners
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          {USE_CASES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              style={{
                background: "#fafafa", border: "1px solid rgba(0,0,0,0.09)",
                borderRadius: 14, padding: 22,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Icon size={16} color="#0a0a0a" />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0a0a0a" }}>{label}</p>
              </div>
              <p style={{ fontSize: 13, color: "#71717a", lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: "center", padding: "24px",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        color: "#a1a1aa", fontSize: 12,
      }}>
        Demo build · Next.js · sample data only
      </footer>
    </div>
  );
}
