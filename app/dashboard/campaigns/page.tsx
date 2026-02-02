'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockMembers, type Campaign } from '@/lib/mock-data';
import { LoadingState, TableSkeleton } from '@/components/shared/loading-state';
import { ErrorState, EmptyState } from '@/components/shared/error-state';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('active');

    // Form state
    const [campaignName, setCampaignName] = useState('');
    const [selectedSegment, setSelectedSegment] = useState('At-Risk');
    const [messageTemplate, setMessageTemplate] = useState('');
    const [generatingAI, setGeneratingAI] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const segments = ['Elite', 'At-Risk', 'Social', 'Early Bird', 'PT Ready', 'Regular'];

    // Calculate segment member counts
    const segmentCounts: Record<string, number> = {};
    segments.forEach(seg => {
        segmentCounts[seg] = mockMembers.filter(m => m.segment === seg).length * 25;
    });

    // Load campaigns from API
    useEffect(() => {
        loadCampaigns();
    }, []);

    const loadCampaigns = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/campaigns');
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch campaigns');
            }

            // Map database fields to frontend fields
            const mappedCampaigns = (result.data || []).map((c: any) => ({
                id: c.id,
                name: c.name,
                segment: c.segment,
                messageTemplate: c.message_template,
                status: c.status,
                responseRate: c.response_rate,
                revenue: c.revenue,
                sentDate: c.sent_date
            }));

            setCampaigns(mappedCampaigns);
        } catch (err: any) {
            setError(err.message || 'Failed to load campaigns');
            toast.error('Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    };

    const generateAIMessage = () => {
        setGeneratingAI(true);
        toast.info('Generating AI message...');

        setTimeout(() => {
            const templates: Record<string, string> = {
                'At-Risk': `Hi {name}! 👋 We've missed seeing you at the gym. Your fitness journey matters to us! Come back this week and get 25% off your next renewal. Let's crush those goals together! 💪`,
                'Elite': `Hey {name}! 🌟 You're crushing it! As one of our top members, we'd love to offer you an exclusive 20% off on personal training packages. Ready to take it to the next level?`,
                'PT Ready': `Hi {name}! We noticed you've been super consistent with your workouts. How about a FREE PT consultation this week? Let's create a personalized plan just for you! 💪`,
                'Early Bird': `Good morning {name}! ☀️ Love your dedication to morning workouts! We're offering 20% off all PT sessions booked before 8 AM. Interested?`,
                'Social': `Hey {name}! 🎉 Join us for our new group fitness challenge! Team up with friends, stay motivated, and win exciting prizes. Sign up today!`,
                'Regular': `Hi {name}! Thanks for being an awesome member. We'd love your feedback to make your gym experience even better. Got 2 minutes for a quick survey?`,
            };
            setMessageTemplate(templates[selectedSegment] || templates['Regular']);
            setGeneratingAI(false);
            toast.success('AI message generated!');
        }, 1500);
    };

    const handleCreateCampaign = async () => {
        if (!campaignName || !messageTemplate) {
            toast.error('Campaign name and message template are required');
            return;
        }

        try {
            const response = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignName,
                    segment: selectedSegment,
                    message_template: messageTemplate,
                    status: 'draft'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to create campaign');
            }

            toast.success(`Campaign "${campaignName}" created successfully!`);

            // Reset form
            setCampaignName('');
            setMessageTemplate('');
            setIsCreateDialogOpen(false);
            loadCampaigns(); // Reload to get fresh data
        } catch (err: any) {
            toast.error(err.message || 'Failed to create campaign');
        }
    };

    const handleLaunchCampaign = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to launch "${name}"? This will send messages to all members in the segment.`)) return;

        try {
            const response = await fetch('/api/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    status: 'active'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to launch campaign');
            }

            toast.success(`Campaign "${name}" launched successfully!`);
            loadCampaigns();
        } catch (err: any) {
            toast.error(err.message || 'Failed to launch campaign');
        }
    };

    const handlePauseCampaign = async (id: string, name: string) => {
        try {
            const response = await fetch('/api/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    status: 'completed'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to pause campaign');
            }

            toast.success(`Campaign "${name}" paused`);
            loadCampaigns();
        } catch (err: any) {
            toast.error(err.message || 'Failed to pause campaign');
        }
    };

    const handleDeleteCampaign = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const response = await fetch(`/api/campaigns?id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to delete campaign');
            }

            toast.success(`Campaign "${name}" deleted`);
            loadCampaigns();
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete campaign');
        }
    };

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const draftCampaigns = campaigns.filter(c => c.status === 'draft');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');

    if (loading && campaigns.length === 0) {
        return <LoadingState message="Loading campaigns..." />;
    }

    if (error && campaigns.length === 0) {
        return <ErrorState message={error} onRetry={loadCampaigns} />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Campaign Manager
                    </h1>
                    <p className="text-gray-600 mt-1">Create and manage targeted campaigns with AI</p>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                            <span className="mr-2">✨</span> Create Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Campaign</DialogTitle>
                            <DialogDescription>Use AI to generate personalized campaigns for each segment</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="campaign-name">Campaign Name</Label>
                                <Input
                                    id="campaign-name"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    placeholder="e.g., January Retention Campaign"
                                />
                            </div>

                            <div>
                                <Label>Target Segment</Label>
                                <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {segments.map(seg => (
                                            <SelectItem key={seg} value={seg}>
                                                {seg} ({segmentCounts[seg]} members)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="message">Message Template</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={generateAIMessage}
                                        disabled={generatingAI}
                                    >
                                        {generatingAI ? (
                                            <>
                                                <span className="mr-2 inline-block animate-spin">⚡</span>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-2">🤖</span> Generate AI Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <Textarea
                                    id="message"
                                    value={messageTemplate}
                                    onChange={(e) => setMessageTemplate(e.target.value)}
                                    placeholder="Type your message or generate with AI..."
                                    rows={5}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use {'{name}'} for member's name personalization
                                </p>
                            </div>

                            {/* Preview */}
                            {messageTemplate && (
                                <div className="p-4 bg-gray-50 rounded-lg border">
                                    <p className="text-sm font-medium mb-2">📱 Preview</p>
                                    <p className="text-sm text-gray-700">
                                        {messageTemplate.replace('{name}', 'John Doe')}
                                    </p>
                                </div>
                            )}

                            {/* AI Predictions */}
                            {messageTemplate && (
                                <div className="grid grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                                    <div>
                                        <p className="text-xs text-purple-600 font-medium">AI Predicted Response Rate</p>
                                        <p className="text-2xl font-bold text-purple-700">
                                            {selectedSegment === 'Elite' ? '18.5%' : selectedSegment === 'At-Risk' ? '12.3%' : '15.2%'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-purple-600 font-medium">Estimated Revenue</p>
                                        <p className="text-2xl font-bold text-purple-700">
                                            ₹{(segmentCounts[selectedSegment] * (selectedSegment === 'Elite' ? 450 : 350) / 1000).toFixed(0)}K
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleCreateCampaign} className="flex-1">
                                    Create Campaign
                                </Button>
                                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="active">
                        Active ({activeCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="drafts">
                        Drafts ({draftCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Completed ({completedCampaigns.length})
                    </TabsTrigger>
                    <TabsTrigger value="all">
                        All ({campaigns.length})
                    </TabsTrigger>
                </TabsList>

                {/* Active Campaigns */}
                <TabsContent value="active" className="space-y-4">
                    {activeCampaigns.length === 0 ? (
                        <EmptyState
                            icon="📢"
                            title="No active campaigns"
                            description="Launch a draft campaign to get started"
                            action={
                                <Button onClick={() => setActiveTab('drafts')}>
                                    View Drafts
                                </Button>
                            }
                        />
                    ) : (
                        activeCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onPause={handlePauseCampaign}
                                onDelete={handleDeleteCampaign}
                            />
                        ))
                    )}
                </TabsContent>

                {/* Draft Campaigns */}
                <TabsContent value="drafts" className="space-y-4">
                    {draftCampaigns.length === 0 ? (
                        <EmptyState
                            icon="✍️"
                            title="No draft campaigns"
                            description="Create a new campaign to get started"
                            action={
                                <Button onClick={() => setIsCreateDialogOpen(true)}>
                                    <span className="mr-2">✨</span> Create Campaign
                                </Button>
                            }
                        />
                    ) : (
                        draftCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onLaunch={handleLaunchCampaign}
                                onDelete={handleDeleteCampaign}
                            />
                        ))
                    )}
                </TabsContent>

                {/* Completed Campaigns */}
                <TabsContent value="completed" className="space-y-4">
                    {completedCampaigns.length === 0 ? (
                        <EmptyState
                            icon="✅"
                            title="No completed campaigns"
                            description="Completed campaigns will appear here"
                        />
                    ) : (
                        completedCampaigns.map(campaign => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                onDelete={handleDeleteCampaign}
                            />
                        ))
                    )}
                </TabsContent>

                {/* All Campaigns */}
                <TabsContent value="all" className="space-y-4">
                    {campaigns.map(campaign => (
                        <CampaignCard
                            key={campaign.id}
                            campaign={campaign}
                            onLaunch={campaign.status === 'draft' ? handleLaunchCampaign : undefined}
                            onPause={campaign.status === 'active' ? handlePauseCampaign : undefined}
                            onDelete={handleDeleteCampaign}
                        />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function CampaignCard({
    campaign,
    onLaunch,
    onPause,
    onDelete
}: {
    campaign: Campaign;
    onLaunch?: (id: string, name: string) => void;
    onPause?: (id: string, name: string) => void;
    onDelete: (id: string, name: string) => void;
}) {
    const messagesSent = campaign.status === 'draft'
        ? 0
        : mockMembers.filter(m => m.segment === campaign.segment).length * 25;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>
                            Segment: {campaign.segment}
                            {campaign.sentDate && ` • Sent: ${new Date(campaign.sentDate).toLocaleDateString()}`}
                        </CardDescription>
                    </div>
                    <StatusBadge status={campaign.status} />
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Metrics (only for active/completed) */}
                {campaign.status !== 'draft' && (
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Response Rate</p>
                            <p className="text-2xl font-bold text-green-600">{campaign.responseRate}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Revenue Generated</p>
                            <p className="text-2xl font-bold">₹{(campaign.revenue / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Messages Sent</p>
                            <p className="text-2xl font-bold">{messagesSent}</p>
                        </div>
                    </div>
                )}

                {/* Message Template */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Message Template:</p>
                    <p className="text-sm text-gray-600">{campaign.messageTemplate}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {onLaunch && (
                        <Button
                            onClick={() => onLaunch(campaign.id, campaign.name)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600"
                        >
                            <span className="mr-2">🚀</span> Launch Campaign
                        </Button>
                    )}
                    {onPause && (
                        <Button
                            variant="outline"
                            onClick={() => onPause(campaign.id, campaign.name)}
                        >
                            <span className="mr-2">⏸</span> Pause
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className="ml-auto text-red-600 hover:text-red-700"
                        onClick={() => onDelete(campaign.id, campaign.name)}
                    >
                        <span className="mr-2">🗑</span> Delete
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: Campaign['status'] }) {
    const styles = {
        draft: 'bg-gray-100 text-gray-700',
        active: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700'
    };

    const labels = {
        draft: 'Draft',
        active: 'Active',
        completed: 'Completed'
    };

    return (
        <Badge className={styles[status]}>
            {labels[status]}
        </Badge>
    );
}
