// Admin Panel JavaScript
const API_URL = 'http://localhost:5000/api';
const ADMIN_PASSWORD = 'admin123'; // كلمة المرور الافتراضية

let products = [];
let categories = [];
let currentProduct = null;
let currentCategory = null;
let isAuthenticated = false;

// Check authentication on page load
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

async function initializeAdmin() {
    await loadData();
    setupEventListeners();
}

async function loadData() {
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            fetch(`${API_URL}/products`),
            fetch(`${API_URL}/categories`)
        ]);
        
        products = await productsRes.json();
        categories = await categoriesRes.json();
        
        renderProducts();
        renderCategories();
        populateCategorySelect();
    } catch (error) {
        console.error('Error loading data:', error);
    }
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

async function handleStoreSettingsSubmit(e) {
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
                    ? `<img src="http://localhost:5000${product.images[0]}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'">`
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
    select.innerHTML = '<option value="">اختر الفئة</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name || cat.nameEn}</option>`).join('');
}

function openProductModal(product = null) {
    currentProduct = product;
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    document.getElementById('modalTitle').textContent = product ? 'تعديل منتج' : 'إضافة منتج جديد';
    
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
    } else {
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
    }
    
    modal.classList.remove('hidden');
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

async function handleProductSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('nameEn', document.getElementById('productNameEn').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('categoryId', document.getElementById('productCategory').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('dimensions', document.getElementById('productDimensions').value);
    formData.append('material', document.getElementById('productMaterial').value);
    formData.append('origin', document.getElementById('productOrigin').value);
    formData.append('era', document.getElementById('productEra').value);
    
    const files = document.getElementById('productImages').files;
    for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
    }
    
    try {
        const url = currentProduct 
            ? `${API_URL}/products/${currentProduct.id}`
            : `${API_URL}/products`;
        
        const method = currentProduct ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            body: formData
        });
        
        if (response.ok) {
            alert(currentProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
            closeProductModal();
            await loadData();
        } else {
            alert('حدث خطأ في حفظ المنتج');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('حدث خطأ في حفظ المنتج');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const data = {
        name: document.getElementById('categoryName').value,
        nameEn: document.getElementById('categoryNameEn').value,
        description: document.getElementById('categoryDescription').value
    };
    
    try {
        const url = currentCategory 
            ? `${API_URL}/categories/${currentCategory.id}`
            : `${API_URL}/categories`;
        
        const method = currentCategory ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert(currentCategory ? 'تم تحديث الفئة بنجاح' : 'تم إضافة الفئة بنجاح');
            closeCategoryModal();
            await loadData();
        } else {
            alert('حدث خطأ في حفظ الفئة');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        alert('حدث خطأ في حفظ الفئة');
    }
}

async function deleteProduct(id) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('تم حذف المنتج بنجاح');
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('حدث خطأ في حذف المنتج');
    }
}

async function deleteCategory(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    
    try {
        const response = await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' });
        if (response.ok) {
            alert('تم حذف الفئة بنجاح');
            await loadData();
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('حدث خطأ في حذف الفئة');
    }
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

