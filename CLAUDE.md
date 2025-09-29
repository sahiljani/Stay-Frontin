# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Shopify theme based on **Dawn v15.4.0** (Shopify's default theme). The theme uses Liquid templating, HTML, CSS, and JavaScript to create the storefront experience. Tailwind CSS v4 has been integrated for utility-first styling.

## Commands

### Development
```bash
npm run dev
```
Watches and compiles Tailwind CSS from `input.css` to `assets/tailwind.css`. Run this during development when modifying Tailwind styles.

### Shopify CLI (if using)
```bash
shopify theme serve    # Local development server
shopify theme push     # Push changes to Shopify store
shopify theme pull     # Pull theme from Shopify store
```

## Architecture

### Directory Structure

**Standard Shopify Theme Structure:**
- `assets/` - Static files (CSS, JS, images, icons, SVGs)
- `config/` - Theme settings configuration
  - `settings_schema.json` - Defines theme customization options in Shopify admin
  - `settings_data.json` - Default values for theme settings
- `layout/` - Base templates (`theme.liquid`, `password.liquid`)
- `locales/` - Translation files for internationalization
- `sections/` - Reusable content blocks that merchants can add/remove/reorder
- `snippets/` - Reusable Liquid template partials
- `templates/` - Page templates (product, collection, etc.)

### Custom Sections

This theme includes several custom sections beyond standard Dawn:

- **`bundle-product.liquid`** - Bundle offers with quantity discounts
- **`comparison-table.liquid`** - Product comparison features
- **`feature-showcase.liquid`** - Feature highlight sections
- **`hero-2-grid.liquid`** - Two-column hero layouts
- **`image-with-overlap-slider.liquid`** - Image sliders with overlap effects
- **`main-product-variant-showcase.liquid`** - Enhanced variant displays
- **`product-admin-manager.liquid`** - Admin product management interface
- **`side-image-product-carousel.liquid`** - Product carousels with side images
- **`testimonials.liquid`** - Customer testimonial sections
- **`video-carousel.liquid`** - Video carousel functionality

### Styling Architecture

**Hybrid CSS Approach:**
- Base theme uses traditional CSS with CSS variables (defined in `assets/base.css`)
- Tailwind CSS v4 integrated for utility classes (compiled to `assets/tailwind.css`)
- Component-specific CSS files follow `component-*.css` naming pattern
- Section-specific CSS files follow `section-*.css` naming pattern

**Key CSS Files:**
- `base.css` - Core theme styles and CSS custom properties
- `tailwind.css` - Generated Tailwind output (do not edit directly)
- `input.css` - Tailwind source file (single import statement)

### JavaScript Architecture

**Core Scripts (loaded on all pages):**
- `constants.js` - Global constants and configuration
- `pubsub.js` - Event publication/subscription system for component communication
- `global.js` - Common utilities (debounce, throttle, fetch config, etc.)
- `details-disclosure.js` - Disclosure/accordion functionality
- `details-modal.js` - Modal dialog behavior
- `search-form.js` - Search functionality
- `embla-carousel-init.js` - Carousel initialization

**Component Scripts:**
JavaScript files in `assets/` correspond to specific sections/snippets and are loaded conditionally. Examples: `cart.js`, `product-form.js`, `facets.js`, `predictive-search.js`

### Liquid Template System

**Layout Hierarchy:**
1. `layout/theme.liquid` - Main layout wrapper for all pages
2. Templates in `templates/` define page-specific structure
3. Sections in `sections/` provide customizable content blocks
4. Snippets in `snippets/` are reusable template partials

**Key Snippets:**
- `buy-buttons.liquid` - Add to cart and purchase buttons
- `card-product.liquid` - Product card displays
- `price.liquid` - Product price formatting
- `product-variant-picker.liquid` - Variant selection interface (standard)
- `product-variant-picker-enhanced.liquid` - Enhanced variant selection
- `product-media-gallery.liquid` - Product image galleries (standard)
- `product-media-gallery-enhanced.liquid` - Enhanced media galleries

## Development Conventions

### When Adding New Sections
1. Create `.liquid` file in `sections/` with schema block at bottom
2. Add corresponding CSS in `assets/section-[name].css`
3. Add corresponding JS in `assets/[name].js` if interactive functionality needed
4. Reference assets in section file using Liquid asset filters

### When Modifying Styles
- For utility classes: modify `input.css` and run `npm run dev`
- For component styles: edit corresponding `component-*.css` or `section-*.css` file
- For theme-wide variables: edit CSS custom properties in `assets/base.css`

### Liquid Best Practices
- Use `{%- -%}` to strip whitespace in Liquid tags
- Leverage section settings for merchant customization
- Render snippets with `{% render 'snippet-name' %}`
- Include snippets with `{% include 'snippet-name' %}` only when variable scope sharing is required

### Asset References
```liquid
{{ 'filename.css' | asset_url | stylesheet_tag }}
{{ 'filename.js' | asset_url | script_tag }}
<script src="{{ 'filename.js' | asset_url }}" defer="defer"></script>
```

## Important Notes

- Theme uses deferred JavaScript loading for performance
- Animations controlled by `settings.animations_reveal_on_scroll` setting
- Custom elements and web components used for interactive features
- Section groups: `header-group.json` and `footer-group.json` define header/footer layouts