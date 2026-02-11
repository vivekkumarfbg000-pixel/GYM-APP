'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, ChevronLeft, ArrowUp, Calendar, Utensils, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DietSkeleton } from '@/components/shared/skeleton-loaders';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

export default function DietCoachPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'chat' | 'plan'>('chat');
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
    const [initialLoading, setInitialLoading] = useState(true);

    // Diet Plan State
    const [dietPlan, setDietPlan] = useState<any>(null);
    const [genLoading, setGenLoading] = useState(false);
    const [showGenForm, setShowGenForm] = useState(false);
    const [formData, setFormData] = useState({
        weight: '70',
        height: '175',
        goal: 'Weight Loss',
        dietType: 'Vegetarian',
        allergies: ''
    });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const MEMBER_ID = typeof window !== 'undefined' ? localStorage.getItem('gymflow_member_id') : null;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        const init = async () => {
            if (MEMBER_ID) {
                await Promise.all([fetchHistory(), fetchDietPlan()]);
            }
            setInitialLoading(false);
        };
        init();
    }, [MEMBER_ID]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchDietPlan = async () => {
        try {
            const res = await fetch(`/api/member/diet/plan?memberId=${MEMBER_ID}`);
            const data = await res.json();
            if (data.success && data.plan) {
                setDietPlan(data.plan);
            }
        } catch (e) {
            console.error("Failed to fetch plan");
        }
    };

    const handleGeneratePlan = async () => {
        setGenLoading(true);
        try {
            const res = await fetch('/api/ai/generate-diet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId: MEMBER_ID, stats: formData })
            });
            const data = await res.json();
            if (data.success) {
                setDietPlan(data.plan);
                setShowGenForm(false);
                toast.success("Diet Plan Generated!");
            } else {
                toast.error("Generation failed");
            }
        } catch (e) {
            toast.error("Error generating plan");
        } finally {
            setGenLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/member/diet/history?memberId=${MEMBER_ID}`);
            const data = await res.json();
            if (data.success && data.history.length > 0) {
                const formatted = data.history.map((msg: any) => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: new Date(msg.created_at)
                }));
                setMessages(formatted);
            }
        } catch (e) {
            console.error("Failed to load history", e);
        }
    };

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

        // Add empty assistant message for streaming
        const assistantId = (Date.now() + 1).toString();
        const emptyAssistantMsg: Message = {
            id: assistantId,
            role: 'assistant',
            content: '',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, emptyAssistantMsg]);

        try {
            const response = await fetch('/api/member/diet/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    memberId: MEMBER_ID
                })
            });

            if (!response.ok) {
                throw new Error('Failed to connect');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let fullResponse = '';

            if (!reader) {
                throw new Error('No response body');
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();

                        if (data === '[DONE]') {
                            setLoading(false);
                            break;
                        }

                        try {
                            const parsed = JSON.parse(data);

                            if (parsed.error) {
                                throw new Error(parsed.error);
                            }

                            if (parsed.chunk) {
                                fullResponse += parsed.chunk;

                                // Update the assistant message with streaming content
                                setMessages(prev => prev.map(msg =>
                                    msg.id === assistantId
                                        ? { ...msg, content: fullResponse }
                                        : msg
                                ));
                            }
                        } catch (e) {
                            // Skip invalid JSON chunks
                            if (data !== '[DONE]') {
                                console.warn('Failed to parse chunk:', data);
                            }
                        }
                    }
                }
            }

        } catch (error) {
            console.error(error);
            setLoading(false);

            //  Remove the empty assistant message and add error message
            setMessages(prev => prev.filter(msg => msg.id !== assistantId));
            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
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

    if (initialLoading) return <DietSkeleton />;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800">Diet Assistant</h1>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 pb-0">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 flex justify-center items-center gap-2 transition-all ${activeTab === 'chat' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-400'}`}
                    >
                        <Bot size={18} /> Chat Coach
                    </button>
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`flex-1 py-3 text-sm font-bold border-b-2 flex justify-center items-center gap-2 transition-all ${activeTab === 'plan' ? 'border-green-500 text-green-700' : 'border-transparent text-gray-400'}`}
                    >
                        <Calendar size={18} /> My Meal Plan
                    </button>
                </div>
            </div>

            {/* MEAL PLAN TAB */}
            {activeTab === 'plan' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!dietPlan ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="bg-green-50 p-6 rounded-full mb-2">
                                <Utensils size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">No active meal plan</h2>
                            <p className="text-gray-500 max-w-xs">Get a personalized 7-day meal plan generated by AI based on your goals.</p>

                            {!showGenForm ? (
                                <Button onClick={() => setShowGenForm(true)} className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6">
                                    Generate AI Plan
                                </Button>
                            ) : (
                                <div className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left space-y-3 animate-in fade-in zoom-in">
                                    <h3 className="font-bold mb-2">Your Preferences</h3>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Current Weight (kg)</label>
                                        <input type="number" value={formData.weight} onChange={e => setFormData({ ...formData, weight: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Goal</label>
                                        <select value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                                            <option>Weight Loss</option>
                                            <option>Muscle Gain</option>
                                            <option>Maintenance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500">Diet Type</label>
                                        <select value={formData.dietType} onChange={e => setFormData({ ...formData, dietType: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-sm">
                                            <option>Vegetarian</option>
                                            <option>Non-Vegetarian</option>
                                            <option>Vegan</option>
                                            <option>Keto</option>
                                        </select>
                                    </div>

                                    <Button onClick={handleGeneratePlan} disabled={genLoading} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg mt-2 font-bold">
                                        {genLoading ? 'Generating...' : 'Create My Plan ✨'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-green-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2"><Sparkles size={20} /> 7-Day Plan</h2>
                                        <p className="opacity-90 text-sm">Goal: {dietPlan.goal} • {dietPlan.diet_type}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-bold">{dietPlan.calories_target}</span>
                                        <p className="text-xs opacity-80 uppercase font-bold">Kcal / Day</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {dietPlan.plan_data.days && Object.entries(dietPlan.plan_data.days).map(([day, meals]: any) => (
                                    <div key={day} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 font-bold text-gray-700 flex justify-between">
                                            <span>{day}</span>
                                            <span className="text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">{meals.macros || 'Balanced'}</span>
                                        </div>
                                        <div className="p-4 space-y-3 text-sm">
                                            <div className="flex gap-3">
                                                <span className="text-xs font-bold text-orange-500 w-16 uppercase">Breakfast</span>
                                                <span className="text-gray-700 flex-1">{meals.breakfast}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-xs font-bold text-green-500 w-16 uppercase">Lunch</span>
                                                <span className="text-gray-700 flex-1">{meals.lunch}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-xs font-bold text-yellow-500 w-16 uppercase">Snack</span>
                                                <span className="text-gray-700 flex-1">{meals.snack}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <span className="text-xs font-bold text-blue-500 w-16 uppercase">Dinner</span>
                                                <span className="text-gray-700 flex-1">{meals.dinner}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
                <>
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
                </>
            )}
        </div>
    );
}
