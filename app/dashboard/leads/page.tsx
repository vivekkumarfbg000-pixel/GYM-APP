import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Lead {
    id: any;
    name: string;
    phone: string;
    email: string;
    source: string;
    stage: string;
    score: number;
    created_at: string;
    value: number;
    notes?: string;
}

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filterStage, setFilterStage] = useState('all');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // New Lead Form
    const [newLead, setNewLead] = useState({ name: '', phone: '', email: '', source: 'Walk-in' });

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            if (Array.isArray(data)) setLeads(data);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load leads");
        } finally {
            setLoading(false);
        }
    };

    const handleAddLead = async () => {
        if (!newLead.name) return toast.error("Name required");

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead)
            });

            if (res.ok) {
                toast.success("Lead added successfully");
                setIsAddOpen(false);
                setNewLead({ name: '', phone: '', email: '', source: 'Walk-in' });
                fetchLeads();
            } else {
                toast.error("Failed to add lead");
            }
        } catch (e) {
            toast.error("Error creating lead");
        }
    };

    const filteredLeads = filterStage === 'all'
        ? leads
        : leads.filter(l => l.stage === filterStage);

    // Funnel Data (Static for now, could be calculated)
    const funnelData = [
        { stage: 'New Lead', count: leads.filter(l => l.stage === 'New Lead').length, value: leads.filter(l => l.stage === 'New Lead').reduce((a, b) => a + (b.value || 0), 0), color: 'blue' },
        { stage: 'Qualified', count: leads.filter(l => l.stage === 'Qualified').length, value: leads.filter(l => l.stage === 'Qualified').reduce((a, b) => a + (b.value || 0), 0), color: 'orange' },
        { stage: 'Trial', count: leads.filter(l => l.stage === 'Trial').length, value: leads.filter(l => l.stage === 'Trial').reduce((a, b) => a + (b.value || 0), 0), color: 'green' },
        { stage: 'Negotiation', count: leads.filter(l => l.stage === 'Negotiation').length, value: leads.filter(l => l.stage === 'Negotiation').reduce((a, b) => a + (b.value || 0), 0), color: 'yellow' },
        { stage: 'Won', count: leads.filter(l => l.stage === 'Won').length, value: leads.filter(l => l.stage === 'Won').reduce((a, b) => a + (b.value || 0), 0), color: 'emerald' },
    ];

    const sourceAnalytics = [
        { source: 'Instagram Ads', leads: 45, converted: 12, rate: 27 },
        { source: 'Google Ads', leads: 38, converted: 8, rate: 21 },
        { source: 'Referral', leads: 32, converted: 15, rate: 47 },
        { source: 'Walk-in', leads: 28, converted: 10, rate: 36 },
        { source: 'Facebook', leads: 22, converted: 5, rate: 23 },
    ];

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
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Lead Management & Sales Funnel
                        </h1>
                        <p className="text-gray-600 mt-1">Track prospects from inquiry to membership</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        + Add New Lead
                    </Button>
                </div>
            </motion.div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Leads"
                    value={leads.length.toString()}
                    subtitle="All time"
                    trend="+18%"
                    color="blue"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${leads.length > 0 ? Math.round((leads.filter(l => l.stage === 'Won').length / leads.length) * 100) : 0}%`}
                    subtitle="Lead → Member"
                    trend="+5%"
                    color="green"
                />
                <MetricCard
                    title="Pipeline Value"
                    value={`₹${(leads.reduce((a, b) => a + (b.value || 0), 0) / 1000).toFixed(1)}L`}
                    subtitle="Potential revenue"
                    trend="+12%"
                    color="purple"
                />
                <MetricCard
                    title="Avg Lead Score"
                    value={leads.length > 0 ? Math.round(leads.reduce((a, b) => a + (b.score || 0), 0) / leads.length).toString() : '0'}
                    subtitle="AI-calculated"
                    trend="+3"
                    color="orange"
                />
            </div>

            <Tabs defaultValue="pipeline" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
                    <TabsTrigger value="leads">All Leads</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="automation">AI Automation</TabsTrigger>
                </TabsList>

                {/* Pipeline Tab */}
                <TabsContent value="pipeline" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Funnel</CardTitle>
                            <CardDescription>Lead progression through stages</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {funnelData.map((stage, idx) => {
                                    const width = ((stage.count / funnelData[0].count) * 100);
                                    const colorClasses: Record<string, string> = {
                                        blue: 'from-blue-500 to-blue-600',
                                        purple: 'from-purple-500 to-purple-600',
                                        orange: 'from-orange-500 to-orange-600',
                                        green: 'from-green-500 to-green-600',
                                        yellow: 'from-yellow-500 to-yellow-600',
                                        emerald: 'from-emerald-500 to-emerald-600',
                                    };

                                    return (
                                        <div key={idx}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold">{stage.stage}</span>
                                                    <Badge variant="secondary">{stage.count} leads</Badge>
                                                </div>
                                                <span className="text-sm font-semibold text-gray-600">₹{(stage.value / 1000).toFixed(0)}K</span>
                                            </div>
                                            <div
                                                className={`h-12 bg-gradient-to-r ${colorClasses[stage.color]} rounded-lg flex items-center px-4 text-white font-semibold shadow-md`}
                                                style={{ width: `${width}%` }}
                                            >
                                                {width.toFixed(0)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-900">
                                    <strong>💰 Conversion Forecast:</strong> Based on current pipeline, expect ₹23.9K in new revenue this week (3 closes predicted)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* All Leads Tab */}
                <TabsContent value="leads" className="space-y-6">
                    {/* Filter */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex gap-2 items-center">
                                <Input placeholder="Search by name, phone, email..." className="flex-1" />
                                <Select value={filterStage} onValueChange={setFilterStage}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Stages</SelectItem>
                                        <SelectItem value="New Lead">New Lead</SelectItem>
                                        <SelectItem value="Qualified">Qualified</SelectItem>
                                        <SelectItem value="Trial">Trial</SelectItem>
                                        <SelectItem value="Negotiation">Negotiation</SelectItem>
                                        <SelectItem value="Won">Won</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Lead Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {loading && <div className="col-span-2 text-center py-4">Loading leads...</div>}
                        {!loading && filteredLeads.length === 0 && <div className="col-span-2 text-center py-4 text-gray-500">No leads found.</div>}

                        {filteredLeads.map((lead) => (
                            <LeadCard
                                key={lead.id}
                                lead={lead}
                                onView={() => setSelectedLead(lead)}
                            />
                        ))}
                    </div>
                </TabsContent>

                {/* Analytics Tab */}
                <TabsContent value="analytics" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Lead Source Performance</CardTitle>
                            <CardDescription>Conversion rates by source</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {sourceAnalytics.map((source) => (
                                    <div key={source.source}>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-semibold">{source.source}</p>
                                                <p className="text-xs text-gray-600">{source.leads} leads • {source.converted} converted</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-blue-600">{source.rate}%</p>
                                                <p className="text-xs text-gray-600">Conv. Rate</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                style={{ width: `${source.rate}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Best Performing Source</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                                    <p className="text-5xl mb-4">🏆</p>
                                    <p className="text-2xl font-bold text-green-900">Referral</p>
                                    <p className="text-4xl font-bold text-green-600 mt-2">47%</p>
                                    <p className="text-sm text-gray-600 mt-1">Conversion Rate</p>
                                    <Button className="mt-4 bg-green-600">Boost Referral Program</Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Avg Time to Convert</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm">First Contact → Trial</span>
                                        <span className="font-bold text-blue-600">2.3 days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm">Trial → Member</span>
                                        <span className="font-bold text-purple-600">4.5 days</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm">Total Journey</span>
                                        <span className="font-bold text-green-600">6.8 days</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* AI Automation Tab */}
                <TabsContent value="automation" className="space-y-6">
                    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                🤖 AI Follow-Up Automation
                            </CardTitle>
                            <CardDescription>Automated lead nurturing workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-white border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">New Lead Welcome Sequence</h4>
                                        <p className="text-xs text-gray-600">Triggers: When lead is added</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">● Active</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">📱 Day 0: Welcome WhatsApp + Gym tour invite</p>
                                    <p className="text-gray-700">📧 Day 1: Email with class schedule & pricing</p>
                                    <p className="text-gray-700">💬 Day 3: SMS follow-up if no response</p>
                                    <p className="text-gray-700">📞 Day 5: Auto-assign to staff for call</p>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-600">Performance: 45% response rate • 28% trial booking</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">Trial Member Conversion</h4>
                                        <p className="text-xs text-gray-600">Triggers: After 3rd class attendance</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">● Active</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">🎉 Send congratulations message</p>
                                    <p className="text-gray-700">💝 Offer: 15% discount if join within 48h</p>
                                    <p className="text-gray-700">📊 Share personalized progress report</p>
                                    <p className="text-gray-700">💬 Manager follow-up call scheduled</p>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-600">Performance: 62% conversion rate • ₹45K revenue/month</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white border border-purple-200 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-semibold">Cold Lead Re-engagement</h4>
                                        <p className="text-xs text-gray-600">Triggers: No contact for 10+ days</p>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">● Active</Badge>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-700">🎁 Special offer alert via WhatsApp</p>
                                    <p className="text-gray-700">⭐ Share success stories & testimonials</p>
                                    <p className="text-gray-700">🆓 Free 1-day pass reminder</p>
                                    <p className="text-gray-700">📞 Last attempt call by staff</p>
                                </div>
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-600">Performance: 18% re-activation rate</p>
                                </div>
                            </div>

                            <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600">
                                + Create New Automation
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle>🎯 AI Lead Scoring</CardTitle>
                            <CardDescription>Prioritize high-value prospects</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-700 mb-4">
                                Our AI analyzes 12+ factors to score leads from 0-100. Focus on high-scoring leads for maximum conversion ROI.
                            </p>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-3xl font-bold text-green-600">90-100</p>
                                    <p className="text-xs text-gray-600 mt-1">Hot Leads</p>
                                    <p className="text-sm font-semibold mt-2">8 leads</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-3xl font-bold text-yellow-600">70-89</p>
                                    <p className="text-xs text-gray-600 mt-1">Warm Leads</p>
                                    <p className="text-sm font-semibold mt-2">15 leads</p>
                                </div>
                                <div className="text-center p-4 bg-white rounded-lg">
                                    <p className="text-3xl font-bold text-gray-600">0-69</p>
                                    <p className="text-xs text-gray-600 mt-1">Cold Leads</p>
                                    <p className="text-sm font-semibold mt-2">48 leads</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Lead Detail Modal */}
            {selectedLead && (
                <LeadDetailModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                />
            )}
        </div>
    );
}

