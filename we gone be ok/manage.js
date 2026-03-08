// Product management (CRUD) using Firebase Firestore
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import { db } from './config.js';

// Product management (CRUD) using localStorage
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
    const querySnapshot = await getDocs(collection(db, 'products'));
    products = [];
    querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });
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

    if (editingId !== null) {
        await updateDoc(doc(db, 'products', editingId), { name, price, quantity, category, image: imageUrl, description });
        editingId = null;
        document.getElementById('formTitle').textContent = 'Thêm sản phẩm mối';
        document.getElementById('submitBtn').textContent = 'Thêm sản phẩm';
    } else {
        const docRef = await addDoc(collection(db, 'products'), { name, price, quantity, category, image: imageUrl, description });
        products.push({ id: docRef.id, name, price, quantity, category, image: imageUrl, description });
    }

    await loadProducts();
    applyFilters();
    resetForm();
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
    await deleteDoc(doc(db, 'products', id));
    await loadProducts();
    applyFilters();
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
                <button class="btn btn-edit" onclick="editProduct(${p.id})">Sửa</button>
                <button class="btn btn-danger" onclick="deleteProduct(${p.id})">Xóa</button>
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
