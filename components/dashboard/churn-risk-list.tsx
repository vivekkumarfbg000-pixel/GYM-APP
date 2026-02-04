'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { db, DbMember } from '@/lib/supabase';
import { toast } from 'sonner';

export function ChurnRiskList() {
    const [members, setMembers] = useState<DbMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);

    const fetchRiskData = async () => {
        try {
            const data = await db.members.getAtRisk();
            if (data) setMembers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiskData();
    }, []);

    const runAnalysis = async () => {
        setAnalyzing(true);
        try {
            const res = await fetch('/api/ai/predict-churn', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success("AI Analysis Complete", { description: "Risk scores updated." });
                fetchRiskData();
            } else {
                toast.error("Analysis Failed");
            }
        } catch (e) {
            toast.error("Network Error");
        } finally {
            setAnalyzing(false);
        }
    };

    if (loading) return <div className="h-full bg-gray-100 animate-pulse rounded-xl" />;

    return (
        <Card className="h-full border-none shadow-sm flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            At-Risk Members
                        </CardTitle>
                        <CardDescription>High probability of cancellation</CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={runAnalysis}
                        disabled={analyzing}
                        className={analyzing ? "animate-spin" : ""}
                    >
                        <RefreshCw size={16} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
                {members.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        <p>No high-risk members detected.</p>
                        <Button variant="link" onClick={runAnalysis} className="text-blue-600">Run AI Analysis</Button>
                    </div>
                ) : (
                    members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-red-200">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`} />
                                    <AvatarFallback>{member.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{member.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-16 bg-red-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500 rounded-full"
                                                style={{ width: `${member.churn_risk}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-red-600">{member.churn_risk}% Risk</span>
                                    </div>
                                </div>
                            </div>
                            <Button size="icon" variant="ghost" className="text-gray-400 hover:text-blue-600">
                                <ArrowRight size={16} />
                            </Button>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
