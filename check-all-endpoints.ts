async function checkServices() {
    const endpoints = [
        '/api/status',
        '/api/products',
        '/api/services',
        '/api/transactions',
        '/api/stats'
    ];

    for (const endpoint of endpoints) {
        try {
            const res = await fetch(`http://localhost:3000${endpoint}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`[OK] ${endpoint}:`, Array.isArray(data) ? `${data.length} items` : 'Object received');
            } else {
                console.log(`[ERROR] ${endpoint}: ${res.status}`);
            }
        } catch (e: any) {
            console.log(`[FAILED] ${endpoint}: ${e.message}`);
        }
    }
}

checkServices();
