// Slider (giữ nguyên)
const slides = document.querySelector(".slides");
const slide = document.querySelectorAll(".slide");
const next = document.querySelector(".next");
const prev = document.querySelector(".prev");
const dotsContainer = document.querySelector(".dots");
let index = 0;

slide.forEach((_, i) => {
  let dot = document.createElement("span");
  dot.addEventListener("click", () => goToSlide(i));
  dotsContainer.appendChild(dot);
});
const dots = document.querySelectorAll(".dots span");

function updateSlider() {
  slides.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach(d => d.classList.remove("active"));
  dots[index].classList.add("active");
}
function nextSlide() {
  index++;
  if (index >= slide.length) index = 0;
  updateSlider();
}
function prevSlide() {
  index--;
  if (index < 0) index = slide.length - 1;
  updateSlider();
}
function goToSlide(i) {
  index = i;
  updateSlider();
}
next.onclick = nextSlide;
prev.onclick = prevSlide;
updateSlider();
setInterval(nextSlide, 5000);

// State
let allProducts = [];
let currentCategory = "all";
let searchTerm = "";

// DOM elements
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("searchInput");
const filterBtns = document.querySelectorAll(".filter-btn");

// Helper: format price
function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Helper: escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Render products based on filters
function renderProducts() {
  let filtered = [...allProducts];

  // Filter by category
  if (currentCategory !== "all") {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Filter by search term
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }

  if (!filtered.length) {
    productGrid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Không tìm thấy sản phẩm phù hợp.</p>";
    return;
  }

  productGrid.innerHTML = filtered.map(p => `
    <div class="product-card" data-id="${p.id}">
      <img src="${escapeHtml(p.image || 'https://via.placeholder.com/150')}" alt="${escapeHtml(p.name)}">
      <h3>${escapeHtml(p.name)}</h3>
      <div class="price">${formatPrice(p.price)}đ</div>
      <div class="category-tag">${escapeHtml(p.category || 'Chưa phân loại')}</div>
      <button class="buy" data-id="${p.id}">Mua ngay</button>
    </div>
  `).join('');
}

// Load products from Firestore
function loadProducts() {
  console.log("Đang load sản phẩm...");
  db.collection("products").get().then(snapshot => {
    allProducts = [];
    snapshot.forEach(doc => {
      allProducts.push({ id: doc.id, ...doc.data() });
    });
    console.log("Số lượng sản phẩm từ Firestore:", allProducts.length);
    renderProducts();
  }).catch(err => {
    console.error("Lỗi load sản phẩm:", err);
    productGrid.innerHTML = "<p>Lỗi tải sản phẩm. Vui lòng thử lại sau.</p>";
  });
}

// Event listeners for filters
searchInput.addEventListener("input", (e) => {
  searchTerm = e.target.value.trim();
  renderProducts();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    // Update active class
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category");
    renderProducts();
  });
});

// Cart logic (giữ nguyên từ bản cũ)
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById("cartCount").innerText = count;
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    });
  }
  updateCartUI();
  alert("Đã thêm vào giỏ hàng!");
}

// Modal cart
const modal = document.getElementById("cartModal");
const cartIcon = document.getElementById("cartIcon");
const closeBtn = document.querySelector(".close");

cartIcon.onclick = () => {
  renderCartModal();
  modal.style.display = "block";
};
closeBtn.onclick = () => modal.style.display = "none";
window.onclick = (e) => {
  if (e.target === modal) modal.style.display = "none";
};

