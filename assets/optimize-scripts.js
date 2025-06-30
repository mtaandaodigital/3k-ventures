/**
 * Script Optimization Utility
 * 
 * This script combines and optimizes JavaScript files to reduce HTTP requests
 * and improve page load performance.
 * 
 * Usage:
 * 1. Run this script with Node.js
 * 2. It will create optimized bundles in the assets directory
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

// Configuration
const config = {
  // Define bundles to create
  bundles: [
    {
      name: 'core-bundle.min.js',
      files: [
        'application.js',
        'theme.js',
        'dark-mode.js',
        'notification.js'
      ]
    },
    {
      name: 'product-bundle.min.js',
      files: [
        'product-page.js',
        'product-zoom.js',
        'recently-viewed.js'
      ]
    },
    {
      name: 'shop-bundle.min.js',
      files: [
        'cart.js',
        'wishlist.js',
        'compare.js',
        'quick-view.js'
      ]
    }
  ],
  // Source directory for JavaScript files
  sourceDir: path.join(__dirname, 'assets'),
  // Output directory for bundled files
  outputDir: path.join(__dirname, 'assets'),
  // Minification options
  minifyOptions: {
    compress: {
      drop_console: false,
      drop_debugger: true
    },
    mangle: true,
    output: {
      comments: false
    }
  }
};

/**
 * Read a file and return its contents
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} - File contents
 */
async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
}

/**
 * Write data to a file
 * @param {string} filePath - Path to the file
 * @param {string} data - Data to write
 * @returns {Promise<void>}
 */
async function writeFile(filePath, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Create a bundle from multiple files
 * @param {Object} bundle - Bundle configuration
 * @returns {Promise<void>}
 */
async function createBundle(bundle) {
  try {
    console.log(`Creating bundle: ${bundle.name}`);
    
    // Read and concatenate all files
    let bundleContent = '';
    for (const file of bundle.files) {
      const filePath = path.join(config.sourceDir, file);
      try {
        const content = await readFile(filePath);
        bundleContent += `\n/* ${file} */\n${content}\n`;
      } catch (err) {
        console.warn(`Warning: Could not read file ${file}. Skipping.`);
      }
    }
    
    // Minify the bundle
    const minified = await minify(bundleContent, config.minifyOptions);
    
    // Write the bundle to the output directory
    const outputPath = path.join(config.outputDir, bundle.name);
    await writeFile(outputPath, minified.code);
    
    console.log(`Bundle created: ${bundle.name} (${(minified.code.length / 1024).toFixed(2)} KB)`);
  } catch (err) {
    console.error(`Error creating bundle ${bundle.name}:`, err);
  }
}

/**
 * Main function to create all bundles
 */
async function main() {
  console.log('Starting script optimization...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  // Create each bundle
  for (const bundle of config.bundles) {
    await createBundle(bundle);
  }
  
  console.log('Script optimization complete!');
}

// Run the main function
main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});