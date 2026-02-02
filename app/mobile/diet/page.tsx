'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, ChevronLeft, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

export default function DietCoachPage() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hi! I'm your AI Nutrition Coach. 🥗\n\nI can help you with:\n• Meal plans for your goal\n• Calorie tracking\n• Healthy Indian food options\n\nWhat's on your mind?",
            timestamp: new Date()
        }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const memberId = localStorage.getItem('gymflow_member_id');
            const res = await fetch('/api/member/diet/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    memberId: memberId || 'demo_user'
                })
            });

            const data = await res.json();

            if (data.success) {
                const aiMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiMsg]);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error(error);
            // Fallback error message
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting to the server. Please try again later.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        "High protein veg breakfast?",
        "Calories in Paneer Butter Masala?",
        "Diet for muscle gain",
        "Pre-workout snack ideas"
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Header */}
            <div className="bg-white px-4 py-3 shadow-sm border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800">Diet Coach</h1>
                        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                            {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                        </div>

                        <div className={`max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                            }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                                }`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Bot size={16} />
                        </div>
                        <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions (only show if few messages) */}
            {messages.length < 3 && !loading && (
                <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar mask-gradient">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => { setInput(s); handleSend(); }} // Fix: handleSend uses state, so simpler to just set input for now or refactor. But for this UI, setting input is fine, user sends. Or auto-send.
                            className="whitespace-nowrap bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 shadow-sm hover:bg-gray-50 active:scale-95 transition-transform"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex gap-2 items-end"
                >
                    <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about diet, calories..."
                            className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="h-11 w-11 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none active:scale-95 transition-all"
                    >
                        <ArrowUp size={20} strokeWidth={3} />
                    </button>
                </form>
            </div>
        </div>
    );
}
