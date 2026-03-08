// Product management with Firebase sync and localStorage backup
let products = [];
let editingId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    renderProductsList();
    document.getElementById('productForm').addEventListener('submit', function(e){
        e.preventDefault();
        saveProduct();
    });

    // search box 
    const searchEl = document.getElementById('searchInput');
    if (searchEl) {
        searchEl.addEventListener('input', applyFilters);
    }

    const categoryFilter = document.getElementById('filterCategory');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
});

function applyFilters() {
    const searchEl = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('filterCategory');
    const term = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : '';

    let filtered = products;

    if (term) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(term) ||
            (p.description && p.description.toLowerCase().includes(term))
        );
    }

    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    renderProductsList(filtered);
}

async function loadProducts(){
    try {
        const querySnapshot = await window.db.collection('products').get();
        products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        // Save to localStorage as backup
        localStorage.setItem('products', JSON.stringify(products));
    } catch (error) {
        console.error('Error loading from Firebase:', error);
        // Fallback to localStorage
        const stored = localStorage.getItem('products');
        products = stored ? JSON.parse(stored) : [];
    }
}

async function saveProduct(){
    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value, 10);
    const category = document.getElementById('productCategory').value;
    const imageUrl = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();

    if (!name || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
        alert('Vui lòng nhập tên sản phẩm, giá hợp lệ và số lượng hợp lệ.');
        return;
    }

    try {
        if (editingId !== null) {
            await window.db.collection('products').doc(editingId).update({ name, price, quantity, category, image: imageUrl, description });
            // Update local
            const index = products.findIndex(p => p.id === editingId);
            if (index !== -1) {
                products[index] = { id: editingId, name, price, quantity, category, image: imageUrl, description };
            }
            editingId = null;
            document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
            document.getElementById('submitBtn').textContent = 'Thêm sản phẩm';
        } else {
            const docRef = await window.db.collection('products').add({ name, price, quantity, category, image: imageUrl, description });
            products.push({ id: docRef.id, name, price, quantity, category, image: imageUrl, description });
        }

        localStorage.setItem('products', JSON.stringify(products));
        applyFilters();
        resetForm();
        alert('Sản phẩm đã được lưu thành công!');
    } catch (error) {
        console.error('Error saving to Firebase:', error);
        alert('Lỗi khi lưu sản phẩm: ' + error.message);
        // Still save locally
        if (editingId !== null) {
            const index = products.findIndex(p => p.id === editingId);
            if (index !== -1) {
                products[index] = { id: editingId, name, price, quantity, category, image: imageUrl, description };
            }
            editingId = null;
        } else {
            const newId = Date.now().toString();
            products.push({ id: newId, name, price, quantity, category, image: imageUrl, description });
        }
        localStorage.setItem('products', JSON.stringify(products));
        applyFilters();
        resetForm();
    }
}

function resetForm(){
    document.getElementById('productForm').reset();
    editingId = null;
    document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('submitBtn').textContent = 'Thêm sản phẩm';
}

function editProduct(id){
    const p = products.find(x => x.id === id);
    if (!p) return;
    document.getElementById('productName').value = p.name;
    document.getElementById('productPrice').value = p.price;
    document.getElementById('productCategory').value = p.category || '';
    document.getElementById('productQuantity').value = p.quantity;
    document.getElementById('productImage').value = p.image || '';
    document.getElementById('productDescription').value = p.description;
    editingId = id;
    document.getElementById('formTitle').textContent = 'Sửa thông tin';
    document.getElementById('submitBtn').textContent = 'Cập nhật thông tin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id){
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
        await window.db.collection('products').doc(id).delete();
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        applyFilters();
        alert('Sản phẩm đã được xóa thành công!');
    } catch (error) {
        console.error('Error deleting from Firebase:', error);
        alert('Lỗi khi xóa sản phẩm: ' + error.message);
        // Still delete locally
        products = products.filter(p => p.id !== id);
        localStorage.setItem('products', JSON.stringify(products));
        applyFilters();
    }
}

function renderProductsList(list){
    const items = list || products;
    const el = document.getElementById('products-list');
    if (!items || items.length === 0){
        const msg = (list && list.length === 0)
            ? 'Không có sản phẩm nào phù hợp với từ khóa bạn tìm kiếm.'
            : 'Chưa có sản phẩm nào. Thêm một sản phẩm để bắt đầu.';
        el.innerHTML = `<div class="empty-state">${msg}</div>`;
        return;
    }

    el.innerHTML = items.map(p => {
        const desc = p.description ? `<div class="product-description">${escapeHtml(p.description)}</div>` : '';
        return `
        <div class="product-card">
            <img src="${escapeHtml(p.image || 'https://via.placeholder.com/150')}" alt="${escapeHtml(p.name)}" class="product-image">
            <h3>${escapeHtml(p.name)}</h3>
            <div class="product-price">$${Number(p.price).toFixed(2)}</div>
            <div class="product-category">${escapeHtml(p.category || 'Chưa phân loại')}</div>
            <div class="product-quantity">Stock: ${p.quantity}</div>
            ${desc}
            <div class="product-actions">
                <button class="btn btn-edit" onclick="editProduct('${p.id}')">Sửa</button>
                <button class="btn btn-danger" onclick="deleteProduct('${p.id}')">Xóa</button>
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
