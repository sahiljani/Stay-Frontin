# Add to Cart & Buy It Now - Setup Guide

## Current Status: ✅ BUTTONS ARE CONFIGURED

Your "Add to Cart" and "Buy it now" buttons are already set up and should be working. If they're not working, follow this troubleshooting guide.

---

## 🔍 How It Works

### 1. Add to Cart Button

**What it does:**
- Adds the product to cart
- Shows loading spinner
- Updates cart count
- Opens cart drawer/notification

**Code Location:** [snippets/buy-buttons.liquid:74-95](snippets/buy-buttons.liquid#L74)

```liquid
<button
  id="ProductSubmitButton-{{ section_id }}"
  type="submit"
  name="add"
  class="product-form__submit button button--animated button--full-width"
>
  <span>Add to cart</span>
  {%- render 'loading-spinner' -%}
</button>
```

### 2. Buy It Now Button

**What it does:**
- Shopify's dynamic checkout buttons
- Shows: Shop Pay, PayPal, Apple Pay, Google Pay, etc.
- Bypasses cart and goes straight to checkout

**Code Location:** [snippets/buy-buttons.liquid:96-98](snippets/buy-buttons.liquid#L96)

```liquid
{%- if show_dynamic_checkout -%}
  {{ form | payment_button }}
{%- endif -%}
```

---

## ✅ Required Components

All these are already in place:

### 1. Product Form (`product-form`)
- **File:** `assets/product-form.js` ✅
- **Status:** Loaded and working
- **Handles:** Form submission, cart API calls, error handling

### 2. Cart System
- **Cart Drawer:** `cart-drawer` element ✅
- **Cart Notification:** `cart-notification` element ✅
- **One of these must be present on the page**

### 3. Loading Spinner
- **Snippet:** `snippets/loading-spinner.liquid` ✅
- **Shows during add to cart**

### 4. Variant Selection
- **Input:** Hidden input with variant ID ✅
- **Updates when variant changes**

---

## 🛠️ Troubleshooting

### Issue 1: "Add to Cart" button does nothing

**Check:**

1. **Is JavaScript loading?**
   - Open browser console (F12)
   - Look for errors
   - Type: `customElements.get('product-form')`
   - Should return a class definition, not `undefined`

2. **Is the form present?**
   - Inspect the page
   - Look for `<product-form>` element
   - Should contain a `<form>` with `data-type="add-to-cart-form"`

3. **Is variant selected?**
   - Check hidden input: `<input class="product-variant-id">`
   - Should have a valid variant ID value
   - Should NOT be disabled

**Fix:**
```liquid
// In sections/main-product.liquid, ensure these are loaded:
{{ 'product-form.js' | asset_url | script_tag }}
{{ 'product-info.js' | asset_url | script_tag }}
```

### Issue 2: Button is disabled

**Reasons:**
- Product is sold out
- No variant selected
- Variant unavailable
- Inventory quantity rules not met

**Check:**
- Look for `disabled` attribute on button
- Check product availability in Shopify admin
- Ensure product has available variants

**Debug:**
```liquid
{%- if product.selected_or_first_available_variant.available -%}
  Available: Yes
{%- else -%}
  Available: No - {{ product.selected_or_first_available_variant.inventory_quantity }}
{%- endif -%}
```

### Issue 3: "Buy it now" not showing

**Reasons:**
- Dynamic checkout disabled in settings
- Product is gift card
- Theme settings

**Check:**
1. Go to Shopify Admin
2. Online Store → Themes → Customize
3. Find your product section
4. Look for "Show dynamic checkout buttons" setting
5. Make sure it's checked ✅

**Or check in code:**
```liquid
{%- if block.settings.show_dynamic_checkout -%}
  Enabled
{%- else -%}
  Disabled
{%- endif -%}
```

### Issue 4: Cart doesn't update after add

**Check:**
1. **Cart drawer/notification present?**
   ```javascript
   console.log(document.querySelector('cart-drawer'));
   console.log(document.querySelector('cart-notification'));
   ```
   At least one should not be `null`

2. **Routes configured?**
   ```javascript
   console.log(window.routes);
   ```
   Should show `cart_add_url`, `cart_url`, etc.

3. **Check network tab:**
   - Open DevTools → Network
   - Click "Add to Cart"
   - Look for request to `/cart/add.js`
   - Check response

### Issue 5: Loading spinner stuck

**Reasons:**
- API error
- Network timeout
- Missing error handling

**Check console for errors:**
```javascript
// Should see errors if cart add fails
```

**Fix:** Check `product-form.js` error handlers are present

---

## 🧪 Testing Checklist

Test these scenarios:

- [ ] Click "Add to Cart" with default variant
- [ ] Change variant color/size, then add to cart
- [ ] Add multiple quantities
- [ ] Add when out of stock (should be disabled)
- [ ] Click "Buy it now" (should redirect to checkout)
- [ ] Test on mobile device
- [ ] Test with network throttling (slow 3G)
- [ ] Test with JavaScript disabled (graceful degradation)

---

## 📋 Debug Console Commands

Open browser console (F12) and run these:

### Check if product form is loaded:
```javascript
console.log(customElements.get('product-form'));
// Should return: class ProductForm extends HTMLElement
```

### Check current variant:
```javascript
const variantInput = document.querySelector('.product-variant-id');
console.log('Variant ID:', variantInput.value);
console.log('Is disabled:', variantInput.disabled);
```

### Check cart element:
```javascript
const cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
console.log('Cart element:', cart);
```

### Test add to cart manually:
```javascript
const form = document.querySelector('product-form form');
const formData = new FormData(form);
fetch('/cart/add.js', {
  method: 'POST',
  body: formData
})
.then(r => r.json())
.then(data => console.log('Cart response:', data))
.catch(err => console.error('Cart error:', err));
```

### Check routes:
```javascript
console.log('Routes:', window.routes);
// Should show: cart_add_url, cart_url, etc.
```

---

## 🔧 Manual Configuration

If buttons still don't work, verify these files are loaded in `sections/main-product.liquid`:

```liquid
{%- comment -%} Line ~42 - JavaScript files {%- endcomment -%}
<script src="{{ 'product-info.js' | asset_url }}" defer="defer"></script>
<script src="{{ 'product-form.js' | asset_url }}" defer="defer"></script>
```

And in `layout/theme.liquid`:

```liquid
{%- comment -%} Global cart scripts {%- endcomment -%}
<script src="{{ 'cart-notification.js' | asset_url }}" defer="defer"></script>
{%- comment -%} OR {%- endcomment -%}
<script src="{{ 'cart-drawer.js' | asset_url }}" defer="defer"></script>
```

---

## 🎯 Expected Behavior

### When clicking "Add to Cart":

1. ✅ Button shows loading spinner
2. ✅ Button text changes to loading state
3. ✅ Request sent to `/cart/add.js`
4. ✅ Cart count updates in header
5. ✅ Cart drawer opens (or notification appears)
6. ✅ Success message shown
7. ✅ Button returns to normal state

### When clicking "Buy it now":

1. ✅ Product added to cart automatically
2. ✅ Page redirects to checkout
3. ✅ Selected variant and quantity preserved
4. ✅ Payment options shown (Shop Pay, PayPal, etc.)

---

## 🚨 Common Errors & Solutions

### Error: "Cannot read property 'addEventListener' of null"
**Solution:** Form element not found. Check that `<product-form>` wraps the form.

### Error: "routes is not defined"
**Solution:** Add routes in `layout/theme.liquid`:
```liquid
<script>
  window.routes = {
    cart_add_url: '{{ routes.cart_add_url }}',
    cart_change_url: '{{ routes.cart_change_url }}',
    cart_update_url: '{{ routes.cart_update_url }}',
    cart_url: '{{ routes.cart_url }}'
  };
</script>
```

### Error: 422 Unprocessable Entity
**Solution:** Invalid variant ID or product not available. Check inventory.

### Error: CORS or network error
**Solution:** Make sure you're testing on actual Shopify store, not local file.

---

## ✨ Animated Button Integration

Your buttons now have the center-expand animation! This is controlled by:

**CSS:** `assets/component-button-animated.css`
**Class:** `button--animated`

The animation:
- ✅ Works during normal state
- ✅ Disabled during loading
- ✅ Disabled when button is disabled
- ✅ Maintains accessibility

---

## 📞 Still Not Working?

If buttons still don't work after checking everything:

1. **Check Shopify theme editor:**
   - Go to Online Store → Themes
   - Click "Customize"
   - Navigate to a product page
   - Test buttons in the preview

2. **Check published theme:**
   - Make sure changes are published
   - Clear browser cache (Ctrl+Shift+R)
   - Test in incognito/private window

3. **Check product settings:**
   - Product has variants
   - Product is not draft
   - Inventory tracking is correct
   - Price is set

4. **Browser console:**
   - Look for JavaScript errors (red text)
   - Copy and include in support request

---

## ✅ Quick Fix Checklist

Run through this list:

- [ ] JavaScript files loading (no 404 errors)
- [ ] `product-form` custom element defined
- [ ] Cart drawer or cart notification present
- [ ] Product has available variants
- [ ] Variant ID input has value
- [ ] Submit button not permanently disabled
- [ ] Routes object defined globally
- [ ] No JavaScript console errors
- [ ] Testing on actual Shopify store (not local)
- [ ] Browser cache cleared

---

## 🎉 Expected Result

When everything is working:

```
User clicks "Add to Cart"
  ↓
Button shows loading spinner
  ↓
Product added to cart via AJAX
  ↓
Cart drawer slides open
  ↓
"Added to cart" message shown
  ↓
Button returns to normal
  ↓
User can continue shopping or checkout
```

Your setup already has all components in place! The buttons should be working. If not, use the troubleshooting steps above to diagnose the issue.
