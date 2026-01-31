
async function clearInventory() {
    try {
        console.log('Fetching products...');
        const res = await fetch('http://localhost:3000/api/products');
        const products = await res.json();

        if (!Array.isArray(products) || products.length === 0) {
            console.log('No products found to delete.');
            return;
        }

        const ids = products.map(p => p.id);
        console.log(`Found ${ids.length} products. Deleting...`);

        const deleteRes = await fetch('http://localhost:3000/api/products', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const deleteBody = await deleteRes.json();

        if (deleteRes.ok) {
            console.log('Successfully deleted all products.');
        } else {
            console.error('Failed to delete products:', deleteBody);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

clearInventory();
