/**
 * Image Optimizer
 * Handles lazy loading, responsive images, and image optimization
 */

class ImageOptimizer {
  constructor(options = {}) {
    // Get settings from window.themeSettings
    this.settings = window.themeSettings || {
      enablePerformance: true,
      enableImageOpt: true,
      enableJsOpt: true,
      enableCssOpt: true,
      imageQuality: 80,
      enablePerformanceMonitoring: true
    };
    
    // Only proceed if image optimization is enabled
    if (!this.settings.enablePerformance && !this.settings.enableImageOpt) {
      console.log('Image optimization is disabled in theme settings');
      return;
    }
    
    this.options = {
      lazyLoadSelector: 'img.lazy-image',
      lazyLoadThreshold: 0.1, // 10% of the image needs to be visible
      placeholderClass: 'image-placeholder',
      loadedClass: 'loaded',
      imageQuality: this.settings.imageQuality || 80,
      ...options
    };
    
    this.observer = null;
    this.supportsIntersectionObserver = 'IntersectionObserver' in window;
    
    this.init();
  }
  
  init() {
    // Only proceed if image optimization is enabled
    if (!this.settings.enablePerformance && !this.settings.enableImageOpt) {
      return;
    }
    
    if (this.supportsIntersectionObserver) {
      this.setupIntersectionObserver();
    } else {
      this.setupLegacyLazyLoad();
    }
    
    // Handle dynamically added images
    document.addEventListener('lazyimage:update', () => {
      this.refreshLazyImages();
    });
    
    console.log(`Image optimization initialized with quality: ${this.options.imageQuality}%`);
  }
  
  setupIntersectionObserver() {
    const options = {
      root: null, // viewport
      rootMargin: '50px', // load images 50px before they appear in viewport
      threshold: this.options.lazyLoadThreshold
    };
    
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, options);
    
    this.refreshLazyImages();
  }
  
  setupLegacyLazyLoad() {
    // Fallback for browsers that don't support IntersectionObserver
    const lazyLoad = () => {
      const lazyImages = this.getLazyImages();
      
      lazyImages.forEach(image => {
        if (this.isInViewport(image)) {
          this.loadImage(image);
        }
      });
    };
    
    // Initial load
    lazyLoad();
    
    // Add scroll and resize event listeners
    window.addEventListener('scroll', this.throttle(lazyLoad, 200));
    window.addEventListener('resize', this.throttle(lazyLoad, 200));
  }
  
  refreshLazyImages() {
    const lazyImages = this.getLazyImages();
    
    if (this.supportsIntersectionObserver && this.observer) {
      lazyImages.forEach(image => {
        if (!image.classList.contains(this.options.loadedClass)) {
          this.observer.observe(image);
        }
      });
    }
  }
  
  getLazyImages() {
    return Array.from(document.querySelectorAll(this.options.lazyLoadSelector));
  }
  
  loadImage(image) {
    const src = image.dataset.src;
    const srcset = image.dataset.srcset;
    const sizes = image.dataset.sizes;
    
    if (src) {
      // Create a new image to preload
      const img = new Image();
      
      img.onload = () => {
        if (srcset) image.srcset = srcset;
        if (sizes) image.sizes = sizes;
        image.src = src;
        image.classList.add(this.options.loadedClass);
        
        // Remove placeholder if it exists
        const placeholder = image.closest(`.${this.options.placeholderClass}`);
        if (placeholder) {
          placeholder.classList.remove(this.options.placeholderClass);
        }
        
        // Dispatch event when image is loaded
        image.dispatchEvent(new CustomEvent('lazyimage:loaded', {
          bubbles: true,
          detail: { image }
        }));
      };
      
      img.onerror = () => {
        // Handle error - maybe set a fallback image
        console.error(`Failed to load image: ${src}`);
        
        // Dispatch error event
        image.dispatchEvent(new CustomEvent('lazyimage:error', {
          bubbles: true,
          detail: { image, src }
        }));
      };
      
      // Start loading
      img.src = src;
      if (srcset) img.srcset = srcset;
    }
  }
  
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
      rect.bottom >= 0 &&
      rect.right >= 0 &&
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
  
  throttle(func, limit) {
    let inThrottle;
    
    return function() {
      const args = arguments;
      const context = this;
      
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Helper method to generate responsive image URLs for Shopify
  static getResponsiveImageUrl(url, options = {}) {
    if (!url) return '';
    
    const {
      width,
      height,
      crop = '',
      scale = 1,
      format = 'auto'
    } = options;
    
    // Remove any existing image parameters
    let cleanUrl = url.split('?')[0];
    
    // Build query parameters
    const params = [];
    
    if (width) params.push(`width=${width}`);
    if (height) params.push(`height=${height}`);
    if (crop) params.push(`crop=${crop}`);
    if (scale !== 1) params.push(`scale=${scale}`);
    if (format) params.push(`format=${format}`);
    
    // Add query parameters to URL
    if (params.length > 0) {
      cleanUrl += `?${params.join('&')}`;
    }
    
    return cleanUrl;
  }
  
  // Generate srcset for responsive images
  static generateSrcset(url, widths = [200, 400, 600, 800, 1000, 1200]) {
    if (!url) return '';
    
    return widths
      .map(width => {
        const responsiveUrl = this.getResponsiveImageUrl(url, { width });
        return `${responsiveUrl} ${width}w`;
      })
      .join(', ');
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check if image optimization is enabled in theme settings
  const themeSettings = window.themeSettings || {};
  const enableImageOpt = themeSettings.enablePerformance || themeSettings.enableImageOpt;
  
  if (enableImageOpt) {
    window.imageOptimizer = new ImageOptimizer();
    
    // Add helper function to global scope
    window.lazyLoadImage = (element) => {
      if (window.imageOptimizer) {
        window.imageOptimizer.loadImage(element);
      }
    };
    
    // Dispatch event when image optimization is ready
    document.dispatchEvent(new CustomEvent('image-optimization:ready'));
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageOptimizer;
}