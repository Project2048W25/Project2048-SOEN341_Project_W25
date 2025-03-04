/** @type {import('stylelint').Config} */

module.exports = {
    extends: [
        "stylelint-config-recommended", // Use recommended rules
        "stylelint-config-standard" // Standard rules for better CSS practices
    ],
    plugins: [
        "stylelint-order" // Plugin for ordering rules
    ],
    rules: {
        "indentation": 2, // Enforce 2-space indentation
        "string-quotes": "double", // Use double quotes for strings
        "color-hex-case": "lower", // Enforce lowercase hex colors
        "color-hex-length": "short", // Prefer short hex values when possible
        "block-no-empty": true, // Disallow empty blocks
        "max-nesting-depth": 3, // Limit nesting to 3 levels
        "selector-max-id": 0, // Disallow IDs in selectors
        "selector-max-class": 3, // Limit the number of classes in a selector
        "order/properties-alphabetical-order": true // Enforce alphabetical order of properties
    }
};
