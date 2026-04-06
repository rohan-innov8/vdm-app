'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SystemSettingsPage() {
    return (
        // Enforce p-4 (16px) on mobile, sm:p-8 (32px) on desktop
        <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
            {/* max-w-7xl matches the rest of the app, space-y-4 (16px) vertical gap */}
            <div className="max-w-7xl mx-auto space-y-4">

                {/* Stack header on mobile, row on desktop, gap-4 (16px) */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">System Settings</h1>
                        {/* mt-1 (4px) */}
                        <p className="text-slate-500 text-sm sm:text-base mt-1">Global configurations for VDM App.</p>
                    </div>

                    <Link href="/" className="w-full sm:w-auto">
                        {/* h-12 (48px) touch target on mobile */}
                        <Button variant="outline" className="w-full sm:w-auto h-12 sm:h-10 cursor-pointer">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {/* grid gap-4 (16px), split to 2 columns on desktop so cards don't stretch too wide */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="shadow-sm">
                        {/* pb-2 (8px) gap between header and content */}
                        <CardHeader className="pb-2">
                            {/* Styled to match Dashboard KPI headings */}
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                Job Types
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Configure the dropdown options for project categories.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 italic mt-2">Configuration interface coming soon...</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                                WhatsApp Integrations
                            </CardTitle>
                            <CardDescription className="text-xs mt-1">
                                Manage team phone numbers for automated notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-slate-500 italic mt-2">Configuration interface coming soon...</p>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}