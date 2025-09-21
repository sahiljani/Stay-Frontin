/**
 * Product Variant Showcase JavaScript
 * Enhanced variant selection with smooth image transitions and improved UX
 */

class ProductVariantShowcase extends HTMLElement {
  constructor() {
    super();
    this.productData = null;
    this.currentVariant = null;
    this.mediaGallery = null;
    this.variantSelectors = null;
    this.isLoading = false;
    
    this.init();
  }

  init() {
    this.loadProductData();
    this.setupMediaGallery();
    this.setupVariantSelectors();
    this.setupEventListeners();
    this.updateSelectedValues();
  }

  loadProductData() {
    const productScript = document.querySelector('#ProductMediaData-' + this.dataset.section);
    if (productScript) {
      this.productData = JSON.parse(productScript.textContent);
    }
  }

  setupMediaGallery() {
    this.mediaGallery = document.querySelector('#MediaGallery-' + this.dataset.section);
  }

  setupVariantSelectors() {
    this.variantSelectors = document.querySelector('#variant-selects-' + this.dataset.section);
    if (!this.variantSelectors) return;

    // Get all variant inputs
    this.colorInputs = this.variantSelectors.querySelectorAll('.swatch-input__input, .product-variant-showcase__option-input');
    this.optionGroups = this.variantSelectors.querySelectorAll('.product-variant-showcase__option-group');
    
    // Load available variants data
    const variantScript = this.variantSelectors.querySelector('script[type="application/json"]');
    if (variantScript) {
      this.availableVariants = JSON.parse(variantScript.textContent);
    }
  }

