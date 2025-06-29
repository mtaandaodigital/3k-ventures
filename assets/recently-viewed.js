/**
 * Recently Viewed Products functionality for 3K Ventures theme
 */

document.addEventListener('DOMContentLoaded', function() {
  // Track current product view
  trackProductView();
});

/**
 * Track the current product view
 */
function trackProductView() {
  // Check if we're on a product page
  const productHandle = getProductHandle();
  if (!productHandle) return;
  
  // Get existing recently viewed products
  let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
  
  // Remove this product if it's already in the list
  recentlyViewed = recentlyViewed.filter(handle => handle !== productHandle);
  
  // Add this product to the beginning of the list
  recentlyViewed.unshift(productHandle);
  
  // Limit the list to 12 products
  if (recentlyViewed.length > 12) {
    recentlyViewed = recentlyViewed.slice(0, 12);
  }
  
  // Save the updated list
  localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}

/**
 * Get the current product handle from the URL or meta tag
 * @returns {string|null} - The product handle or null if not on a product page
 */
function getProductHandle() {
  // Try to get from meta tag first
  const metaTag = document.querySelector('meta[property="og:url"]');
  if (metaTag) {
    const url = metaTag.getAttribute('content');
    if (url && url.includes('/products/')) {
      return url.split('/products/')[1].split('?')[0];
    }
  }
  
  // Try to get from URL
  const path = window.location.pathname;
  if (path.includes('/products/')) {
    return path.split('/products/')[1].split('?')[0];
  }
  
  return null;
}