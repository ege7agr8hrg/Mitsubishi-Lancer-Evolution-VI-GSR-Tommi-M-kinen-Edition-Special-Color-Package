let products = [];
let editingId = null;
let currentUid = null;

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo event cho form và filter
  const productForm = document.getElementById('productForm');
  if (productForm) {
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProduct();
    });
  }

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  const filterCategory = document.getElementById('filterCategory');
  if (filterCategory) {
    filterCategory.addEventListener('change', applyFilters);
  }

  firebase.auth().onAuthStateChanged(async (user) => {
    if (!user) {
      window.location.href = '../log/reg/login.html';
      return;
    }
    try {
      // Lấy role từ Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      const role = userDoc.exists ? userDoc.data().role : 'user';
      if (role !== 'admin') {
        alert('Bạn không có quyền truy cập trang quản lý.');
        window.location.href = 'index.html';
        return;
      }
      currentUid = user.uid;
      await loadProducts(currentUid);
      renderProductsList();
    } catch (error) {
      console.error('Lỗi kiểm tra quyền:', error);
      alert('Có lỗi xảy ra, vui lòng thử lại.');
      window.location.href = 'index.html';
    }
  });
});

function applyFilters() {
  const term = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const category = document.getElementById('filterCategory')?.value || '';
  let filtered = products;
  if (term) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
  }
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  renderProductsList(filtered);
}

async function loadProducts(uid) {
  if (!uid) {
    products = [];
    return;
  }
  try {
    const querySnapshot = await db.collection('products').where('owner', '==', uid).get();
    products = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    localStorage.setItem('products_' + uid, JSON.stringify(products));
  } catch (error) {
    console.error('Error loading from Firebase:', error);
    const stored = localStorage.getItem('products_' + uid) || localStorage.getItem('products');
    products = stored ? JSON.parse(stored) : [];
  }
}

async function saveProduct() {
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const quantity = parseInt(document.getElementById('productQuantity').value, 10);
  const category = document.getElementById('productCategory').value;
  const imageUrl = document.getElementById('productImage').value.trim();
  const description = document.getElementById('productDescription').value.trim();

  if (!name || isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
    alert('Vui lòng nhập tên, giá và số lượng hợp lệ.');
    return;
  }

  try {
    if (editingId !== null) {
      // Cập nhật sản phẩm
      await db.collection('products').doc(editingId).update({
        name,
        price,
        quantity,
        category,
        image: imageUrl,
        description
      });
      const index = products.findIndex(p => p.id === editingId);
      if (index !== -1) {
        products[index] = { ...products[index], name, price, quantity, category, image: imageUrl, description };
      }
      editingId = null;
      document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
      document.getElementById('submitBtn').textContent = 'Thêm sản phẩm';
    } else {
      // Thêm sản phẩm mới
      const ownerId = currentUid;
      const docRef = await db.collection('products').add({
        name,
        price,
        quantity,
        category,
        image: imageUrl,
        description,
        owner: ownerId
      });
      products.push({
        id: docRef.id,
        name,
        price,
        quantity,
        category,
        image: imageUrl,
        description,
        owner: ownerId
      });
    }
    localStorage.setItem('products_' + currentUid, JSON.stringify(products));
    applyFilters();
    resetForm();
    alert('Sản phẩm đã được lưu!');
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    alert('Lỗi khi lưu: ' + error.message);
    // Fallback local
    if (editingId !== null) {
      const index = products.findIndex(p => p.id === editingId);
      if (index !== -1) {
        products[index] = { ...products[index], name, price, quantity, category, image: imageUrl, description };
      }
      editingId = null;
    } else {
      const newId = Date.now().toString();
      products.push({
        id: newId,
        name,
        price,
        quantity,
        category,
        image: imageUrl,
        description
      });
    }
    localStorage.setItem('products_' + currentUid, JSON.stringify(products));
    applyFilters();
    resetForm();
  }
}

function resetForm() {
  document.getElementById('productForm').reset();
  editingId = null;
  document.getElementById('formTitle').textContent = 'Thêm sản phẩm mới';
  document.getElementById('submitBtn').textContent = 'Thêm sản phẩm';
}

function editProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('productName').value = p.name;
  document.getElementById('productPrice').value = p.price;
  document.getElementById('productCategory').value = p.category || '';
  document.getElementById('productQuantity').value = p.quantity;
  document.getElementById('productImage').value = p.image || '';
  document.getElementById('productDescription').value = p.description || '';
  editingId = id;
  document.getElementById('formTitle').textContent = 'Sửa thông tin';
  document.getElementById('submitBtn').textContent = 'Cập nhật';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteProduct(id) {
  if (!confirm('Xóa sản phẩm này?')) return;
  try {
    await db.collection('products').doc(id).delete();
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products_' + currentUid, JSON.stringify(products));
    applyFilters();
    alert('Đã xóa sản phẩm!');
  } catch (error) {
    console.error('Error deleting:', error);
    alert('Lỗi khi xóa: ' + error.message);
    // Xóa local vẫn thực hiện
    products = products.filter(p => p.id !== id);
    localStorage.setItem('products_' + currentUid, JSON.stringify(products));
    applyFilters();
  }
}

function renderProductsList(list) {
  const items = list || products;
  const el = document.getElementById('products-list');
  if (!items || items.length === 0) {
    el.innerHTML = '<div class="empty-state">Chưa có sản phẩm nào.</div>';
    return;
  }
  el.innerHTML = items.map(p => `
    <div class="product-card">
      <img src="${escapeHtml(p.image || 'https://via.placeholder.com/150')}" alt="${escapeHtml(p.name)}" class="product-image">
      <h3>${escapeHtml(p.name)}</h3>
      <div class="product-price">${Number(p.price).toLocaleString('vi-VN')}đ</div>
      <div class="product-category">${escapeHtml(p.category || 'Chưa phân loại')}</div>
      <div class="product-quantity">Tồn kho: ${p.quantity}</div>
      ${p.description ? `<div class="product-description">${escapeHtml(p.description)}</div>` : ''}
      <div class="product-actions">
        <button class="btn btn-edit" onclick="editProduct('${p.id}')">Sửa</button>
        <button class="btn btn-danger" onclick="deleteProduct('${p.id}')">Xóa</button>
      </div>
    </div>
  `).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>]/g, function(m) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m];
  });
}

function inputshowcase() {
  window.location.href = 'index.html';
}
function inputaccount() {
  window.location.href = 'account.html';
}