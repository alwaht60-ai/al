// Store JavaScript - LocalStorage Version (for GitHub Pages)
// هذا الإصدار يعمل بدون خادم ويستخدم localStorage

let products = [];
let categories = [];
let filteredProducts = [];
let selectedCategory = 'all';

// Load data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

function loadData() {
    // Load from localStorage
    const savedProducts = localStorage.getItem('oasis_products');
    const savedCategories = localStorage.getItem('oasis_categories');
    
    products = savedProducts ? JSON.parse(savedProducts) : [];
    categories = savedCategories ? JSON.parse(savedCategories) : [];
    
    // If no categories, add default ones
    if (categories.length === 0) {
        categories = [
            { id: '1', name: 'الماء', nameEn: 'Antique Water Vessels', description: 'أواني الماء القديمة' },
            { id: '2', name: 'أنتيكات الواحة', nameEn: 'Oasis Antiques', description: 'قطع أثرية من الواحات' }
        ];
        localStorage.setItem('oasis_categories', JSON.stringify(categories));
    }
    
    filteredProducts = products;
    renderCategories();
    renderProducts();
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function renderCategories() {
    const container = document.getElementById('categoryFilters');
    if (!container) return;
    
    container.innerHTML = '<button class="category-btn active" data-category="all">الكل</button>';
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category.name || category.nameEn;
        btn.dataset.category = category.id;
        btn.addEventListener('click', () => filterByCategory(category.id));
        container.appendChild(btn);
    });
}

function filterByCategory(categoryId) {
    selectedCategory = categoryId;
    
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === categoryId) {
            btn.classList.add('active');
        }
    });
    
    // Update title
    const category = categories.find(c => c.id === categoryId);
    const titleElement = document.getElementById('sectionTitle');
    if (titleElement) {
        titleElement.textContent = 
            categoryId === 'all' ? 'جميع المنتجات' : (category?.name || 'المنتجات');
    }
    
    filterProducts();
}

function handleSearch(e) {
    filterProducts();
}

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
        const matchesSearch = 
            (product.name && product.name.toLowerCase().includes(searchTerm)) ||
            (product.nameEn && product.nameEn.toLowerCase().includes(searchTerm)) ||
            (product.description && product.description.toLowerCase().includes(searchTerm));
        return matchesCategory && matchesSearch;
    });
    
    renderProducts();
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = '<div class="loading">لا توجد منتجات متاحة</div>';
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <a href="product.html?id=${product.id}" class="product-card">
            <div class="product-image-container">
                ${product.images && product.images.length > 0 
                    ? `<img src="${product.images[0]}" alt="${product.name || product.nameEn}" class="product-image" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">`
                    : `<div class="product-image-placeholder"><span>🏺</span><span>لا توجد صورة</span></div>`
                }
            </div>
            <div class="product-card-content">
                <h3 class="product-card-title">${product.name || product.nameEn}</h3>
                <div class="product-card-price">${product.price} د.ع</div>
            </div>
        </a>
    `).join('');
}

