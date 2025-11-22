// Admin Panel JavaScript - LocalStorage Version (for GitHub Pages)
// هذا الإصدار يعمل بدون خادم ويستخدم localStorage

let products = [];
let categories = [];
let currentProduct = null;
let currentCategory = null;
let isAuthenticated = false;

const ADMIN_PASSWORD = 'admin123';

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
});

function checkAuthentication() {
    const savedAuth = sessionStorage.getItem('adminAuth');
    if (savedAuth === 'true') {
        isAuthenticated = true;
        document.getElementById('passwordModal').classList.add('hidden');
        initializeAdmin();
    } else {
        document.getElementById('passwordModal').classList.remove('hidden');
        setupPasswordForm();
    }
}

function setupPasswordForm() {
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const password = document.getElementById('passwordInput').value;
        if (password === ADMIN_PASSWORD) {
            isAuthenticated = true;
            sessionStorage.setItem('adminAuth', 'true');
            document.getElementById('passwordModal').classList.add('hidden');
            initializeAdmin();
        } else {
            alert('كلمة المرور غير صحيحة');
            document.getElementById('passwordInput').value = '';
        }
    });
}

function initializeAdmin() {
    loadData();
    setupEventListeners();
}

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
        saveCategories();
    }
    
    renderProducts();
    renderCategories();
    populateCategorySelect();
}

function saveProducts() {
    localStorage.setItem('oasis_products', JSON.stringify(products));
}

function saveCategories() {
    localStorage.setItem('oasis_categories', JSON.stringify(categories));
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Modals
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('closeModal').addEventListener('click', closeProductModal);
    document.getElementById('closeCategoryModal').addEventListener('click', closeCategoryModal);
    document.getElementById('cancelBtn').addEventListener('click', closeProductModal);
    document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);
    
    // Forms
    document.getElementById('productForm').addEventListener('submit', handleProductSubmit);
    document.getElementById('categoryForm').addEventListener('submit', handleCategorySubmit);
    document.getElementById('storeSettingsForm').addEventListener('submit', handleStoreSettingsSubmit);
    
    // Image preview
    document.getElementById('productImages').addEventListener('change', handleImagePreview);
}

function loadStoreSettings() {
    const settings = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    document.getElementById('storeInstagram').value = settings.instagram || '';
    document.getElementById('storeFacebook').value = settings.facebook || '';
    document.getElementById('storePhone').value = settings.phone || '';
    document.getElementById('storeWhatsapp').value = settings.whatsapp || '';
}

function handleStoreSettingsSubmit(e) {
    e.preventDefault();
    
    const settings = {
        instagram: document.getElementById('storeInstagram').value,
        facebook: document.getElementById('storeFacebook').value,
        phone: document.getElementById('storePhone').value,
        whatsapp: document.getElementById('storeWhatsapp').value
    };
    
    localStorage.setItem('storeSettings', JSON.stringify(settings));
    alert('تم حفظ إعدادات المتجر بنجاح');
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.getElementById('productsSection').classList.toggle('hidden', tab !== 'products');
    document.getElementById('categoriesSection').classList.toggle('hidden', tab !== 'categories');
    document.getElementById('storeSettingsSection').classList.toggle('hidden', tab !== 'store-settings');
    
    if (tab === 'store-settings') {
        loadStoreSettings();
    }
}

function renderProducts() {
    const container = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        container.innerHTML = '<p class="empty-state">لا توجد منتجات. ابدأ بإضافة منتج جديد.</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-images">
                ${product.images && product.images.length > 0 
                    ? `<img src="${product.images[0]}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">`
                    : '<div class="no-image">لا توجد صورة</div>'
                }
            </div>
            <div class="product-info">
                <h3>${product.name || product.nameEn}</h3>
                <p class="product-price">${product.price} د.ع</p>
                <p class="product-stock">المخزون: ${product.stock}</p>
                <div class="product-actions">
                    <button class="btn btn-secondary" onclick="editProduct('${product.id}')">تعديل</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">حذف</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderCategories() {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<p class="empty-state">لا توجد فئات. ابدأ بإضافة فئة جديدة.</p>';
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="category-card">
            <h3>${category.name || category.nameEn}</h3>
            <p>${category.description || ''}</p>
            <div class="category-actions">
                <button class="btn btn-secondary" onclick="editCategory('${category.id}')">تعديل</button>
                <button class="btn btn-danger" onclick="deleteCategory('${category.id}')">حذف</button>
            </div>
        </div>
    `).join('');
}

function populateCategorySelect() {
    const select = document.getElementById('productCategory');
    if (!select) {
        // Retry after a short delay if select doesn't exist yet
        setTimeout(populateCategorySelect, 100);
        return;
    }
    
    // Ensure categories are loaded
    if (categories.length === 0) {
        const savedCategories = localStorage.getItem('oasis_categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        } else {
            // Load default categories
            categories = [
                { id: '1', name: 'الماء', nameEn: 'Antique Water Vessels', description: 'أواني الماء القديمة' },
                { id: '2', name: 'أنتيكات الواحة', nameEn: 'Oasis Antiques', description: 'قطع أثرية من الواحات' }
            ];
            saveCategories();
        }
    }
    
    select.innerHTML = '<option value="">اختر الفئة</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name || cat.nameEn}</option>`).join('');
}