  setupEventListeners() {
    if (!this.variantSelectors) return;

    // Listen for variant changes
    this.colorInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.handleVariantChange(e);
      });
    });

    // Listen for product form updates
    document.addEventListener('variant:change', (e) => {
      this.handleVariantUpdate(e.detail);
    });

    // Setup tooltip interactions
    this.setupTooltips();
  }

  setupTooltips() {
    const swatchLabels = this.variantSelectors?.querySelectorAll('.product-variant-showcase__swatch-label');
    if (!swatchLabels) return;

    swatchLabels.forEach(label => {
      label.addEventListener('mouseenter', (e) => {
        const tooltip = label.querySelector('.swatch-input__tooltip');
        if (tooltip) {
          tooltip.style.opacity = '1';
          tooltip.style.visibility = 'visible';
        }
      });

      label.addEventListener('mouseleave', (e) => {
        const tooltip = label.querySelector('.swatch-input__tooltip');
        if (tooltip) {
          tooltip.style.opacity = '0';
          tooltip.style.visibility = 'hidden';
        }
      });
    });
  }

  handleVariantChange(event) {
    if (this.isLoading) return;
    
    const input = event.target;
    const optionGroup = input.closest('.product-variant-showcase__option-group');
    const optionIndex = optionGroup ? Array.from(this.optionGroups).indexOf(optionGroup) : 0;
    
    // Update selected value display
    this.updateSelectedValue(optionIndex, input.value);
    
    // Get current form data
    const formData = this.getFormData();
    const selectedVariant = this.findVariant(formData);
    
    if (selectedVariant) {
      this.updateVariant(selectedVariant);
      this.updateAvailability();
    }
    
    // Add visual feedback
    this.addSelectionFeedback(input);
  }

  updateSelectedValue(optionIndex, value) {
    const selectedValueSpan = document.querySelector(`[data-option-index="${optionIndex}"]`);
    if (selectedValueSpan) {
      selectedValueSpan.textContent = value;
      
      // Add animation
      selectedValueSpan.style.opacity = '0.5';
      setTimeout(() => {
        selectedValueSpan.style.opacity = '1';
      }, 150);
    }
  }

  updateSelectedValues() {
    this.colorInputs.forEach(input => {
      if (input.checked) {
        const optionGroup = input.closest('.product-variant-showcase__option-group');
        const optionIndex = optionGroup ? Array.from(this.optionGroups).indexOf(optionGroup) : 0;
        this.updateSelectedValue(optionIndex, input.value);
      }
    });
  }

  getFormData() {
    const formData = new FormData();
    this.colorInputs.forEach(input => {
      if (input.checked) {
        formData.append(input.name, input.value);
      }
    });
    return formData;
  }

  findVariant(formData) {
    if (!this.availableVariants) return null;
    
    const selectedOptions = [];
    for (let [key, value] of formData.entries()) {
      selectedOptions.push(value);
    }
    
    return this.availableVariants.find(variant => {
      return variant.options.every((option, index) => 
        option === selectedOptions[index]
      );
    });
  }

  updateVariant(variant) {
    if (!variant || this.currentVariant?.id === variant.id) return;
    
    this.currentVariant = variant;
    this.updatePrice(variant);
    this.updateSKU(variant);
    this.updateInventory(variant);
    this.updateImages(variant);
    this.updateURL(variant);
  }

  updatePrice(variant) {
    const priceContainer = document.querySelector(`#price-${this.dataset.section}`);
    if (!priceContainer) return;

    fetch(`${this.dataset.url}?variant=${variant.id}&section_id=${this.dataset.section}`)
      .then(response => response.text())
      .then(responseText => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const newPrice = html.querySelector(`#price-${this.dataset.section}`);
        if (newPrice) {
          priceContainer.innerHTML = newPrice.innerHTML;
          this.animateElement(priceContainer);
        }
      })
      .catch(error => console.error('Error updating price:', error));
  }

  updateSKU(variant) {
    const skuElement = document.querySelector(`#Sku-${this.dataset.section}`);
    if (skuElement) {
      if (variant.sku) {
        skuElement.textContent = variant.sku;
        skuElement.classList.remove('visibility-hidden');
      } else {
        skuElement.classList.add('visibility-hidden');
      }
      this.animateElement(skuElement);
    }

    // Update variant details
    const variantDetails = document.querySelector(`#variant-details-${this.dataset.section}`);
    if (variantDetails) {
      let detailsHTML = '';
      if (variant.sku) {
        detailsHTML += `<span class="product-variant-showcase__sku">SKU: ${variant.sku}</span>`;
      }
      if (variant.barcode) {
        detailsHTML += `<span class="product-variant-showcase__barcode">Barcode: ${variant.barcode}</span>`;
      }
      variantDetails.innerHTML = detailsHTML;
    }
  }

  updateInventory(variant) {
    const inventoryElement = document.querySelector(`#Inventory-${this.dataset.section}`);
    if (!inventoryElement) return;

    if (variant.inventory_management === 'shopify') {
      const quantity = variant.inventory_quantity;
      let statusHTML = '';
      let statusColor = '';

      if (quantity > 0) {
        if (quantity <= 10) { // Assuming threshold of 10
          statusColor = 'rgb(238, 148, 65)';
          statusHTML = `<span class="svg-wrapper" style="color: ${statusColor}">
            <svg><!-- Low stock icon --></svg>
          </span>
          Low stock (${quantity} left)`;
        } else {
          statusColor = 'rgb(62, 214, 96)';
          statusHTML = `<span class="svg-wrapper" style="color: ${statusColor}">
            <svg><!-- In stock icon --></svg>
          </span>
          In stock (${quantity} available)`;
        }
      } else {
        statusColor = 'rgb(200, 200, 200)';
        statusHTML = `<span class="svg-wrapper" style="color: ${statusColor}">
          <svg><!-- Out of stock icon --></svg>
        </span>
        Out of stock`;
      }

      inventoryElement.innerHTML = statusHTML;
      inventoryElement.classList.remove('visibility-hidden');
    } else {
      inventoryElement.classList.add('visibility-hidden');
    }

    this.animateElement(inventoryElement);
  }

  updateImages(variant) {
    if (!this.mediaGallery || !variant.featured_media) return;

    const targetMedia = this.mediaGallery.querySelector(`[data-media-id="${this.dataset.section}-${variant.featured_media.id}"]`);
    if (!targetMedia) return;

    // Update main gallery
    const currentActive = this.mediaGallery.querySelector('.media-gallery__media.is-active');
    if (currentActive && currentActive !== targetMedia) {
      currentActive.classList.remove('is-active');
      targetMedia.classList.add('is-active');
      
      // Smooth transition effect
      this.animateImageTransition(currentActive, targetMedia);
    }

    // Update thumbnails
    const thumbnails = this.mediaGallery.querySelectorAll('.media-gallery__thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('is-active'));
    
    const targetThumbnail = this.mediaGallery.querySelector(`[data-target="${this.dataset.section}-${variant.featured_media.id}"]`);
    if (targetThumbnail) {
      targetThumbnail.classList.add('is-active');
    }

    // Update slider counter if present
    const counter = this.mediaGallery.querySelector('.slider-counter--current');
    if (counter && variant.featured_media.position) {
      counter.textContent = variant.featured_media.position;
    }
  }

  animateImageTransition(fromElement, toElement) {
    // Create smooth crossfade effect
    const duration = 300;
    
    fromElement.style.transition = `opacity ${duration}ms ease`;
    toElement.style.transition = `opacity ${duration}ms ease`;
    
    fromElement.style.opacity = '0';
    toElement.style.opacity = '1';
    
    setTimeout(() => {
      fromElement.style.transition = '';
      toElement.style.transition = '';
      fromElement.style.opacity = '';
      toElement.style.opacity = '';
    }, duration);
  }

  updateURL(variant) {
    if (!window.history?.replaceState) return;
    
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant.id);
    window.history.replaceState({}, '', url.toString());
  }

  updateAvailability() {
    if (!this.availableVariants) return;

    this.optionGroups.forEach((group, groupIndex) => {
      const inputs = group.querySelectorAll('input[type="radio"]');
      
      inputs.forEach(input => {
        const isAvailable = this.isOptionAvailable(groupIndex, input.value);
        const label = group.querySelector(`label[for="${input.id}"]`);
        
        if (label) {
          if (isAvailable) {
            label.removeAttribute('data-unavailable');
            input.disabled = false;
          } else {
            label.setAttribute('data-unavailable', 'true');
            input.disabled = true;
          }
        }
      });
    });
  }

  isOptionAvailable(optionIndex, optionValue) {
    const currentSelections = Array.from(this.colorInputs)
      .filter(input => input.checked && input !== this.colorInputs[optionIndex])
      .map(input => input.value);

    return this.availableVariants.some(variant => {
      if (!variant.available) return false;
      if (variant.options[optionIndex] !== optionValue) return false;
      
      return currentSelections.every((selection, index) => {
        const checkIndex = index >= optionIndex ? index + 1 : index;
        return variant.options[checkIndex] === selection;
      });
    });
  }

  addSelectionFeedback(input) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (!label) return;

    // Add ripple effect
    label.style.position = 'relative';
    label.style.overflow = 'hidden';
    
    const ripple = document.createElement('span');
    ripple.style.position = 'absolute';
    ripple.style.top = '50%';
    ripple.style.left = '50%';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.background = 'rgba(255, 255, 255, 0.6)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.animation = 'ripple 0.6s ease-out';
    
    label.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  animateElement(element) {
    if (!element) return;
    
    element.style.transform = 'scale(0.95)';
    element.style.opacity = '0.7';
    element.style.transition = 'all 0.2s ease';
    
    setTimeout(() => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    }, 50);
    
    setTimeout(() => {
      element.style.transition = '';
      element.style.transform = '';
      element.style.opacity = '';
    }, 250);
  }

  handleVariantUpdate(variant) {
    if (!variant) return;
    
    this.currentVariant = variant;
    this.updateAvailability();
    
    // Update form inputs to match the variant
    this.colorInputs.forEach(input => {
      const optionName = input.name;
      const variantOption = variant.options.find(opt => 
        opt.name.toLowerCase() === optionName.toLowerCase()
      );
      
      if (variantOption && input.value === variantOption.value) {
        input.checked = true;
        this.addSelectionFeedback(input);
      }
    });
    
    this.updateSelectedValues();
  }

  setLoadingState(isLoading) {
    this.isLoading = isLoading;
    
    if (this.variantSelectors) {
      this.variantSelectors.setAttribute('data-loading', isLoading.toString());
    }
    
    this.optionGroups.forEach(group => {
      group.style.pointerEvents = isLoading ? 'none' : '';
      group.style.opacity = isLoading ? '0.6' : '';
    });
  }
}

// CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      width: 100px;
      height: 100px;
      opacity: 0;
    }
  }
  
  .product-variant-showcase__selects[data-loading="true"] {
    position: relative;
  }
  
  .product-variant-showcase__selects[data-loading="true"]::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(var(--color-foreground), 0.3);
    border-top-color: rgb(var(--color-foreground));
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 10;
  }
  
  @keyframes spin {
    to {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    customElements.define('product-info', ProductVariantShowcase);
  });
} else {
  customElements.define('product-info', ProductVariantShowcase);
}

// Export for use in other scripts
window.ProductVariantShowcase = ProductVariantShowcase;