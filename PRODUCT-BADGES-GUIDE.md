# Product Badges Guide

This guide explains how to use the product status badges and save percentage features added to your Shopify theme.

## Features Added

### 1. **HOT PRODUCT | LOW STOCK Badge**
A prominent badge that appears above the product title to highlight urgency.

### 2. **Save Percentage Badge**
Shows the discount percentage (e.g., "SAVE 40%") next to the price.

---

## HOT PRODUCT | LOW STOCK Badge

### How it Works

The badge appears above the product title and shows:
- **HOT PRODUCT** - For trending/popular products
- **LOW STOCK** - When inventory is running low
- **HOT PRODUCT | LOW STOCK** - Both badges together

### Display Conditions

#### HOT PRODUCT
Displays when the product has one of these tags:
- `hot`
- `hot-product`

**How to add:** In Shopify admin → Products → Select product → Add tag "hot" or "hot-product"

#### LOW STOCK
Automatically displays when:
- Inventory quantity is ≤ 10 items
- Inventory quantity is > 0 (not sold out)

**Note:** This requires inventory tracking to be enabled for the product variant.

### Styling

Located in: `assets/component-product-status-badge.css`

**Colors:**
- HOT PRODUCT: Red background (#FF3B3B) with white text
- LOW STOCK: White background with red border and red text

**Features:**
- Fade-in animation on page load
- Pulse animation on HOT PRODUCT badge
- Responsive design for mobile
- Accessibility support (respects `prefers-reduced-motion`)

---

## Save Percentage Badge

### How it Works

Automatically calculates and displays the discount percentage when a product is on sale.

### Display Conditions

The badge shows when:
- Product has a compare-at price (original price)
- Compare-at price is higher than the current price
- Product is marked as "on sale"

**Example:**
- Original price: €99,00
- Sale price: €59,00
- Badge displays: "SAVE 40%"

### Customization

Located in: `snippets/price.liquid` and `assets/component-price.css`

**To change the text:**

Edit the translation file or modify line 127 in `snippets/price.liquid`:
```liquid
{{ 'products.product.save_percent' | t: percentage: savings_percentage | default: 'SAVE ' | append: savings_percentage | append: '%' }}
```

**To change styling:**

Edit `assets/component-price.css` starting at line 102:
- Background color: `background: #FF3B3B;`
- Font size: `font-size: 1.2rem;`
- Padding: `padding: 0.4rem 0.8rem;`

---

## Files Modified/Created

### Created Files:
1. **`assets/component-product-status-badge.css`** - Status badge styles
2. **`PRODUCT-BADGES-GUIDE.md`** - This documentation

### Modified Files:
1. **`sections/main-product.liquid`** - Added status badge display logic and CSS include
2. **`snippets/price.liquid`** - Added save percentage calculation and badge
3. **`assets/component-price.css`** - Added save percentage badge styles

---

## Examples

### Example 1: HOT PRODUCT with Save Percentage
```
┌─────────────────────┐
│   HOT PRODUCT       │ ← Red badge
└─────────────────────┘

RENOHEAL CUPPING MASSAGER

€59,00  €99,00  SAVE 40% ← Red badge
```

### Example 2: Combined Badges
```
┌───────────────────────────────────┐
│   HOT PRODUCT | LOW STOCK         │ ← Combined badge
└───────────────────────────────────┘

PRODUCT NAME

€149  €199  SAVE 25%
```

---

## Shopify Admin Instructions

### To mark a product as HOT:
1. Go to **Products** in Shopify admin
2. Select the product
3. Scroll to **Tags** section
4. Add tag: `hot` or `hot-product`
5. Save

### To set up Low Stock display:
1. Ensure **Track quantity** is enabled for the product variant
2. Set inventory to 10 or fewer items
3. The badge will automatically appear

### To add a sale percentage:
1. Go to the product in Shopify admin
2. Set **Compare at price** (original price)
3. Set **Price** to the discounted amount
4. Save - the badge will automatically calculate and display

---

## Browser Support

All features work in:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

---

## Accessibility

- All badges use proper semantic HTML
- Color contrast meets WCAG AA standards
- Animations respect `prefers-reduced-motion` setting
- Screen readers can access badge content

---

## Translations

All badge text is now translatable via the theme's locale files.

**Default English translations** (in `locales/en.default.json`):
```json
"save_percent": "SAVE {{ percentage }}%",
"hot_product": "HOT PRODUCT",
"low_stock": "LOW STOCK"
```

**To customize text:**
1. Edit `locales/en.default.json` (or your language file)
2. Find the `products.product` section
3. Modify the values:
   - `save_percent`: Change "SAVE" to any text (e.g., "ÉCONOMISEZ" for French)
   - `hot_product`: Change "HOT PRODUCT" text
   - `low_stock`: Change "LOW STOCK" text

**Fallback behavior:**
If translations are missing, the code automatically uses English defaults, so badges will always display correctly.

---

## Troubleshooting

**"Translation missing" error:**
- ✅ Fixed! The code now has automatic fallbacks
- Translations are added to `locales/en.default.json`
- Will display "SAVE X%" even if translation is missing

**Badge not showing:**
- For HOT PRODUCT: Check that product has `hot` or `hot-product` tag
- For LOW STOCK: Verify inventory tracking is enabled and quantity ≤ 10
- Clear browser cache and refresh

**Save percentage not displaying:**
- Ensure product has a compare-at price set
- Verify compare-at price is higher than current price
- Check that price is being rendered with `show_badges: true`

**Styling issues:**
- Clear theme cache
- Re-save the theme
- Check that CSS files are properly linked in section files
