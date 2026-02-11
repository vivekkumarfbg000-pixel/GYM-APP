const BASE_URL = 'http://localhost:3000';

async function runLoadTest() {
    console.log('🚀 Starting Load Test...');

    // Test 1: Simulate 20 concurrent concurrent member lookups (Read Heavy)
    console.log('\nTesting Member Search (Read Heavy)...');
    const searchStart = Date.now();
    const searchPromises = Array.from({ length: 20 }).map((_, i) =>
        fetch(`${BASE_URL}/api/members?query=test`).then(res => res.status)
    );

    const searchResults = await Promise.all(searchPromises);
    const searchTime = Date.now() - searchStart;
    const searchSuccess = searchResults.filter(s => s === 200).length;

    console.log(`✅ Completed 20 searches in ${searchTime}ms`);
    console.log(`success Rate: ${searchSuccess}/20`);

    // Test 2: Simulate 10 concurrent Check-Ins (Write Heavy)
    // We'll use a fake member ID, expecting 404 or 400, but testing server concurrency handling
    console.log('\nTesting Check-Ins (Write Heavy)...');
    const checkInStart = Date.now();
    const checkInPromises = Array.from({ length: 10 }).map((_, i) =>
        fetch(`${BASE_URL}/api/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                memberId: '00000000-0000-0000-0000-000000000000',
                type: 'check-in',
                gymId: '00000000-0000-0000-0000-000000000000'
            })
        }).then(res => res.status)
    );

    const checkInResults = await Promise.all(checkInPromises);
    const checkInTime = Date.now() - checkInStart;
    // We expect 400 or 404 or 500, but as long as it returns, the server handled it.
    const handled = checkInResults.filter(s => s !== 504 && s !== 502).length;

    console.log(`✅ Completed 10 check-in attempts in ${checkInTime}ms`);
    console.log(`Handled Requests: ${handled}/10 (Non-Gateway Errors)`);
    console.log('Status Codes:', checkInResults);
}

// Give server a moment to start
setTimeout(runLoadTest, 5000);
