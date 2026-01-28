
async function verifyPersistence() {
    const baseUrl = 'http://localhost:3000/api/products';

    function log(step, msg) {
        console.log(`[${step}] ${msg}`);
    }

    try {
        // 1. Create Product
        log('CREATE', 'Creating test product...');
        const createRes = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Persistence Test Product',
                category: 'Test',
                price: 100,
                stock: 10,
                minStock: 2,
                image_url: ''
            })
        });
        const product = await createRes.json();
        if (!product.id) throw new Error('Failed to create product');
        log('CREATE', `Created product ID: ${product.id}`);

        // 2. Refresh (Fetch)
        log('FETCH', 'Fetching products to verify creation...');
        const fetch1 = await fetch(baseUrl);
        const list1 = await fetch1.json();
        const found1 = list1.find(p => p.id === product.id);
        if (!found1) throw new Error('Product not found after creation');
        log('FETCH', 'Product found in list.');

        // 3. Edit Product
        log('EDIT', 'Updating product price to 200...');
        const updateRes = await fetch(`${baseUrl}/${product.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: 200 })
        });
        const updated = await updateRes.json();
        if (updated.price !== 200) throw new Error('Update response incorrect');
        log('EDIT', 'Update successful.');

        // 4. Refresh (Fetch) - Verify Persistence
        log('FETCH', 'Fetching products to verify update persistence...');
        const fetch2 = await fetch(baseUrl);
        const list2 = await fetch2.json();
        const found2 = list2.find(p => p.id === product.id);
        if (found2.price !== 200) throw new Error(`Persistence failed. Expected price 200, got ${found2.price}`);
        log('FETCH', 'Product persisted with new price.');

        // 5. Delete Product
        log('DELETE', 'Deleting product...');
        const deleteRes = await fetch(baseUrl, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: [product.id] })
        });
        if (!deleteRes.ok) throw new Error('Delete failed');
        log('DELETE', 'Delete successful.');

        // 6. Refresh (Fetch) - Verify Deletion
        log('FETCH', 'Fetching products to verify deletion...');
        const fetch3 = await fetch(baseUrl);
        const list3 = await fetch3.json();
        const found3 = list3.find(p => p.id === product.id);
        if (found3) throw new Error('Product still exists after deletion!');
        log('FETCH', 'Product successfully removed.');

        console.log('\nSUCCESS: All persistence checks passed.');

    } catch (error) {
        console.error('\nFAILURE:', error.message);
    }
}

verifyPersistence();