function LeadCard({ lead, onView }: { lead: Lead; onView: () => void }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-gray-600';
    };

    const getStageColor = (stage: string) => {
        const colors: Record<string, string> = {
            'New Lead': 'bg-blue-100 text-blue-700',
            'Qualified': 'bg-purple-100 text-purple-700',
            'Trial': 'bg-orange-100 text-orange-700',
            'Negotiation': 'bg-yellow-100 text-yellow-700',
            'Won': 'bg-green-100 text-green-700',
        };
        return colors[stage] || 'bg-gray-100 text-gray-700';
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-lg">{lead.name}</h3>
                        <p className="text-sm text-gray-600">{lead.phone}</p>
                        <p className="text-xs text-gray-500">{lead.email}</p>
                    </div>
                    <div className="text-right">
                        <Badge className={getStageColor(lead.stage)}>{lead.stage}</Badge>
                        <p className={`text-2xl font-bold mt-2 ${getScoreColor(lead.score)}`}>{lead.score}</p>
                        <p className="text-xs text-gray-600">AI Score</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                        <p className="text-xs text-gray-600">Source</p>
                        <p className="font-medium">{lead.source}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Value</p>
                        <p className="font-medium text-purple-600">₹{lead.value.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Created</p>
                        <p className="font-medium">{lead.created}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-600">Last Contact</p>
                        <p className="font-medium">{lead.lastContact}</p>
                    </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg mb-4">
                    <p className="text-xs text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm">{lead.notes}</p>
                </div>

                <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                        📱 WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                        📞 Call
                    </Button>
                    <Button size="sm" onClick={onView} className="flex-1 bg-blue-600">
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function LeadDetailModal({ lead, onClose }: { lead: Lead; onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle>{lead.name}</CardTitle>
                            <CardDescription>Lead Details & Activity</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-semibold">{lead.phone}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold">{lead.email}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">Source</p>
                            <p className="font-semibold">{lead.source}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-gray-600">AI Score</p>
                            <p className="font-semibold text-green-600 text-xl">{lead.score}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-semibold mb-3">Activity Timeline</h4>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                    1
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Lead Created</p>
                                    <p className="text-xs text-gray-600">{lead.created} • Source: {lead.source}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                                    2
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Auto WhatsApp Sent</p>
                                    <p className="text-xs text-gray-600">Welcome message delivered</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                                    3
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Last Contact</p>
                                    <p className="text-xs text-gray-600">{lead.lastContact}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600">
                            Move to Next Stage
                        </Button>
                        <Button variant="outline">Edit Lead</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, subtitle, trend, color }: {
    title: string;
    value: string;
    subtitle: string;
    trend: string;
    color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'from-blue-500 to-cyan-500',
        green: 'from-green-500 to-emerald-500',
        purple: 'from-purple-500 to-pink-500',
        orange: 'from-orange-500 to-red-500',
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-3xl font-bold mt-2">{value}</p>
                <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-green-100 text-green-700">
                        ↑ {trend}
                    </Badge>
                    <span className="text-xs text-gray-500">{subtitle}</span>
                </div>
            </CardContent>
        </Card>
    );
}
