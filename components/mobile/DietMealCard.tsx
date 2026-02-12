'use client';

import { ChevronDown, ChevronUp, Utensils } from 'lucide-react';
import { useState } from 'react';

interface DietMealCardProps {
    day: string;
    meals: {
        macros?: string;
        breakfast: string;
        lunch: string;
        snack: string;
        dinner: string;
    };
    isToday?: boolean;
}

export function DietMealCard({ day, meals, isToday }: DietMealCardProps) {
    const [isExpanded, setIsExpanded] = useState(isToday || false);

    return (
        <div className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isToday
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-emerald-100 shadow-md'
                : 'bg-white border-gray-100 shadow-sm'
            }`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-5 flex items-center justify-between"
            >
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-lg ${isToday ? 'text-green-800' : 'text-gray-900'}`}>{day}</h3>
                        {isToday && (
                            <span className="bg-green-200 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Today
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 bg-white/50 px-2 py-1 rounded-lg border border-gray-100/50">
                        {meals.macros || 'Balanced'}
                    </span>
                    {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                </div>
            </button>

            {isExpanded && (
                <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-white/60 rounded-2xl p-1 space-y-1">
                        <MealRow label="Breakfast" color="text-orange-500" food={meals.breakfast} />
                        <MealRow label="Lunch" color="text-green-500" food={meals.lunch} />
                        <MealRow label="Snack" color="text-indigo-500" food={meals.snack} />
                        <MealRow label="Dinner" color="text-blue-500" food={meals.dinner} />
                    </div>
                </div>
            )}
        </div>
    );
}

function MealRow({ label, color, food }: { label: string, color: string, food: string }) {
    return (
        <div className="flex gap-3 p-3 rounded-xl hover:bg-white transition-colors">
            <span className={`text-xs font-bold uppercase tracking-wider ${color} w-20 pt-0.5`}>{label}</span>
            <span className="text-sm text-gray-700 font-medium leading-relaxed">{food}</span>
        </div>
    );
}
