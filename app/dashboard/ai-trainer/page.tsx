'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const quickActions = [
    { icon: '💪', text: 'Create workout plan', action: 'workout' },
    { icon: '🥗', text: 'Nutrition advice', action: 'nutrition' },
    { icon: '🎯', text: 'Set fitness goal', action: 'goal' },
    { icon: '🏃', text: 'Exercise form tips', action: 'form' },
];

const aiResponses: Record<string, string> = {
    default: "I'm FitGenie, your AI fitness coach! I can help you with workout plans, nutrition advice, form corrections, and achieving your fitness goals. What would you like to know?",
    workout: "Great! Let me create a personalized workout plan for you. Based on your profile (Intermediate level, Weight Loss goal), here's a 4-week plan:\n\n**Week 1-2: Foundation Building**\n• Monday: Upper Body Strength (45 min)\n• Tuesday: HIIT Cardio (30 min)\n• Wednesday: Rest/Yoga\n• Thursday: Lower Body Strength (45 min)\n• Friday: Full Body Circuit (40 min)\n• Weekend: Active Recovery\n\n**Week 3-4: Progressive Overload**\nSame structure but increase weights by 10% and add 5 reps to each set.\n\nShall I send this to your member account?",
    nutrition: "Based on your weight loss goal (target: 75kg from 82kg), here's your nutrition plan:\n\n**Daily Macros:**\n• Calories: 1,800 kcal\n• Protein: 140g (35%)\n• Carbs: 180g (40%)\n• Fats: 50g (25%)\n\n**Sample Meal Plan:**\n🍳 Breakfast: 3 egg whites + oats + banana\n🥗 Lunch: Grilled chicken + brown rice + veggies\n🍎 Snack: Greek yogurt + almonds\n🍗 Dinner: Fish + quinoa + salad\n\n**Supplements:** Whey protein, Omega-3, Multivitamin\n\nWant me to create a 7-day detailed meal plan?",
    goal: "Let me help you set SMART fitness goals!\n\n**Your Current Stats:**\n• Weight: 82 kg\n• Body Fat: 24%\n• Muscle Mass: 58 kg\n\n**Recommended 12-Week Goal:**\n🎯 Weight: 75 kg (-7 kg)\n🎯 Body Fat: 18% (-6%)\n🎯 Muscle: Maintain 58 kg\n\n**To Achieve This:**\n• Train 5 days/week (3 strength + 2 cardio)\n• Maintain 1,800 kcal diet\n• 7-8 hours sleep\n• Track progress every 2 weeks\n\nExpected timeline: 12-14 weeks\nSuccess probability: 87% (based on similar profiles)\n\nShall I create a detailed roadmap?",
    form: "Let me help you perfect your exercise form! Which exercise would you like tips on?\n\n**Popular Corrections:**\n\n🏋️ **Squat Form:**\n• Feet shoulder-width apart\n• Knees track over toes\n• Chest up, core tight\n• Go parallel or below\n• Push through heels\n\n🏋️ **Deadlift:**\n• Bar over mid-foot\n• Hinge at hips first\n• Neutral spine\n• Pull with legs, not back\n• Lock out at top\n\n💪 **Bench Press:**\n• Retract shoulder blades\n• Arch lower back slightly\n• Bar touches chest mid-line\n• Elbows 45° angle\n• Drive through feet\n\nWant video demonstrations or specific corrections?",
};

