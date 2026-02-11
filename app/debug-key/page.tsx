
'use client';

import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function DebugKeyPage() {
    const [keyInfo, setKeyInfo] = useState<any>(null);

    useEffect(() => {
        // Access internal key property if available or just check known values
        const client = supabase as any;
        const key = client.supabaseKey || 'unknown';

        setKeyInfo({
            keyStart: key.substring(0, 10),
            keyLength: key.length,
            isServiceRole: key.includes('service_role'),
            isHardcodedSafeKey: key.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'),
            url: client.supabaseUrl
        });

        console.log('DEBUG KEY INFO:', {
            keyStart: key.substring(0, 10),
            isServiceRole: key.includes('service_role')
        });
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Supabase Key Debugger</h1>
            <pre className="bg-gray-100 p-4 rounded">
                {JSON.stringify(keyInfo, null, 2)}
            </pre>
            <p className="mt-4">
                If "isHardcodedSafeKey" is true, then the client is using the safe key.
                If "isServiceRole" is true, then the client is using a secret key (BAD).
            </p>
        </div>
    );
}
