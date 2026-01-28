async function testEndpoints() {
    const endpoints = [
        'http://localhost:3000/api/products',
        'http://localhost:3000/api/users',
        'http://localhost:3000/api/status'
    ];

    for (const url of endpoints) {
        try {
            console.log(`Testing ${url}...`);
            const res = await fetch(url);
            console.log(`Status: ${res.status}`);
            if (res.ok) {
                const data = await res.json();
                console.log(`Data length: ${Array.isArray(data) ? data.length : 'N/A'}`);
            } else {
                const text = await res.text();
                console.log(`Error: ${text}`);
            }
        } catch (e) {
            console.error(`Failed to fetch ${url}:`, e.message);
        }
    }
}

testEndpoints();
