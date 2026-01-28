async function checkEndpoints() {
    const url = 'http://localhost:3000/api/status';
    console.log('Checking server status at:', url);
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log('Server is ONLINE:', data);
        } else {
            console.log('Server returned an error:', res.status);
        }
    } catch (error: any) {
        console.log('Server is OFFLINE or unreachable:', error.message);
    }
}

checkEndpoints();
