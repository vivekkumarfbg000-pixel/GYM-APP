'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MessageCircle, Bell, Gift, Link as LinkIcon } from 'lucide-react';
import { type Member } from '@/lib/mock-data';
import { exportMembersToCSV } from '@/lib/export-utils';
import { LoadingState, TableSkeleton } from '@/components/shared/loading-state';
import { ErrorState, EmptyState } from '@/components/shared/error-state';

export default function MembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [segmentFilter, setSegmentFilter] = useState<string>('all');
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [viewMode, setViewMode] = useState<'active' | 'pending'>('active');

    const handleApproveMember = async (memberId: string, action: 'approve' | 'reject') => {
        try {
            const res = await fetch('/api/members/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memberId, action })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Member ${action}ed successfully`);
                loadMembers();
            } else {
                toast.error('Action failed');
            }
        } catch (error) {
            toast.error('Error processing request');
        }
    };

    // Form state for adding/editing member
    const [formData, setFormData] = useState<Partial<Member>>({
        name: '',
        email: '',
        phone: '',
        membershipType: 'Basic Monthly',
        segment: 'Regular'
    });

    // Password Reset State
    const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
    const [passwordResetMember, setPasswordResetMember] = useState<Member | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');

    const handleToggleActive = async (memberId: string, currentStatus: boolean, gymOwnerId: string) => {
        try {
            const res = await fetch('/api/member/toggle-active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId,
                    isActive: !currentStatus,
                    gymOwnerId
                })
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Member ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
                loadMembers();
            } else {
                toast.error(data.error || 'Action failed');
            }
        } catch (error) {
            toast.error('Error processing request');
        }
    };

    const handleResetPassword = async () => {
        if (!passwordResetMember) return;

        try {
            // Get gym owner ID from storage (fallback if needed)
            const gymOwnerId = localStorage.getItem('gymflow_owner_id');
            if (!gymOwnerId) {
                toast.error('Authentication error. Please login again.');
                return;
            }

            const res = await fetch('/api/member/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberId: passwordResetMember.id,
                    newPassword: newPassword || undefined,
                    gymOwnerId
                })
            });
            const data = await res.json();

            if (data.success) {
                setGeneratedPassword(data.newPassword);
                toast.success('Password reset successfully');
            } else {
                toast.error(data.error || 'Password reset failed');
            }
        } catch (error) {
            toast.error('Error regarding password reset');
        }
    };

    // Load members from API
    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (segmentFilter && segmentFilter !== 'all') params.append('segment', segmentFilter);

            const response = await fetch(`/api/members?${params.toString()}`);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to fetch members');
            }

            // Map database fields (snake_case) to frontend fields (camelCase)
            const mappedMembers = (result.data || []).map((m: any) => ({
                id: m.id,
                name: m.name,
                email: m.email,
                phone: m.phone || '',
                membershipType: m.membership_type,
                membershipEndDate: m.membership_end_date,
                segment: m.segment,
                joinDate: m.join_date || m.created_at,
                engagementScore: m.engagement_score,
                churnRisk: m.churn_risk,
                checkInFrequency: m.check_in_frequency,
                lastCheckIn: m.last_check_in,
                totalRevenue: m.total_revenue,
                ptSessions: m.pt_sessions,
                approved: m.approved,
                status: m.status,
                isActive: m.is_active !== false // Default to true if undefined
            }));

            setMembers(mappedMembers);
        } catch (err: any) {
            setError(err.message || 'Failed to load members');
            toast.error('Failed to load members');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required');
            return;
        }

        try {
            const response = await fetch('/api/members', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || '',
                    membership_type: formData.membershipType || 'Basic Monthly',
                    membership_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    segment: formData.segment || 'Regular'
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to add member');
            }

            toast.success(`${formData.name} added successfully!`);
            setIsAddDialogOpen(false);
            resetForm();
            loadMembers(); // Reload to get fresh data
        } catch (err: any) {
            toast.error(err.message || 'Failed to add member');
        }
    };

    const handleUpdateMember = async () => {
        if (!selectedMember) return;

        try {
            setMembers(members.map((m: Member) =>
                m.id === selectedMember.id ? { ...m, ...formData } : m
            ));
            toast.success('Member updated successfully!');
            setIsEditMode(false);
            setSelectedMember(null);
            resetForm();
        } catch (err: any) {
            toast.error('Failed to update member');
        }
    };

    const handleDeleteMember = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const response = await fetch(`/api/members?id=${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to delete member');
            }

            toast.success(`${name} deleted successfully`);
            loadMembers(); // Reload to get fresh data
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete member');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            membershipType: 'Basic Monthly',
            segment: 'Regular'
        });
    };

    // Reload when search or filter changes
    useEffect(() => {
        const timer = setTimeout(() => {
            loadMembers();
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery, segmentFilter]);

    const filteredMembers = members.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSegment = segmentFilter === 'all' || member.segment === segmentFilter;

        // View Mode Filter
        const isPending = member.status === 'Pending' || member.approved === false;

        // If viewMode is 'active', show verified members. If 'pending', show unverified.
        // However, we must handle legacy data where approved might be null/undefined -> treat as active for legacy
        // But for NEW logic, false = pending.
        const isActive = member.approved === true || (member.approved === undefined && member.status !== 'Pending');

        const matchesView = viewMode === 'active' ? isActive : !isActive;

        return matchesSearch && matchesSegment && matchesView;
    });

    if (loading && members.length === 0) {
        return <LoadingState message="Loading members..." />;
    }

    if (error && members.length === 0) {
        return <ErrorState message={error} onRetry={loadMembers} />;
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Member Management
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your gym members and track engagement</p>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                            <span className="mr-2">➕</span> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Member</DialogTitle>
                            <DialogDescription>Enter member details below</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                />
                            </div>
                            <div>
                                <Label htmlFor="membership">Membership Type</Label>
                                <Select
                                    value={formData.membershipType}
                                    onValueChange={(value) => setFormData({ ...formData, membershipType: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Basic Monthly">Basic Monthly</SelectItem>
                                        <SelectItem value="Standard Quarterly">Standard Quarterly</SelectItem>
                                        <SelectItem value="Premium Quarterly">Premium Quarterly</SelectItem>
                                        <SelectItem value="Premium Annual">Premium Annual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 pt-4">
                                <Button onClick={handleAddMember} className="flex-1">
                                    Add Member
                                </Button>
                                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setViewMode('active')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'active' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Active Members
                </button>
                <button
                    onClick={() => setViewMode('pending')}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'pending' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pending Approvals
                    {members.filter(m => m.approved === false || m.status === 'Pending').length > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs font-bold">
                            {members.filter(m => m.approved === false || m.status === 'Pending').length}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="max-w-md"
                        />
                        <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Segments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Segments</SelectItem>
                                <SelectItem value="Elite">Elite</SelectItem>
                                <SelectItem value="At-Risk">At-Risk</SelectItem>
                                <SelectItem value="Social">Social</SelectItem>
                                <SelectItem value="Early Bird">Early Bird</SelectItem>
                                <SelectItem value="PT Ready">PT Ready</SelectItem>
                                <SelectItem value="Regular">Regular</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => exportMembersToCSV(filteredMembers)}>
                            <span className="mr-2">📥</span> Export
                        </Button>
                        <Button variant="outline" onClick={loadMembers}>
                            <span className="mr-2">🔄</span> Refresh
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {filteredMembers.length === 0 ? (
                <EmptyState
                    icon="👥"
                    title="No members found"
                    description={searchQuery || segmentFilter !== 'all'
                        ? "Try adjusting your filters"
                        : "Get started by adding your first member"}
                    action={
                        <Button onClick={() => setIsAddDialogOpen(true)}>
                            <span className="mr-2">➕</span> Add First Member
                        </Button>
                    }
                />
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Members ({filteredMembers.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <TableSkeleton rows={5} />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Member</TableHead>
                                        <TableHead>Segment</TableHead>
                                        <TableHead>Engagement</TableHead>
                                        <TableHead>Churn Risk</TableHead>
                                        <TableHead>Check-ins/Week</TableHead>
                                        <TableHead>Last Visit</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredMembers.slice(0, 20).map((member) => (
                                        <TableRow key={member.id} className="cursor-pointer hover:bg-gray-50">
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium flex items-center gap-2">
                                                        {member.name}
                                                        <WhatsAppActions member={member} />
                                                    </p>
                                                    <p className="text-sm text-gray-500">{member.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <SegmentBadge segment={member.segment} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                                                        <div
                                                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                                            style={{ width: `${member.engagementScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-medium">{member.engagementScore}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <RiskBadge risk={member.churnRisk} />
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium">{member.checkInFrequency.toFixed(1)}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(member.lastCheckIn).toLocaleDateString()}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {viewMode === 'pending' ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={(e) => { e.stopPropagation(); handleApproveMember(member.id, 'approve'); }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                                                onClick={(e) => { e.stopPropagation(); handleApproveMember(member.id, 'reject'); }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                                        <span className="sr-only">Open menu</span>
                                                                        <span>⋮</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedMember(member)}>
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => {
                                                                        setPasswordResetMember(member);
                                                                        setIsPasswordResetDialogOpen(true);
                                                                        setGeneratedPassword('');
                                                                        setNewPassword('');
                                                                    }}>
                                                                        Reset Password
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleActive(
                                                                        member.id,
                                                                        member.isActive ?? true,
                                                                        localStorage.getItem('gymflow_owner_id')!
                                                                    )}>
                                                                        {member.isActive ? 'Deactivate Member' : 'Activate Member'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        className="text-red-600 focus:text-red-600"
                                                                        onClick={() => handleDeleteMember(member.id, member.name)}
                                                                    >
                                                                        Delete Member
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Member Detail Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle>{selectedMember.name}</CardTitle>
                                    <p className="text-sm text-gray-500 mt-1">{selectedMember.email}</p>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setSelectedMember(null)}>
                                    ✕
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <InfoItem label="Segment" value={selectedMember.segment} />
                                <InfoItem label="Membership Type" value={selectedMember.membershipType} />
                                <InfoItem label="Engagement Score" value={`${selectedMember.engagementScore}/100`} />
                                <InfoItem label="Churn Risk" value={`${selectedMember.churnRisk}%`} />
                                <InfoItem label="Check-ins/Week" value={selectedMember.checkInFrequency.toFixed(1)} />
                                <InfoItem label="Total Revenue" value={`₹${selectedMember.totalRevenue.toLocaleString()}`} />
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">AI Insights</h4>
                                <div className="space-y-2">
                                    {selectedMember.churnRisk > 60 ? (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm">
                                            <p className="font-medium text-red-900">⚠️ High Churn Risk</p>
                                            <p className="text-red-700 mt-1">Recommend immediate intervention</p>
                                        </div>
                                    ) : selectedMember.segment === 'Elite' ? (
                                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                                            <p className="font-medium text-purple-900">💎 Elite Member</p>
                                            <p className="text-purple-700 mt-1">Great candidate for PT upsell</p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                                            <p className="font-medium text-green-900">✅ Healthy Engagement</p>
                                            <p className="text-green-700 mt-1">Continue current approach</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1">
                                    <span className="mr-2">💬</span> Send Message
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <span className="mr-2">📞</span> Call
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    <span className="mr-2">🎁</span> Send Offer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            {/* Password Reset Dialog */}
            <Dialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reset Password for {passwordResetMember?.name}</DialogTitle>
                        <DialogDescription>
                            Create a new password for this member.
                        </DialogDescription>
                    </DialogHeader>

                    {!generatedPassword ? (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password (Optional)</Label>
                                <Input
                                    id="new-password"
                                    placeholder="Leave blank to auto-generate"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <p className="text-sm text-gray-500">
                                    If left blank, a secure random password will be generated.
                                </p>
                            </div>
                            <Button onClick={handleResetPassword} className="w-full">
                                Reset Password
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                                <p className="text-sm text-green-800 mb-2">Password Reset Successful!</p>
                                <p className="text-2xl font-mono font-bold select-all bg-white p-2 rounded border border-green-100">
                                    {generatedPassword}
                                </p>
                            </div>
                            <p className="text-sm text-center text-gray-600">
                                Please copy this password and share it with the member.
                            </p>
                            <Button onClick={() => setIsPasswordResetDialogOpen(false)} className="w-full">
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

function SegmentBadge({ segment }: { segment: string }) {
    const colors: Record<string, string> = {
        Elite: 'bg-purple-100 text-purple-700',
        'At-Risk': 'bg-red-100 text-red-700',
        Social: 'bg-blue-100 text-blue-700',
        'Early Bird': 'bg-yellow-100 text-yellow-700',
        'PT Ready': 'bg-green-100 text-green-700',
        Regular: 'bg-gray-100 text-gray-700',
    };

    return (
        <Badge variant="secondary" className={colors[segment]}>
            {segment}
        </Badge>
    );
}

function RiskBadge({ risk }: { risk: number }) {
    if (risk > 75) {
        return <Badge variant="destructive">Critical ({risk}%)</Badge>;
    }
    if (risk >= 60) {
        return <Badge variant="default" className="bg-orange-100 text-orange-700">High ({risk}%)</Badge>;
    }
    if (risk > 30) {
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Medium ({risk}%)</Badge>;
    }
    return <Badge variant="secondary" className="bg-green-100 text-green-700">Low ({risk}%)</Badge>;
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="font-medium mt-1">{value}</p>
        </div>
    );
}

function WhatsAppActions({ member }: { member: any }) {
    const openWhatsApp = (type: 'payment' | 'reminder' | 'offer') => {
        if (!member.phone) {
            toast.error('No phone number for member');
            return;
        }

        const phone = member.phone.replace(/\D/g, '');

        let message = '';
        if (type === 'payment') {
            message = `Hi ${member.name}, here is your payment link for the ${member.membershipType} plan: https://gymflow.app/pay/${member.id}. Thanks!`;
        } else if (type === 'reminder') {
            message = `Hi ${member.name}, just a friendly reminder that your gym membership is due for renewal soon. Let us know if you need help! 🏋️‍♂️`;
        } else if (type === 'offer') {
            message = `Hey ${member.name}! 🎉 We have a special 20% discount on PT sessions just for you. Reply 'YES' to claim it!`;
        }

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full"
                    onClick={(e) => e.stopPropagation()}
                >
                    <MessageCircle size={16} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openWhatsApp('payment'); }}>
                    <LinkIcon className="mr-2 h-4 w-4" /> Send Payment Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openWhatsApp('reminder'); }}>
                    <Bell className="mr-2 h-4 w-4" /> Send Reminder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openWhatsApp('offer'); }}>
                    <Gift className="mr-2 h-4 w-4" /> Send Offer
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
