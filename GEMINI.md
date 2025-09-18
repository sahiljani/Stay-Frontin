# Project Overview

This project is a Shopify theme. Based on the `settings_schema.json` file, the theme is **Dawn**, version **15.4.0**.

Shopify themes are used to define the look and feel of a Shopify online store. This theme uses Liquid, Shopify's templating language, along with HTML, CSS, and JavaScript.

## Key Technologies

*   **Shopify Theme Architecture:** The project follows the standard directory structure for a Shopify theme, including `assets`, `config`, `layout`, `locales`, `sections`, `snippets`, and `templates`.
*   **Liquid:** Shopify's templating language is used in `.liquid` files to render dynamic content.
*   **JavaScript:** The `assets` directory contains several JavaScript files for client-side functionality. `global.js` appears to contain common JavaScript functions used throughout the theme.
*   **CSS:** The `assets` directory contains CSS files for styling. `base.css` seems to be a core stylesheet.

## Building and Running

There are no explicit build commands found (e.g., in a `package.json` or `Makefile`). Shopify themes are typically developed and customized using one of the following methods:

*   **Shopify CLI:** For local development, you can use the Shopify CLI to serve the theme, and push changes to a Shopify store. Common commands include:
    *   `shopify theme serve`: To start a local development server.
    *   `shopify theme push`: To push your local changes to your Shopify store.
*   **Shopify Admin Theme Editor:** Themes can be directly edited and customized within the Shopify admin interface.
*   **Shopify GitHub integration:** Themes can be connected to a GitHub repository to sync changes.

**TODO:** If you are using the Shopify CLI, you can add the specific commands you use to the `GEMINI.md` file.

## Development Conventions

*   **Styling:** The theme uses CSS variables for styling, as seen in `assets/base.css`. This allows for easy customization of colors, fonts, and other design elements.
*   **JavaScript:** The JavaScript code in `assets/global.js` uses modern JavaScript features like classes and custom elements. It also includes some utility functions like `debounce` and `throttle`.
*   **Configuration:** The theme's settings are defined in `config/settings_schema.json` and the default values are in `config/settings_data.json`. This allows for easy customization of the theme through the Shopify admin.
