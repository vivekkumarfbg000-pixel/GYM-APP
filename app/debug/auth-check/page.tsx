'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export default function AuthCheckPage() {
    const [status, setStatus] = useState<any>({
        envVarPresent: false,
        keyType: 'Unknown',
        connection: 'Pending',
        details: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        let keyType = 'Missing';
        let connection = 'Testing...';
        let details = '';

        if (key) {
            if (key.startsWith('eyJ')) {
                // It's a JWT (likely Anon or Service)
                try {
                    const payload = JSON.parse(atob(key.split('.')[1]));
                    keyType = payload.role === 'anon' ? 'Public/Anon (Correct)' : `Role: ${payload.role} (WARNING: Might be Service Key)`;
                } catch (e) {
                    keyType = 'Invalid JWT format';
                }
            } else if (key.startsWith('sb_')) {
                keyType = 'Secret Token (WARNING: Do NOT use in browser)';
            } else {
                keyType = 'Unknown Format';
            }
        }

        // Test Connection
        if (url && key) {
            try {
                const supabase = createClient(url, key);
                // Try a very simple public query
                const { data, error } = await supabase.from('gym_settings').select('count').limit(1).maybeSingle();

                if (error) {
                    connection = 'Failed';
                    details = error.message;

                    if (error.message.includes('Forbidden') || error.code === '403') {
                        details += ' (This usually means RLS is blocking access or Key is invalid)';
                    }
                } else {
                    connection = 'Success';
                    details = 'Connected to Supabase successfully.';
                }

            } catch (err: any) {
                connection = 'Error';
                details = err.message;
            }
        } else {
            connection = 'Skipped';
            details = 'Missing URL or Key in environment variables.';
        }

        setStatus({
            envVarPresent: !!key,
            keyType,
            connection,
            details
        });
    };

    return (
        <div className="p-8 max-w-2xl mx-auto font-sans">
            <h1 className="text-2xl font-bold mb-6">Supabase Auth Debugger</h1>

            <div className="space-y-4 border p-6 rounded-lg shadow-sm bg-white">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-semibold text-gray-700">Environment Key Present</div>
                    <div>{status.envVarPresent ? '✅ Yes' : '❌ No'}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-semibold text-gray-700">Key Type Check</div>
                    <div className={status.keyType.includes('WARNING') ? 'text-red-600 font-bold' : 'text-green-600'}>
                        {status.keyType}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div className="font-semibold text-gray-700">Connection Test</div>
                    <div className={`font-bold ${status.connection === 'Success' ? 'text-green-600' : 'text-red-600'}`}>
                        {status.connection}
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded text-sm font-mono overflow-auto">
                    {status.details}
                </div>
            </div>

            <div className="mt-6 text-sm text-gray-500">
                <p>Note: This page runs entirely in your browser. It checks if the <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> is correctly configured.</p>
            </div>
        </div>
    );
}