export default function AITrainerPage() {
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

    const sendMessage = (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: messages.length + 1,
            text: messageText,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const responseKey = Object.keys(aiResponses).find(key =>
                messageText.toLowerCase().includes(key)
            ) || 'default';

            const aiMessage: Message = {
                id: messages.length + 2,
                text: aiResponses[responseKey],
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleQuickAction = (action: string) => {
        const actionTexts: Record<string, string> = {
            workout: 'Create a workout plan for me',
            nutrition: 'Give me nutrition advice',
            goal: 'Help me set fitness goals',
            form: 'Show me exercise form tips',
        };
        sendMessage(actionTexts[action]);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            🤖 AI Fitness Coach
                        </h1>
                        <p className="text-gray-600 mt-1">Your personal AI trainer with comprehensive fitness knowledge</p>
                    </div>
                    <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                        ● Online 24/7
                    </Badge>
                </div>
            </motion.div>

            <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="chat">AI Chat</TabsTrigger>
                    <TabsTrigger value="plans">Workout Plans</TabsTrigger>
                    <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                    <TabsTrigger value="insights">AI Insights</TabsTrigger>
                </TabsList>

                {/* Chat Tab */}
                <TabsContent value="chat" className="space-y-4">
                    <Card className="h-[600px] flex flex-col">
                        <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl">
                                    🤖
                                </div>
                                <div>
                                    <CardTitle>FitGenie AI Coach</CardTitle>
                                    <CardDescription>Powered by advanced fitness AI • Always learning</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        {/* Messages */}
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-lg p-4 ${message.sender === 'user'
                                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                    : 'bg-gray-100 text-gray-900'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-line">{message.text}</p>
                                            <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </CardContent>

                        {/* Quick Actions */}
                        <div className="p-4 border-t bg-gray-50">
                            <p className="text-xs text-gray-600 mb-2">Quick Actions:</p>
                            <div className="grid grid-cols-4 gap-2 mb-3">
                                {quickActions.map((action) => (
                                    <Button
                                        key={action.action}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleQuickAction(action.action)}
                                        className="text-xs"
                                    >
                                        {action.icon} {action.text}
                                    </Button>
                                ))}
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Ask me anything about fitness..."
                                    className="flex-1"
                                />
                                <Button
                                    onClick={() => sendMessage()}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                                >
                                    Send
                                </Button>
                            </div>
                        </div>
                    </Card>
                </TabsContent>

                {/* Workout Plans Tab */}
                <TabsContent value="plans" className="space-y-4">
                    <WorkoutPlansGenerator />
                </TabsContent>

                {/* Nutrition Tab */}
                <TabsContent value="nutrition" className="space-y-4">
                    <NutritionAdvisor />
                </TabsContent>

                {/* AI Insights Tab */}
                <TabsContent value="insights" className="space-y-4">
                    <AIInsights />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function WorkoutPlansGenerator() {
    const [goal, setGoal] = useState('weight_loss');
    const [level, setLevel] = useState('intermediate');
    const [generated, setGenerated] = useState(false);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Generator Form */}
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Generate Plan</CardTitle>
                    <CardDescription>AI-powered workout creation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Fitness Goal</label>
                        <Select value={goal} onValueChange={setGoal}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="strength">Strength</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="text-sm font-medium">Experience Level</label>
                        <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => setGenerated(true)}
                    >
                        🤖 Generate with AI
                    </Button>
                </CardContent>
            </Card>

            {/* Generated Plan */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Your AI-Generated Plan</CardTitle>
                    <CardDescription>Personalized for your goals and level</CardDescription>
                </CardHeader>
                <CardContent>
                    {generated ? (
                        <div className="space-y-4">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, idx) => (
                                <div key={day} className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                                    <h4 className="font-bold text-purple-900">{day}</h4>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {idx % 2 === 0 ? 'Upper Body Strength • 45 min • 8 exercises' : 'Cardio HIIT • 30 min • 6 intervals'}
                                    </p>
                                    <Button variant="outline" size="sm" className="mt-2">View Details</Button>
                                </div>
                            ))}
                            <Button className="w-full bg-green-600">Save to My Plans</Button>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-4xl mb-4">💪</p>
                            <p>Configure your preferences and generate your plan!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function NutritionAdvisor() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Macro Calculator</CardTitle>
                    <CardDescription>AI-optimized nutrition targets</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-3">Your Daily Targets</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-purple-600">1,800</p>
                                    <p className="text-xs text-gray-600">Calories</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">140g</p>
                                    <p className="text-xs text-gray-600">Protein</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">180g</p>
                                    <p className="text-xs text-gray-600">Carbs</p>
                                </div>
                            </div>
                        </div>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                            Generate Meal Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Supplement Recommendations</CardTitle>
                    <CardDescription>Based on your goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { name: 'Whey Protein', dosage: '30g post-workout', priority: 'High' },
                        { name: 'Creatine', dosage: '5g daily', priority: 'High' },
                        { name: 'Omega-3', dosage: '2g daily', priority: 'Medium' },
                        { name: 'Multivitamin', dosage: '1 daily', priority: 'Medium' },
                    ].map((supp) => (
                        <div key={supp.name} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                                <p className="font-medium">{supp.name}</p>
                                <p className="text-xs text-gray-600">{supp.dosage}</p>
                            </div>
                            <Badge className={supp.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                                {supp.priority}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function AIInsights() {
    return (
        <div className="space-y-6">
            <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <CardHeader>
                    <CardTitle>🎯 Your Fitness AI Analysis</CardTitle>
                    <CardDescription>Personalized insights based on your data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-white border border-purple-200 rounded-lg">
                        <h4 className="font-bold text-purple-900 mb-2">📈 Progress Prediction</h4>
                        <p className="text-sm text-gray-700 mb-3">
                            Based on your current trajectory, you'll reach your goal weight of <strong>75kg in 11 weeks</strong> (87% confidence).
                            You're currently losing 0.64 kg/week, which is optimal for sustainable fat loss.
                        </p>
                        <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-700">On Track</Badge>
                            <Badge className="bg-blue-100 text-blue-700">+2% vs Last Month</Badge>
                        </div>
                    </div>

                    <div className="p-4 bg-white border border-blue-200 rounded-lg">
                        <h4 className="font-bold text-blue-900 mb-2">💡 Optimization Opportunities</h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>• Increase protein intake by 20g for better muscle retention</li>
                            <li>• Add 1 extra rest day per week to improve recovery</li>
                            <li>• Your HIIT sessions are optimal - keep current intensity</li>
                        </ul>
                    </div>

                    <div className="p-4 bg-white border border-orange-200 rounded-lg">
                        <h4 className="font-bold text-orange-900 mb-2">⚠️ Injury Risk Assessment</h4>
                        <p className="text-sm text-gray-700">
                            <strong>Low Risk (12%)</strong> - Your current training load is well-balanced.
                            Monitor knee stress during squats. Consider foam rolling quadriceps 3x/week.
                        </p>
                    </div>

                    <div className="p-4 bg-white border border-green-200 rounded-lg">
                        <h4 className="font-bold text-green-900 mb-2">🏆 Achievement Forecast</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>First 5kg lost</span>
                                <Badge className="bg-green-100 text-green-700">Unlocked ✓</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>10kg total weight loss</span>
                                <span className="text-gray-600">In ~8 weeks</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Below 20% body fat</span>
                                <span className="text-gray-600">In ~10 weeks</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