function renderCartModal() {
  const cartItemsDiv = document.getElementById("cartItems");
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Giỏ hàng trống.</p>";
    document.getElementById("cartTotal").innerText = "0";
    return;
  }
  let total = 0;
  cartItemsDiv.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div class="cart-item">
        <span>${escapeHtml(item.name)} x ${item.quantity}</span>
        <span>${formatPrice(item.price * item.quantity)}đ</span>
        <button class="remove-item" data-id="${item.id}">Xóa</button>
      </div>
    `;
  }).join('');
  document.getElementById("cartTotal").innerText = formatPrice(total);
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = btn.getAttribute("data-id");
      cart = cart.filter(item => item.id !== id);
      updateCartUI();
      renderCartModal();
    });
  });
}

document.getElementById("checkoutBtn").onclick = () => {
  if (cart.length === 0) {
    alert("Giỏ hàng trống!");
    return;
  }
  alert("Cảm ơn bạn đã mua hàng! (Chức năng thanh toán đang phát triển)");
  cart = [];
  updateCartUI();
  renderCartModal();
  modal.style.display = "none";
};

// Event delegation for buy buttons
productGrid.addEventListener("click", (e) => {
  if (e.target.classList.contains("buy")) {
    const id = e.target.getAttribute("data-id");
    addToCart(id);
  }
});


// Authentication check for buttons
const accountBtn = document.getElementById("accountBtn");
const manageBtn = document.getElementById("manageBtn");

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    // Lấy role từ localStorage hoặc Firestore
    let role = localStorage.getItem('role');
    if (!role) {
      try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        role = userDoc.exists ? userDoc.data().role : 'user';
        localStorage.setItem('role', role);
      } catch (err) {
        console.error('Lỗi lấy role:', err);
        role = 'user';
      }
    }

    if (role === 'admin') {
      accountBtn.innerText = "Admin";
      accountBtn.onclick = () => window.location.href = "account.html";
      // Hiển thị nút Quản lý cho admin
      manageBtn.style.display = "inline-block";
      manageBtn.onclick = () => window.location.href = "manage.html";
    } else {
      accountBtn.innerText = "Tài khoản";
      accountBtn.onclick = () => window.location.href = "account.html";
      // Ẩn nút Quản lý đối với người dùng thường
      manageBtn.style.display = "none";

      // Kiểm tra xem đã hiển thị popup trong phiên này chưa
      const hasSeenPopup = sessionStorage.getItem('welcomePopup');
      if (!hasSeenPopup) {
        showWelcomePopup();
        sessionStorage.setItem('welcomePopup', 'true');
      }
    }
  } else {
    accountBtn.innerText = "Đăng nhập";
    accountBtn.onclick = () => window.location.href = "log/reg/login.html";
    // Ẩn nút Quản lý khi chưa đăng nhập
    manageBtn.style.display = "none";
  }
});

// ========== CUỘN MƯỢT KHI CLICK NAV LINK ==========
document.querySelectorAll('[data-scroll]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('data-scroll');
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ========== API TIN TỨC CÔNG NGHỆ (VnExpress RSS) ==========
async function fetchTechNews() {
  const newsContainer = document.getElementById('newsList');
  if (!newsContainer) return;
  newsContainer.innerHTML = '<div class="loading">Đang tải tin tức...</div>';
  
  try {
    // Dùng RSS2JSON proxy để lấy tin từ VnExpress Technology
    const rssUrl = 'https://vnexpress.net/rss/technology.rss';
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.status === 'ok' && data.items) {
      const items = data.items.slice(0, 6); // Lấy 6 bài mới nhất
      newsContainer.innerHTML = items.map(item => `
        <a href="${item.link}" target="_blank" class="news-card">
          <img src="${item.thumbnail || 'https://via.placeholder.com/280x160?text=No+Image'}" class="news-img" onerror="this.src='https://via.placeholder.com/280x160?text=News'">
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.description.substring(0, 100))}...</p>
          <span class="news-date">${new Date(item.pubDate).toLocaleDateString('vi-VN')}</span>
        </a>
      `).join('');
    } else {
      newsContainer.innerHTML = '<p>Không thể tải tin tức. Vui lòng thử lại sau.</p>';
    }
  } catch (error) {
    console.error('Lỗi fetch news:', error);
    newsContainer.innerHTML = '<p>Không thể kết nối đến nguồn tin. Vui lòng thử lại sau.</p>';
  }
}

// ========== BẢNG XẾP HẠNG LINH KIỆN (Dữ liệu mẫu + gợi ý mua hàng) ==========
// Thực tế có thể gọi API từ một dịch vụ như UserBenchmark, nhưng tạm dùng dữ liệu mẫu.
const rankingData = [
  { name: "Intel Core i5-13600K", category: "CPU", score: "94%", link: "#" },
  { name: "AMD Ryzen 7 7800X3D", category: "CPU", score: "92%", link: "#" },
  { name: "NVIDIA GeForce RTX 4070 Ti", category: "GPU", score: "96%", link: "#" },
  { name: "AMD Radeon RX 7900 XTX", category: "GPU", score: "95%", link: "#" },
  { name: "Kingston Fury Beast DDR5 32GB", category: "RAM", score: "89%", link: "#" },
  { name: "Samsung 990 Pro 1TB", category: "SSD", score: "97%", link: "#" }
];

function renderRanking() {
  const rankingContainer = document.getElementById('rankingList');
  if (!rankingContainer) return;
  rankingContainer.innerHTML = rankingData.map((item, idx) => `
    <a href="${item.link}" class="ranking-item" target="_blank">
      <div class="rank-number">${idx + 1}</div>
      <div class="rank-info">
        <div class="rank-name">${escapeHtml(item.name)}</div>
        <div class="rank-category">${escapeHtml(item.category)}</div>
      </div>
      <div class="rank-score">${escapeHtml(item.score)}</div>
    </a>
  `).join('');
}

// Gọi các hàm mới khi trang load
fetchTechNews();
renderRanking();

// Load products when page loads
loadProducts();
updateCartUI();