/**
 * Product Admin Manager JavaScript
 * Handles CRUD operations for products, variants, and bundles
 */

class ProductAdminManager {
  constructor() {
    this.currentProduct = null;
    this.products = [];
    this.filteredProducts = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadProducts();
    this.setupImageUpload();
    this.setupProductTypeToggle();
  }

  bindEvents() {
    // Main buttons
    document.getElementById('add-product-btn')?.addEventListener('click', () => this.openProductModal());
    document.getElementById('bulk-actions-btn')?.addEventListener('click', () => this.openBulkActions());

    // Search and filters
    document.getElementById('product-search')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById('status-filter')?.addEventListener('change', (e) => this.handleFilter('status', e.target.value));
    document.getElementById('type-filter')?.addEventListener('change', (e) => this.handleFilter('type', e.target.value));

    // Product card actions
    document.addEventListener('click', (e) => {
      if (e.target.closest('.edit-btn')) {
        const productId = e.target.closest('.edit-btn').dataset.productId;
        this.editProduct(productId);
      } else if (e.target.closest('.duplicate-btn')) {
        const productId = e.target.closest('.duplicate-btn').dataset.productId;
        this.duplicateProduct(productId);
      } else if (e.target.closest('.delete-btn')) {
        const productId = e.target.closest('.delete-btn').dataset.productId;
        this.deleteProduct(productId);
      } else if (e.target.closest('.manage-variants-btn')) {
        const productId = e.target.closest('.manage-variants-btn').dataset.productId;
        this.manageVariants(productId);
      } else if (e.target.closest('.view-product-btn')) {
        const productHandle = e.target.closest('.view-product-btn').dataset.productHandle;
        this.viewProduct(productHandle);
      }
    });

    // Form submission
    document.getElementById('product-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProduct();
    });

    // Modal close events
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
        this.closeAllModals();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  // Product Management
  async loadProducts() {
    try {
      // In a real implementation, this would fetch from Shopify Admin API
      // For now, we'll use the products already loaded in the DOM
      this.products = this.getProductsFromDOM();
      this.filteredProducts = [...this.products];
      this.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showAlert('Error loading products', 'error');
    }
  }

  getProductsFromDOM() {
    const productCards = document.querySelectorAll('.product-card');
    return Array.from(productCards).map(card => ({
      id: card.dataset.productId,
      title: card.querySelector('.product-title')?.textContent,
      type: card.querySelector('.product-type')?.textContent,
      status: card.querySelector('.product-status')?.classList.contains('active') ? 'active' : 'inactive',
      price: card.querySelector('.current-price')?.textContent,
      comparePrice: card.querySelector('.original-price')?.textContent,
      image: card.querySelector('.product-image img')?.src,
      variants: card.querySelector('.variant-count')?.textContent,
      inventory: card.querySelector('.inventory-count')?.textContent
    }));
  }

  renderProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    // Clear existing products except the server-rendered ones on first load
    // In a real implementation, this would render from JavaScript data
    
