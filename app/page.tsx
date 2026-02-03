'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Users, BarChart3, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-blue-500/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="border-b border-white/5 backdrop-blur-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                GymFlow AI
              </span>
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
              <Link href="#features" className="hover:text-white transition-colors">Features</Link>
              <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Sign In
              </Link>
              <Button asChild size="sm" className="bg-white text-black hover:bg-neutral-200 rounded-full px-6">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 font-medium mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              v2.0 Now Available with AI Coach
            </motion.div>

            <motion.h1 variants={item} className="text-5xl md:text-7xl font-bold tracking-tight">
              One Platform for <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Owners & Members
              </span>
            </motion.h1>

            <motion.p variants={item} className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              Transform your gym business with AI-powered analytics while engaging your members with personalized health tracking, gamification, and intelligent coaching.
            </motion.p>

            <motion.div variants={item} className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto mt-12 bg-white/5 p-2 rounded-3xl border border-white/10">
              {/* Owner Card */}
              <Link href="/login" className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/5 p-6 text-left hover:border-blue-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Gym Owner</h3>
                  <p className="text-sm text-neutral-400 mb-4">Manage members, revenue, and insights with powerful analytics.</p>
                  <div className="flex items-center text-blue-400 text-sm font-medium">
                    Owner Dashboard <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* Member Card */}
              <Link href="/mobile/login" className="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 border border-white/5 p-6 text-left hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Member App</h3>
                  <p className="text-sm text-neutral-400 mb-4">Track workouts, join challenges, and get AI diet plans.</p>
                  <div className="flex items-center text-emerald-400 text-sm font-medium">
                    Mobile Experience <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 max-w-5xl mx-auto border-t border-white/10 pt-12"
          >
            {[
              { label: 'Total Members', value: '10k+', icon: Users },
              { label: 'Active Gyms', value: '500+', icon: ShieldCheck },
              { label: 'Workouts Tracked', value: '1M+', icon: Activity },
              { label: 'Client Retention', value: '94%', icon: BarChart3 },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="w-6 h-6 text-neutral-500 mb-3" />
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                <span className="text-sm text-neutral-500">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </main>

        <footer className="border-t border-white/5 py-8 text-center text-sm text-neutral-600">
          <p>© {new Date().getFullYear()} GymFlow AI. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
