// Product management (CRUD) using localStorage
let products = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    renderProductsList();
    document.getElementById('productForm').addEventListener('submit', function(e){
        e.preventDefault();
        saveProduct();
    });
});

function loadProducts(){
    const raw = localStorage.getItem('products');
    products = raw ? JSON.parse(raw) : [];
}

function saveProducts(){
    localStorage.setItem('products', JSON.stringify(products));
}

function saveProduct(){
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value, 10);
    const description = document.getElementById('productDescription').value.trim();

    if (!name || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
        alert('Please fill required fields correctly');
        return;
    }

    if (editingId !== null) {
        const idx = products.findIndex(p => p.id === editingId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], name, price, quantity, description };
        }
        editingId = null;
        document.getElementById('formTitle').textContent = 'Add New Product';
        document.getElementById('submitBtn').textContent = 'Add Product';
    } else {
        const newProduct = { id: Date.now(), name, price, quantity, description };
        products.push(newProduct);
    }

    saveProducts();
    renderProductsList();
    resetForm();
}

function resetForm(){
    document.getElementById('productForm').reset();
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add New Product';
    document.getElementById('submitBtn').textContent = 'Add Product';
}

function editProduct(id){
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('productName').value = p.name;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productQuantity').value = p.quantity;
    document.getElementById('productDescription').value = p.description;
    editingId = id;
    document.getElementById('formTitle').textContent = 'Edit Product';
    document.getElementById('submitBtn').textContent = 'Update Product';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteProduct(id){
    if (!confirm('Delete this product?')) return;
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProductsList();
}

function renderProductsList(){
    const el = document.getElementById('products-list');
    if (!products || products.length === 0){
        el.innerHTML = '<div class="empty-state">No products yet. Add one to get started.</div>';
        return;
    }

    el.innerHTML = products.map(p => {
        const desc = p.description ? `<div class="product-description">${escapeHtml(p.description)}</div>` : '';
        return `
        <div class="product-card">
            <h3>${escapeHtml(p.name)}</h3>
            <div class="product-price">$${Number(p.price).toFixed(2)}</div>
            <div class="product-quantity">Stock: ${p.quantity}</div>
            ${desc}
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        </div>
        `;
    }).join('');
}

function escapeHtml(text){
    if (!text) return '';
    return String(text).replace(/[&<>"']/g, function(m){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];
    });
}
