/**
 * Bundle Product JavaScript
 * Handles bundle selection, pricing calculations, and cart functionality
 */

class BundleProduct {
  constructor() {
    this.selectedBundle = null;
    this.basePrice = 0;
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeBundles();
    this.setDefaultSelection();
  }

  bindEvents() {
    // Bundle option selection
    document.addEventListener('click', (e) => {
      if (e.target.closest('.bundle-option')) {
        const bundleOption = e.target.closest('.bundle-option');
        this.selectBundle(bundleOption);
      }
    });

    // Add to cart button
    const addToCartBtn = document.getElementById('add-bundle-to-cart');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }

    // Bundle select buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('bundle-select-btn')) {
        const bundleOption = e.target.closest('.bundle-option');
        this.selectBundle(bundleOption);
      }
    });
  }

  initializeBundles() {
    const bundleOptions = document.querySelectorAll('.bundle-option');
    
    bundleOptions.forEach(option => {
      const bundleData = this.getBundleData(option);
      option.bundleData = bundleData;
    });

    // Get base price from first bundle or product data
    if (bundleOptions.length > 0) {
      const firstBundle = bundleOptions[0].bundleData;
      this.basePrice = firstBundle.price / firstBundle.quantity;
    }
  }

  getBundleData(bundleElement) {
    return {
      id: bundleElement.dataset.bundle,
      quantity: parseInt(bundleElement.dataset.quantity) || 1,
      price: parseInt(bundleElement.dataset.price) || 0,
      discount: parseInt(bundleElement.dataset.discount) || 0,
      name: bundleElement.querySelector('.bundle-name')?.textContent || '',
      element: bundleElement
    };
  }

  setDefaultSelection() {
    // Select the popular bundle by default, or first bundle if none marked as popular
    const popularBundle = document.querySelector('.bundle-option.popular');
    const firstBundle = document.querySelector('.bundle-option');
    
    if (popularBundle) {
      this.selectBundle(popularBundle);
    } else if (firstBundle) {
      this.selectBundle(firstBundle);
    }
  }

  selectBundle(bundleElement) {
    if (!bundleElement) return;

    // Remove selection from all bundles
    document.querySelectorAll('.bundle-option').forEach(option => {
      option.classList.remove('selected');
      const selectBtn = option.querySelector('.bundle-select-btn');
      if (selectBtn) {
        selectBtn.classList.remove('selected');
        selectBtn.textContent = 'Select';
      }
    });

    // Add selection to clicked bundle
    bundleElement.classList.add('selected');
    const selectBtn = bundleElement.querySelector('.bundle-select-btn');
    if (selectBtn) {
      selectBtn.classList.add('selected');
      selectBtn.textContent = 'Selected';
    }

    // Update selected bundle data
    this.selectedBundle = bundleElement.bundleData;
    
    // Update summary
    this.updateSummary();

    // Add visual feedback
    this.animateSelection(bundleElement);
  }

  animateSelection(bundleElement) {
    const quantityIndicator = bundleElement.querySelector('.quantity-indicator');
    if (quantityIndicator) {
      quantityIndicator.style.animation = 'none';
      setTimeout(() => {
        quantityIndicator.style.animation = 'bounce 0.6s ease';
      }, 10);
    }

    // Pulse effect
    bundleElement.style.transform = 'scale(1.02)';
    setTimeout(() => {
      bundleElement.style.transform = '';
    }, 200);
  }

  updateSummary() {
    if (!this.selectedBundle) return;

    const bundle = this.selectedBundle;
    
    // Update selected bundle name and quantity
    const selectedBundleName = document.getElementById('selected-bundle-name');
    const selectedQuantity = document.getElementById('selected-quantity');
    
    if (selectedBundleName) {
      selectedBundleName.textContent = bundle.name;
    }
    
    if (selectedQuantity) {
      selectedQuantity.textContent = `Quantity: ${bundle.quantity}`;
    }

    // Calculate pricing
    const originalPrice = this.basePrice * bundle.quantity;
    const discountAmount = originalPrice * (bundle.discount / 100);
    const finalPrice = originalPrice - discountAmount;

    // Update total amount
    const totalAmount = document.getElementById('total-amount');
    const btnPrice = document.getElementById('btn-price');
    
    if (totalAmount) {
      totalAmount.textContent = `$${(finalPrice / 100).toFixed(2)}`;
    }
    
    if (btnPrice) {
      btnPrice.textContent = `$${(finalPrice / 100).toFixed(2)}`;
    }

    // Update savings display
    const savingsDisplay = document.getElementById('savings-display');
    if (savingsDisplay) {
      if (bundle.discount > 0) {
        const savingsAmount = savingsDisplay.querySelector('.savings-amount');
        if (savingsAmount) {
          savingsAmount.textContent = `$${(discountAmount / 100).toFixed(2)}`;
        }
        savingsDisplay.style.display = 'block';
      } else {
        savingsDisplay.style.display = 'none';
      }
    }

    // Update button state
    const addToCartBtn = document.getElementById('add-bundle-to-cart');
    if (addToCartBtn) {
      const btnText = addToCartBtn.querySelector('.btn-text');
      if (btnText) {
        btnText.textContent = `Add ${bundle.quantity} to Cart`;
      }
      
      // Add loading state capability
      addToCartBtn.disabled = false;
      addToCartBtn.classList.remove('loading');
    }
  }

  async addToCart() {
    if (!this.selectedBundle) {
      this.showAlert('Please select a bundle option', 'error');
      return;
    }

    const addToCartBtn = document.getElementById('add-bundle-to-cart');
    
    try {
      // Show loading state
      this.setLoadingState(addToCartBtn, true);

      // Prepare cart data
      const cartData = this.prepareCartData();
      
      // Add to Shopify cart
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cartData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Success feedback
      this.showSuccessFeedback();
      this.updateCartCount();
      
      // Optionally redirect to cart or open cart drawer
      if (window.theme?.cart?.drawer) {
        window.theme.cart.drawer.open();
      } else {
        // Show success message
        this.showAlert('Added to cart successfully!', 'success');
      }

    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showAlert('Failed to add to cart. Please try again.', 'error');
    } finally {
      this.setLoadingState(addToCartBtn, false);
    }
  }

  prepareCartData() {
    const bundle = this.selectedBundle;
    
    // For simple products, just add the quantity
    // For variable products, you'd need to handle variant selection
    return {
      items: [{
        id: this.getVariantId(), // You'd need to implement this based on your product structure
        quantity: bundle.quantity
      }]
    };
  }

  getVariantId() {
    // This should return the current product variant ID
    // You can get this from the product data or variant picker
    const variantSelect = document.querySelector('[name="id"]');
    if (variantSelect) {
      return variantSelect.value;
    }
    
    // Fallback to first available variant
    const productData = window.product || {};
    if (productData.variants && productData.variants.length > 0) {
      return productData.variants[0].id;
    }
    
    return null;
  }

  setLoadingState(button, isLoading) {
    if (!button) return;

    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
      const btnText = button.querySelector('.btn-text');
      if (btnText) {
        btnText.dataset.originalText = btnText.textContent;
        btnText.textContent = 'Adding to Cart...';
      }
    } else {
      button.disabled = false;
      button.classList.remove('loading');
      const btnText = button.querySelector('.btn-text');
      if (btnText && btnText.dataset.originalText) {
        btnText.textContent = btnText.dataset.originalText;
      }
    }
  }

  showSuccessFeedback() {
    const addToCartBtn = document.getElementById('add-bundle-to-cart');
    if (addToCartBtn) {
      const originalBg = addToCartBtn.style.background;
      addToCartBtn.style.background = 'var(--bundle-success)';
      addToCartBtn.style.transform = 'scale(1.05)';
      
      setTimeout(() => {
        addToCartBtn.style.background = originalBg;
        addToCartBtn.style.transform = '';
      }, 600);
    }

    // Add checkmark animation
    this.showCheckmark();
  }

  showCheckmark() {
    const bundleContainer = document.querySelector('.bundle-container');
    if (!bundleContainer) return;

    const checkmark = document.createElement('div');
    checkmark.className = 'success-checkmark';
    checkmark.innerHTML = '✓';
    checkmark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 3rem;
      color: var(--bundle-success);
      background: white;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      animation: checkmarkPop 0.6s ease;
    `;

    bundleContainer.appendChild(checkmark);

    setTimeout(() => {
      checkmark.remove();
    }, 1000);
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Update cart count in header
      const cartCountElements = document.querySelectorAll('.cart-count, [data-cart-count]');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        if (cart.item_count > 0) {
          element.style.display = 'block';
        }
      });

      // Update cart icon
      const cartIcons = document.querySelectorAll('.cart-icon');
      cartIcons.forEach(icon => {
        icon.classList.add('cart-updated');
        setTimeout(() => {
          icon.classList.remove('cart-updated');
        }, 1000);
      });

    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }

  showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `bundle-alert bundle-alert--${type}`;
    alert.textContent = message;
    alert.style.cssText = `
      position: fixed;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      padding: 1rem 2rem;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      animation: slideDown 0.3s ease;
    `;

    switch (type) {
      case 'success':
        alert.style.background = 'var(--bundle-success)';
        break;
      case 'error':
        alert.style.background = 'var(--bundle-danger)';
        break;
      default:
        alert.style.background = 'var(--bundle-secondary)';
    }

    document.body.appendChild(alert);

    // Auto remove after 3 seconds
    setTimeout(() => {
      alert.style.animation = 'slideUp 0.3s ease forwards';
      setTimeout(() => {
        alert.remove();
      }, 300);
    }, 3000);
  }

  // Utility methods for external integration
  getSelectedBundle() {
    return this.selectedBundle;
  }

  selectBundleById(bundleId) {
    const bundleElement = document.querySelector(`[data-bundle="${bundleId}"]`);
    if (bundleElement) {
      this.selectBundle(bundleElement);
    }
  }

  updateBundlePrice(bundleId, newPrice) {
    const bundleElement = document.querySelector(`[data-bundle="${bundleId}"]`);
    if (bundleElement && bundleElement.bundleData) {
      bundleElement.bundleData.price = newPrice;
      bundleElement.dataset.price = newPrice;
      
      // Update UI if this is the selected bundle
      if (this.selectedBundle && this.selectedBundle.id === bundleId) {
        this.selectedBundle.price = newPrice;
        this.updateSummary();
      }
    }
  }

  // Event emitters for external listeners
  emitBundleSelected(bundle) {
    const event = new CustomEvent('bundleSelected', {
      detail: { bundle }
    });
    document.dispatchEvent(event);
  }

  emitAddToCart(bundle, success) {
    const event = new CustomEvent('bundleAddToCart', {
      detail: { bundle, success }
    });
    document.dispatchEvent(event);
  }
}

// Add required CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-20px);
    }
  }

  @keyframes checkmarkPop {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) scale(1.2);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 1;
    }
  }

  .cart-icon.cart-updated {
    animation: cartBounce 0.6s ease;
  }

  @keyframes cartBounce {
    0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-10px);
    }
    60% {
      transform: translateY(-5px);
    }
  }

  .add-to-cart-btn.loading {
    position: relative;
    overflow: hidden;
  }

  .add-to-cart-btn.loading::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: loading-shimmer 1.5s infinite;
  }

  @keyframes loading-shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if bundle section exists
  if (document.querySelector('.bundle-product-section')) {
    window.bundleProduct = new BundleProduct();
  }
});

// Export for external use
window.BundleProduct = BundleProduct;