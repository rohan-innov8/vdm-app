'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemSettingsPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">System Settings</h1>
                        <p className="text-slate-500">Global configurations for BuildPath.</p>
                    </div>
                    <Link href="/">
                        <Button variant="outline">Back to Dashboard</Button>
                    </Link>
                </div>

                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Types</CardTitle>
                            <CardDescription>Configure the dropdown options for project categories.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 italic">Configuration interface coming soon...</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp Integrations</CardTitle>
                            <CardDescription>Manage team phone numbers for automated notifications.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 italic">Configuration interface coming soon...</p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}