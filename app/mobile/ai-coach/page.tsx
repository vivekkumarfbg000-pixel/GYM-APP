'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Sparkles, User, Bot, Zap, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const quickActions = [
    { icon: '💪', text: 'Workout Plan', action: 'workout' },
    { icon: '🥗', text: 'Diet Advice', action: 'nutrition' },
    { icon: '🎯', text: 'Set Goals', action: 'goal' },
    { icon: '🏃', text: 'Form Tips', action: 'form' },
];

const aiResponses: Record<string, string> = {
    default: "I'm FitGenie, your personal AI coach. I can design workouts, fix your form, or plan your meals. What's your focus today?",
    workout: "I can build a custom plan. Tell me: \n1. Update goal (Muscle/Fat Loss)?\n2. Days per week available?\n3. Any injuries?",
    nutrition: "Nutrition is 70% of the game! Based on your profile, I recommend:\n• 2400 kcal/day\n• 180g Protein\n• 250g Carbs\n\nWant a sample meal plan?",
    goal: "Let's lock in a target. \nCurrent: 78kg\nTarget: 85kg (Muscle Gain)\n\nTo hit this in 12 weeks, we need to up your volume by 15%. Ready to see the roadmap?",
    form: "Form is key! Upload a video or tell me which exercise feels 'off'. (Squat, Deadlift, Bench)?",
};

export default function AICoachPage() {
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: aiResponses.default,
            sender: 'ai',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const sendMessage = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    context: { /* Add user context here later if needed */ }
                })
            });
            const data = await res.json();

            const aiMessage: Message = {
                id: Date.now() + 1,
                text: data.response || "Sorry, I couldn't process that.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "I'm having network trouble. Please try again.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 z-10 sticky top-0">
                <div className="px-4 py-3 flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="font-bold text-lg text-gray-900">FitGenie AI</h1>
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <Sparkles size={8} /> PRO
                            </span>
                        </div>
                        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Online & Ready
                        </p>
                    </div>
                    <div className="w-9 h-9 bg-purple-50 rounded-full flex items-center justify-center border border-purple-100">
                        <Bot size={18} className="text-purple-600" />
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-purple-200 mx-auto mb-3">
                        🤖
                    </div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Personal Coach</p>
                </div>

                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm relative ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <p className={`text-[10px] mt-2 text-right opacity-70 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                                    }`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm p-4 shadow-sm flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Quick Actions & Input */}
            <div className="bg-white border-t border-gray-100 p-4 pb-8 safe-area-pb">
                {/* Quick Chips */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                    {quickActions.map((action) => (
                        <button
                            key={action.action}
                            onClick={() => sendMessage(action.text)}
                            className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-all text-xs font-medium text-gray-700 px-3 py-2 rounded-xl whitespace-nowrap border border-gray-200"
                        >
                            <span>{action.icon}</span>
                            {action.text}
                        </button>
                    ))}
                </div>

                {/* Input Bar */}
                <div className="flex gap-2 items-end">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Ask FitGenie..."
                            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim()}
                        className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200 active:scale-95 transition-all"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
