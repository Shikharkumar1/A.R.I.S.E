'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileAudio, Brain, CheckCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090040] via-[#471396] to-[#090040] text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="text-4xl font-black tracking-tight text-white group-hover:text-[#FFCC00] transition-colors duration-300">A.R.I.S.E</span>
        </Link>
        <nav>
          <Link href="/dashboard" className="bg-[#B13BFF] hover:bg-[#FFCC00] hover:text-[#090040] backdrop-blur-sm text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#FFCC00]/50">
            Try It Now
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-6">
        {/* Hero Section */}
        <section className="py-32 text-center max-w-5xl mx-auto">
          <motion.div
            className="mb-4"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm font-medium tracking-widest text-white/60 uppercase">
              Automated Recovery of Insight and Structured Execution
            </span>
          </motion.div>
          <motion.h1
            className="text-6xl md:text-7xl font-light mb-8 text-white leading-tight"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Your meetings,
            <br />
            <span className="font-normal">intelligently organized</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-white/70 font-light max-w-3xl mx-auto"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Transform audio into actionable insights with AI-powered transcription and analysis
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-4"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/dashboard" className="group bg-[#FFCC00] text-[#090040] hover:bg-white font-bold py-4 px-10 rounded-lg text-lg transition-all duration-300 flex items-center gap-2 transform hover:scale-105 hover:shadow-xl hover:shadow-[#FFCC00]/50">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileAudio, title: "Upload Audio", description: "Drop your meeting recording and let AI do the work" },
              { icon: Brain, title: "AI Analysis", description: "Advanced processing extracts key insights instantly" },
              { icon: CheckCircle, title: "Get Insights", description: "Access organized tasks, decisions, and action items" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#B13BFF]/30 hover:border-[#B13BFF] hover:bg-white/10 hover:shadow-lg hover:shadow-[#B13BFF]/20 transition-all duration-300 transform hover:-translate-y-1"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <step.icon className="w-10 h-10 mb-4 text-[#B13BFF]" strokeWidth={1.5} />
                <h3 className="text-xl font-medium mb-3 text-white">{step.title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 max-w-6xl mx-auto pb-32">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Save Time", description: "Automatically extract key information from your meetings" },
              { title: "Increase Productivity", description: "Focus on action items and decisions, not note-taking" },
              { title: "Never Miss a Detail", description: "Capture every important point with AI-powered analysis" },
              { title: "Easy Collaboration", description: "Share meeting insights with your team effortlessly" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-[#471396]/30 hover:border-[#FFCC00] hover:bg-white/10 hover:shadow-lg hover:shadow-[#FFCC00]/20 transition-all duration-300 transform hover:-translate-y-1"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <h3 className="text-xl font-medium mb-3 text-[#FFCC00]">{benefit.title}</h3>
                <p className="text-white/60 font-light leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6 text-center text-white/40 font-light">
          <p>&copy; 2025 A.R.I.S.E. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}