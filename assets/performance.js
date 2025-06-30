/**
 * Performance Optimization Module
 * Handles code splitting, dynamic imports, and performance monitoring
 */

class PerformanceOptimizer {
  constructor() {
    this.modules = {};
    this.loadedModules = new Set();
    this.pendingModules = new Map();
    
    // Get settings from window.themeSettings
    this.settings = window.themeSettings || {
      enablePerformance: true,
      enableImageOpt: true,
      enableJsOpt: true,
      enableCssOpt: true,
      imageQuality: 80,
      enablePerformanceMonitoring: true
    };
    
    // Define module paths
    this.moduleDefinitions = {
      'cart': '/assets/cart.js',
      'wishlist': '/assets/wishlist.js',
      'compare': '/assets/compare.js',
      'quickView': '/assets/quick-view.js',
      'darkMode': '/assets/dark-mode.js',
      'notification': '/assets/notification.js',
      'productZoom': '/assets/product-zoom.js',
      'recentlyViewed': '/assets/recently-viewed.js'
    };
    
    // Initialize performance monitoring if enabled
    if (this.settings.enablePerformance && this.settings.enablePerformanceMonitoring) {
      this.initPerformanceMonitoring();
    }
  }
  
  /**
   * Initialize performance monitoring
   */
  initPerformanceMonitoring() {
    if ('performance' in window && 'PerformanceObserver' in window) {
      // Create performance observer for Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP metric
        console.log('LCP:', lastEntry.startTime / 1000, 'seconds');
        
        // You can send this data to your analytics service
      });
      
      // Start observing LCP
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      
      // Create performance observer for First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const firstEntry = entries[0];
        
        // Log FID metric
        console.log('FID:', firstEntry.processingStart - firstEntry.startTime, 'ms');
        
        // You can send this data to your analytics service
      });
      
      // Start observing FID
      fidObserver.observe({ type: 'first-input', buffered: true });
      
      // Create performance observer for Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        
        // Log CLS metric
        console.log('CLS:', clsValue);
        
        // You can send this data to your analytics service
      });
      
      // Start observing CLS
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    }
  }
  
  /**
   * Load a module dynamically
   * @param {string} moduleName - Name of the module to load
   * @returns {Promise} - Promise that resolves when the module is loaded
   */
  loadModule(moduleName) {
    // Check if module is already loaded
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve(this.modules[moduleName]);
    }
    
    // Check if module is already being loaded
    if (this.pendingModules.has(moduleName)) {
      return this.pendingModules.get(moduleName);
    }
    
    // Check if module exists in definitions
    if (!this.moduleDefinitions[moduleName]) {
      return Promise.reject(new Error(`Module "${moduleName}" not found`));
    }
    
    // Create a promise for loading the module
    const modulePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = this.moduleDefinitions[moduleName];
      script.async = true;
      
      script.onload = () => {
        // Module loaded successfully
        this.loadedModules.add(moduleName);
        this.pendingModules.delete(moduleName);
        
        // Store module reference if it's exposed globally
        if (window[moduleName]) {
          this.modules[moduleName] = window[moduleName];
        }
        
        resolve(this.modules[moduleName]);
      };
      
      script.onerror = () => {
        this.pendingModules.delete(moduleName);
        reject(new Error(`Failed to load module "${moduleName}"`));
      };
      
      document.head.appendChild(script);
    });
    
    // Store the pending promise
    this.pendingModules.set(moduleName, modulePromise);
    
    return modulePromise;
  }
  
  /**
   * Load multiple modules
   * @param {Array<string>} moduleNames - Array of module names to load
   * @returns {Promise} - Promise that resolves when all modules are loaded
   */
  loadModules(moduleNames) {
    const promises = moduleNames.map(name => this.loadModule(name));
    return Promise.all(promises);
  }
  
  /**
   * Load modules based on current page template
   */
  loadModulesByTemplate() {
    // Get current template from body data attribute
    const template = document.body.dataset.template;
    
    if (!template) return;
    
    // Define which modules to load for each template
    const templateModules = {
      'index': ['recentlyViewed'],
      'product': ['productZoom', 'quickView', 'recentlyViewed'],
      'collection': ['quickView'],
      'cart': ['cart'],
      'wishlist': ['wishlist'],
      'compare': ['compare']
    };
    
    // Load common modules for all pages
    const commonModules = ['notification', 'darkMode'];
    
    // Combine common modules with template-specific modules
    const modulesToLoad = [
      ...commonModules,
      ...(templateModules[template] || [])
    ];
    
    // Load the modules
    this.loadModules(modulesToLoad)
      .catch(error => {
        console.error('Error loading modules:', error);
      });
  }
  
  /**
   * Initialize modules based on DOM elements
   */
  initModulesByElements() {
    // Check for cart elements
    if (document.getElementById('cart-drawer') || document.getElementById('cart-page')) {
      this.loadModule('cart');
    }
    
    // Check for wishlist elements
    if (document.getElementById('wishlist-toggle') || document.querySelector('.wishlist-toggle')) {
      this.loadModule('wishlist');
    }
    
    // Check for compare elements
    if (document.getElementById('compare-drawer') || document.querySelector('.compare-toggle')) {
      this.loadModule('compare');
    }
    
    // Check for quick view elements
    if (document.getElementById('quick-view-modal') || document.querySelector('[data-quick-view]')) {
      this.loadModule('quickView');
    }
    
    // Check for product zoom elements
    if (document.querySelector('.product-image-zoom')) {
      this.loadModule('productZoom');
    }
  }
  
  /**
   * Prefetch modules for future use
   * @param {Array<string>} moduleNames - Array of module names to prefetch
   */
  prefetchModules(moduleNames) {
    moduleNames.forEach(name => {
      if (!this.moduleDefinitions[name]) return;
      
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = this.moduleDefinitions[name];
      link.as = 'script';
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Optimize images on the page
   */
  optimizeImages() {
    // Find all images that don't have the lazy-image class
    const images = document.querySelectorAll('img:not(.lazy-image):not([loading="lazy"])');
    
    images.forEach(img => {
      // Add loading="lazy" attribute for native lazy loading
      img.setAttribute('loading', 'lazy');
      
      // Add decoding="async" to allow the browser to decode the image asynchronously
      img.setAttribute('decoding', 'async');
    });
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  window.performanceOptimizer = new PerformanceOptimizer();
  
  // Load modules based on current page
  window.performanceOptimizer.loadModulesByTemplate();
  
  // Initialize modules based on DOM elements
  window.performanceOptimizer.initModulesByElements();
  
  // Optimize images
  window.performanceOptimizer.optimizeImages();
  
  // Prefetch modules that might be needed soon
  // This is done after the page is loaded to avoid blocking critical resources
  window.addEventListener('load', () => {
    window.performanceOptimizer.prefetchModules(['cart', 'wishlist', 'quickView']);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}