    // For now, we'll just show/hide based on filters
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
      const product = this.products.find(p => p.id === card.dataset.productId);
      if (product && this.filteredProducts.includes(product)) {
        card.style.display = 'block';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });
  }

  // Search and Filter
  handleSearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.title?.toLowerCase().includes(searchTerm) ||
        product.type?.toLowerCase().includes(searchTerm)
      );
    }
    
    this.renderProducts();
  }

  handleFilter(type, value) {
    let filtered = [...this.products];

    // Apply status filter
    const statusFilter = document.getElementById('status-filter').value;
    if (statusFilter) {
      filtered = filtered.filter(product => product.status === statusFilter);
    }

    // Apply type filter
    const typeFilter = document.getElementById('type-filter').value;
    if (typeFilter) {
      filtered = filtered.filter(product => 
        product.type?.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    // Apply search filter if there's a search term
    const searchTerm = document.getElementById('product-search').value.toLowerCase().trim();
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.title?.toLowerCase().includes(searchTerm) ||
        product.type?.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredProducts = filtered;
    this.renderProducts();
  }

  // Modal Management
  openProductModal(product = null) {
    this.currentProduct = product;
    const modal = document.getElementById('product-modal');
    const modalTitle = modal.querySelector('.modal-title');
    
    if (product) {
      modalTitle.textContent = 'Edit Product';
      this.populateProductForm(product);
    } else {
      modalTitle.textContent = 'Add New Product';
      this.resetProductForm();
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
  }

  populateProductForm(product) {
    document.getElementById('product-title').value = product.title || '';
    document.getElementById('product-description').value = product.description || '';
    document.getElementById('product-type').value = product.type || 'simple';
    document.getElementById('product-vendor').value = product.vendor || '';
    document.getElementById('product-price').value = product.price?.replace(/[^0-9.]/g, '') || '';
    document.getElementById('product-compare-price').value = product.comparePrice?.replace(/[^0-9.]/g, '') || '';
  }

  resetProductForm() {
    document.getElementById('product-form').reset();
    document.getElementById('uploaded-images').innerHTML = '';
    this.hideVariantSection();
    this.hideBundleSection();
  }

  // Product CRUD Operations
  async saveProduct() {
    const formData = this.getFormData();
    
    if (!this.validateFormData(formData)) {
      return;
    }

    try {
      this.showLoading(true);
      
      if (this.currentProduct) {
        await this.updateProduct(this.currentProduct.id, formData);
        this.showAlert('Product updated successfully!', 'success');
      } else {
        await this.createProduct(formData);
        this.showAlert('Product created successfully!', 'success');
      }
      
      this.closeAllModals();
      this.loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      this.showAlert('Error saving product. Please try again.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  getFormData() {
    return {
      title: document.getElementById('product-title').value,
      description: document.getElementById('product-description').value,
      type: document.getElementById('product-type').value,
      vendor: document.getElementById('product-vendor').value,
      price: parseFloat(document.getElementById('product-price').value) || 0,
      comparePrice: parseFloat(document.getElementById('product-compare-price').value) || 0,
      seoTitle: document.getElementById('seo-title').value,
      seoDescription: document.getElementById('seo-description').value,
      images: this.getUploadedImages(),
      variants: this.getVariantData(),
      bundles: this.getBundleData()
    };
  }

  validateFormData(data) {
    if (!data.title.trim()) {
      this.showAlert('Product title is required', 'error');
      return false;
    }
    
    if (data.price <= 0) {
      this.showAlert('Product price must be greater than 0', 'error');
      return false;
    }

    return true;
  }

  async createProduct(data) {
    // In a real implementation, this would make an API call to Shopify Admin API
    console.log('Creating product:', data);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProduct = {
          id: Date.now().toString(),
          ...data,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        this.products.push(newProduct);
        resolve(newProduct);
      }, 1000);
    });
  }

  async updateProduct(id, data) {
    // In a real implementation, this would make an API call to Shopify Admin API
    console.log('Updating product:', id, data);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...data };
        }
        resolve(this.products[index]);
      }, 1000);
    });
  }

  async deleteProduct(productId) {
    const modal = document.getElementById('delete-modal');
    modal.style.display = 'flex';
    
    const confirmBtn = document.getElementById('confirm-delete-btn');
    confirmBtn.onclick = async () => {
      try {
        this.showLoading(true);
        
        // In a real implementation, this would make an API call to Shopify Admin API
        console.log('Deleting product:', productId);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.products = this.products.filter(p => p.id !== productId);
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== productId);
        
        // Remove from DOM
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        if (productCard) {
          productCard.remove();
        }
        
        this.showAlert('Product deleted successfully!', 'success');
        this.closeAllModals();
      } catch (error) {
        console.error('Error deleting product:', error);
        this.showAlert('Error deleting product. Please try again.', 'error');
      } finally {
        this.showLoading(false);
      }
    };
  }

  async duplicateProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const duplicatedProduct = {
      ...product,
      title: `${product.title} (Copy)`,
      id: null // Will be assigned by server
    };

    this.openProductModal(duplicatedProduct);
  }

  editProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      this.openProductModal(product);
    }
  }

  viewProduct(productHandle) {
    const url = `/products/${productHandle}`;
    window.open(url, '_blank');
  }

  manageVariants(productId) {
    const modal = document.getElementById('variants-modal');
    const variantManager = modal.querySelector('.variant-manager');
    
    // Load variant management interface
    variantManager.innerHTML = this.renderVariantManager(productId);
    
    modal.style.display = 'flex';
  }

  renderVariantManager(productId) {
    return `
      <div class="variant-manager-content">
        <div class="variant-list">
          <h4>Product Variants</h4>
          <div class="variant-grid">
            <!-- Variants will be loaded here -->
            <div class="variant-item">
              <div class="variant-info">
                <span class="variant-title">Default Title</span>
                <span class="variant-price">$29.99</span>
                <span class="variant-inventory">10 in stock</span>
              </div>
              <div class="variant-actions">
                <button class="btn btn--small btn--outline">Edit</button>
                <button class="btn btn--small btn--danger">Delete</button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="add-variant">
          <button class="btn btn--primary">Add New Variant</button>
        </div>
      </div>
    `;
  }

  // Image Upload
  setupImageUpload() {
    const uploadArea = document.getElementById('image-upload-area');
    const fileInput = document.getElementById('image-upload');
    
    if (!uploadArea || !fileInput) return;

    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--admin-primary)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = 'var(--admin-border)';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--admin-border)';
      this.handleImageFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
      this.handleImageFiles(e.target.files);
    });
  }

  handleImageFiles(files) {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        this.previewImage(file);
      }
    });
  }

  previewImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageContainer = document.getElementById('uploaded-images');
      const imageElement = document.createElement('div');
      imageElement.className = 'uploaded-image';
      imageElement.innerHTML = `
        <img src="${e.target.result}" alt="Product image">
        <button type="button" class="remove-image" onclick="this.parentElement.remove()">×</button>
      `;
      imageContainer.appendChild(imageElement);
    };
    reader.readAsDataURL(file);
  }

  getUploadedImages() {
    const images = document.querySelectorAll('#uploaded-images img');
    return Array.from(images).map(img => img.src);
  }

  // Product Type Toggle
  setupProductTypeToggle() {
    const productTypeSelect = document.getElementById('product-type');
    if (!productTypeSelect) return;

    productTypeSelect.addEventListener('change', (e) => {
      const selectedType = e.target.value;
      
      switch (selectedType) {
        case 'variable':
          this.showVariantSection();
          this.hideBundleSection();
          break;
        case 'bundle':
          this.hideBundleSection();
          this.showBundleSection();
          break;
        default:
          this.hideVariantSection();
          this.hideBundleSection();
      }
    });
  }

  showVariantSection() {
    const section = document.getElementById('variants-section');
    if (section) section.style.display = 'block';
  }

  hideVariantSection() {
    const section = document.getElementById('variants-section');
    if (section) section.style.display = 'none';
  }

  showBundleSection() {
    const section = document.getElementById('bundle-section');
    if (section) section.style.display = 'block';
  }

  hideBundleSection() {
    const section = document.getElementById('bundle-section');
    if (section) section.style.display = 'none';
  }

  getVariantData() {
    // Get variant options and generate variants
    const options = document.querySelectorAll('.option-group');
    const variants = [];
    
    // In a real implementation, this would parse the variant options
    // and generate all possible variant combinations
    
    return variants;
  }

  getBundleData() {
    // Get bundle configuration
    const bundles = [];
    const bundleItems = document.querySelectorAll('.bundle-item');
    
    bundleItems.forEach(item => {
      const name = item.querySelector('input[placeholder="e.g., Buy 1"]')?.value;
      const quantity = item.querySelector('input[type="number"]')?.value;
      const price = item.querySelector('input[step="0.01"]')?.value;
      const discount = item.querySelector('input[placeholder="%"]')?.value;
      
      if (name && quantity && price) {
        bundles.push({
          name,
          quantity: parseInt(quantity),
          price: parseFloat(price),
          discount: parseFloat(discount) || 0
        });
      }
    });
    
    return bundles;
  }

  // Bulk Actions
  openBulkActions() {
    // Implement bulk actions like bulk delete, bulk edit, export, etc.
    const actions = [
      'Export Products',
      'Bulk Delete',
      'Bulk Edit Status',
      'Bulk Edit Prices',
      'Import Products'
    ];
    
    // Show bulk actions menu
    console.log('Bulk actions:', actions);
  }

  // Utility Functions
  showLoading(show = true) {
    const modals = document.querySelectorAll('.modal-content');
    modals.forEach(modal => {
      if (show) {
        modal.classList.add('loading');
      } else {
        modal.classList.remove('loading');
      }
    });
  }

  showAlert(message, type = 'info') {
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} fade-in`;
    alertElement.textContent = message;
    
    // Find a suitable container or create one
    let container = document.querySelector('.admin-header');
    if (container) {
      container.appendChild(alertElement);
      
      // Auto-remove after 5 seconds
      setTimeout(() => {
        alertElement.remove();
      }, 5000);
    }
  }
}

// Global modal function
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductAdminManager();
});

// Export for use in other scripts
window.ProductAdminManager = ProductAdminManager;