function openProductModal(product = null) {
    currentProduct = product;
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    document.getElementById('modalTitle').textContent = product ? 'تعديل منتج' : 'إضافة منتج جديد';
    
    // Ensure modal is visible first
    modal.classList.remove('hidden');
    
    // Ensure categories are loaded
    if (categories.length === 0) {
        const savedCategories = localStorage.getItem('oasis_categories');
        if (savedCategories) {
            categories = JSON.parse(savedCategories);
        } else {
            loadData();
        }
    }
    
    // Populate category select with a small delay to ensure DOM is ready
    setTimeout(() => {
        populateCategorySelect();
    }, 100);
    
    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productNameEn').value = product.nameEn || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productCategory').value = product.categoryId || '';
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productDimensions').value = product.dimensions || '';
        document.getElementById('productMaterial').value = product.material || '';
        document.getElementById('productOrigin').value = product.origin || '';
        document.getElementById('productEra').value = product.era || '';
        
        // Show existing images
        const imagePreview = document.getElementById('imagePreview');
        imagePreview.innerHTML = '';
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'image-preview';
                imgDiv.innerHTML = `<img src="${img}" alt="Product image">`;
                imagePreview.appendChild(imgDiv);
            });
        }
    } else {
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    currentProduct = null;
}

function openCategoryModal(category = null) {
    currentCategory = category;
    const modal = document.getElementById('categoryModal');
    const form = document.getElementById('categoryForm');
    
    document.getElementById('categoryModalTitle').textContent = category ? 'تعديل فئة' : 'إضافة فئة جديدة';
    
    if (category) {
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name || '';
        document.getElementById('categoryNameEn').value = category.nameEn || '';
        document.getElementById('categoryDescription').value = category.description || '';
    } else {
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    currentCategory = null;
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    const productData = {
        name: document.getElementById('productName').value,
        nameEn: document.getElementById('productNameEn').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value) || 0,
        categoryId: document.getElementById('productCategory').value,
        stock: parseInt(document.getElementById('productStock').value) || 0,
        dimensions: document.getElementById('productDimensions').value,
        material: document.getElementById('productMaterial').value,
        origin: document.getElementById('productOrigin').value,
        era: document.getElementById('productEra').value,
        images: []
    };
    
    // Handle images
    const files = document.getElementById('productImages').files;
    if (files.length > 0) {
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                productData.images.push(e.target.result); // Store as base64
            };
            reader.readAsDataURL(file);
        });
        
        // Wait for images to load
        setTimeout(() => {
            saveProductData(productData);
        }, 500);
    } else {
        // Keep existing images if editing
        if (currentProduct && currentProduct.images) {
            productData.images = currentProduct.images;
        }
        saveProductData(productData);
    }
}

function saveProductData(productData) {
    if (currentProduct) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentProduct.id);
        if (index !== -1) {
            products[index] = {
                ...currentProduct,
                ...productData,
                updatedAt: new Date().toISOString()
            };
        }
        alert('تم تحديث المنتج بنجاح');
    } else {
        // Add new product
        const newProduct = {
            id: Date.now().toString(),
            ...productData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        products.push(newProduct);
        alert('تم إضافة المنتج بنجاح');
    }
    
    saveProducts();
    closeProductModal();
    loadData();
}

function handleCategorySubmit(e) {
    e.preventDefault();
    
    const categoryData = {
        name: document.getElementById('categoryName').value,
        nameEn: document.getElementById('categoryNameEn').value,
        description: document.getElementById('categoryDescription').value
    };
    
    if (currentCategory) {
        // Update existing category
        const index = categories.findIndex(c => c.id === currentCategory.id);
        if (index !== -1) {
            categories[index] = {
                ...currentCategory,
                ...categoryData
            };
        }
        alert('تم تحديث الفئة بنجاح');
    } else {
        // Add new category
        const newCategory = {
            id: Date.now().toString(),
            ...categoryData
        };
        categories.push(newCategory);
        alert('تم إضافة الفئة بنجاح');
    }
    
    saveCategories();
    closeCategoryModal();
    loadData();
}

function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    products = products.filter(p => p.id !== id);
    saveProducts();
    alert('تم حذف المنتج بنجاح');
    loadData();
}

function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    
    categories = categories.filter(c => c.id !== id);
    saveCategories();
    alert('تم حذف الفئة بنجاح');
    loadData();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (product) openProductModal(product);
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (category) openCategoryModal(category);
}

function handleImagePreview(e) {
    const container = document.getElementById('imagePreview');
    container.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'image-preview';
            container.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

