'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        churnAlerts: true,
        newSignups: true,
        payments: true,
        lowStock: false,
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-gray-600 mt-1">Manage your gym and platform configurations</p>
            </div>

            <Tabs defaultValue="gym" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="gym">Gym Profile</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="billing">Billing</TabsTrigger>
                </TabsList>

                {/* Gym Profile Tab */}
                <TabsContent value="gym" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Gym Information</CardTitle>
                            <CardDescription>Basic details about your gym</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Gym Name</Label>
                                    <Input defaultValue="FitZone Gym" />
                                </div>
                                <div>
                                    <Label>Manager Name</Label>
                                    <Input defaultValue="Rahul Mehta" />
                                </div>
                            </div>
                            <div>
                                <Label>Address</Label>
                                <Input defaultValue="123 MG Road, Bangalore - 560001" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Phone</Label>
                                    <Input defaultValue="+91 98765 43210" />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input defaultValue="contact@fitzone.com" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label>Opening Time</Label>
                                    <Input defaultValue="05:00 AM" />
                                </div>
                                <div>
                                    <Label>Closing Time</Label>
                                    <Input defaultValue="11:00 PM" />
                                </div>
                                <div>
                                    <Label>Total Capacity</Label>
                                    <Input defaultValue="250" type="number" />
                                </div>
                            </div>
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                                Save Changes
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Plans</CardTitle>
                            <CardDescription>Configure your membership tiers</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: 'Basic Monthly', price: 2999, members: 45 },
                                { name: 'Standard Quarterly', price: 7999, members: 38 },
                                { name: 'Premium Monthly', price: 5999, members: 62 },
                                { name: 'Premium Annual', price: 15999, members: 55 },
                            ].map((plan) => (
                                <div key={plan.name} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-semibold">{plan.name}</p>
                                        <p className="text-sm text-gray-600">{plan.members} active members</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-lg font-bold text-purple-600">₹{plan.price}</p>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                </div>
                            ))}
                            <Button variant="outline" className="w-full">
                                + Add New Plan
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Integrations Tab */}
                <TabsContent value="integrations" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Business API</CardTitle>
                            <CardDescription>Connect your WhatsApp account for automated messaging</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>API Key</Label>
                                <Input placeholder="Enter WhatsApp Business API key" type="password" />
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <Input defaultValue="+91 98765 43210" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-700">● Connected</Badge>
                                <span className="text-sm text-gray-600">Last verified 2 days ago</span>
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700">
                                Verify Connection
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Gateway</CardTitle>
                            <CardDescription>Razorpay integration for online payments</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Razorpay Key ID</Label>
                                <Input placeholder="rzp_live_xxxxx" type="password" />
                            </div>
                            <div>
                                <Label>Razorpay Secret</Label>
                                <Input placeholder="Enter secret key" type="password" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">○ Not Connected</Badge>
                            </div>
                            <Button variant="outline">
                                Connect Razorpay
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Other Integrations</CardTitle>
                            <CardDescription>Available third-party services</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { name: 'Stripe', status: 'Available', icon: '💳' },
                                { name: 'Google Calendar', status: 'Available', icon: '📅' },
                                { name: 'Mailchimp', status: 'Available', icon: '📧' },
                                { name: 'Zoom', status: 'Available', icon: '🎥' },
                            ].map((integration) => (
                                <div key={integration.name} className="flex items-center justify-between p-3 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{integration.icon}</span>
                                        <div>
                                            <p className="font-medium">{integration.name}</p>
                                            <p className="text-xs text-gray-600">{integration.status}</p>
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Alert Preferences</CardTitle>
                            <CardDescription>Choose which notifications you want to receive</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Churn Risk Alerts</p>
                                    <p className="text-sm text-gray-600">Get notified when members are at risk</p>
                                </div>
                                <Switch
                                    checked={notifications.churnAlerts}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, churnAlerts: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">New Member Signups</p>
                                    <p className="text-sm text-gray-600">Receive alerts for new registrations</p>
                                </div>
                                <Switch
                                    checked={notifications.newSignups}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, newSignups: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Payment Notifications</p>
                                    <p className="text-sm text-gray-600">Track successful and failed payments</p>
                                </div>
                                <Switch
                                    checked={notifications.payments}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, payments: checked })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <p className="font-medium">Low Stock Alerts</p>
                                    <p className="text-sm text-gray-600">Product inventory warnings</p>
                                </div>
                                <Switch
                                    checked={notifications.lowStock}
                                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Delivery Channels</CardTitle>
                            <CardDescription>How you want to receive notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📱</span>
                                    <div>
                                        <p className="font-medium">WhatsApp</p>
                                        <p className="text-xs text-gray-600">Active</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">📧</span>
                                    <div>
                                        <p className="font-medium">Email</p>
                                        <p className="text-xs text-gray-600">contact@fitzone.com</p>
                                    </div>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">💬</span>
                                    <div>
                                        <p className="font-medium">SMS</p>
                                        <p className="text-xs text-gray-600">+91 98765 43210</p>
                                    </div>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Billing Tab */}
                <TabsContent value="billing" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                            <CardDescription>Your GymFlow AI subscription</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-2xl font-bold text-purple-900">Professional Plan</h3>
                                        <p className="text-gray-700 mt-1">Up to 500 members • All features included</p>
                                        <div className="flex items-baseline gap-2 mt-4">
                                            <span className="text-4xl font-bold text-purple-600">₹4,999</span>
                                            <span className="text-gray-600">/month</span>
                                        </div>
                                    </div>
                                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                                </div>
                                <div className="mt-6 pt-6 border-t border-purple-200">
                                    <p className="text-sm text-gray-600">Next billing date: <strong>Feb 15, 2026</strong></p>
                                    <div className="flex gap-2 mt-4">
                                        <Button variant="outline">Change Plan</Button>
                                        <Button variant="outline" className="text-red-600">Cancel Subscription</Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing History</CardTitle>
                            <CardDescription>Past invoices and payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    { date: 'Jan 15, 2026', amount: 4999, status: 'Paid', invoice: 'INV-001' },
                                    { date: 'Dec 15, 2025', amount: 4999, status: 'Paid', invoice: 'INV-002' },
                                    { date: 'Nov 15, 2025', amount: 4999, status: 'Paid', invoice: 'INV-003' },
                                ].map((payment) => (
                                    <div key={payment.invoice} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{payment.date}</p>
                                            <p className="text-sm text-gray-600">{payment.invoice}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge className="bg-green-100 text-green-700">{payment.status}</Badge>
                                            <p className="font-bold">₹{payment.amount}</p>
                                            <Button variant="outline" size="sm">Download</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
