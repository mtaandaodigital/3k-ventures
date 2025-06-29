/**
 * Wishlist functionality for 3K Ventures theme
 */

// Cache DOM elements and variables at the global scope to avoid repeated lookups
let wishlistButtons;
let wishlistCountElements;
let wishlistContainer;
let emptyWishlistMessage;

document.addEventListener('DOMContentLoaded', function() {
  // Cache DOM elements
  wishlistCountElements = document.querySelectorAll('.wishlist-count');
  wishlistContainer = document.getElementById('wishlist-container');
  emptyWishlistMessage = document.getElementById('empty-wishlist-message');
  
  // Initialize wishlist
  initWishlist();
});

/**
 * Initialize wishlist functionality
 */
function initWishlist() {
  // Initialize wishlist counts
  updateWishlistCounts();
  
  // Initialize wishlist buttons
  initWishlistButtons();
  
  // Load wishlist products if on wishlist page
  if (wishlistContainer) {
    loadWishlistProducts();
  }
}

/**
 * Initialize wishlist buttons
 * This function can be called after DOM updates (e.g., after loading more products via AJAX)
 */
function initWishlistButtons() {
  wishlistButtons = document.querySelectorAll('[data-wishlist-button]');
  
  if (wishlistButtons.length > 0) {
    wishlistButtons.forEach(button => {
      // Remove existing event listeners to prevent duplicates
      button.removeEventListener('click', handleWishlistClick);
      // Add event listener
      button.addEventListener('click', handleWishlistClick);
      
      // Set initial state
      const productHandle = button.getAttribute('data-product-handle');
      if (productHandle) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlist.includes(productHandle)) {
          button.classList.add('active');
          const svg = button.querySelector('svg');
          if (svg) {
            svg.classList.add('text-olive-verde', 'fill-current');
          }
        }
      }
    });
  }
}

/**
 * Handle wishlist button click
 * @param {Event} event - The click event
 */
function handleWishlistClick(event) {
  event.preventDefault();
  const productHandle = this.getAttribute('data-product-handle');
  if (productHandle) {
    toggleWishlist(productHandle);
  }
}

/**
 * Toggle a product in the wishlist
 * @param {string} productHandle - The product handle to toggle
 */
function toggleWishlist(productHandle) {
  if (!productHandle) return;
  
  let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  const index = wishlist.indexOf(productHandle);
  const isRemoving = index > -1;
  
  // Use a single selector query for better performance
  const buttons = document.querySelectorAll(`[data-product-handle="${productHandle}"][data-wishlist-button]`);
  
  if (isRemoving) {
    // Remove from wishlist
    wishlist.splice(index, 1);
    showToast('Product removed from wishlist', 'info');
    
    // Update button states
    buttons.forEach(button => {
      button.classList.remove('active');
      const svg = button.querySelector('svg');
      if (svg) {
        svg.classList.remove('text-olive-verde', 'fill-current');
      }
    });
    
    // If on wishlist page, remove the product card
    if (wishlistContainer) {
      const productCard = wishlistContainer.querySelector(`[data-product-handle="${productHandle}"]`);
      if (productCard) {
        const card = productCard.closest('.product-card');
        if (card) {
          card.classList.add('animate-fade-out');
          setTimeout(() => {
            card.remove();
            
            // Show empty message if no products left
            if (wishlistContainer.children.length === 0 && emptyWishlistMessage) {
              emptyWishlistMessage.classList.remove('hidden');
            }
          }, 300);
        }
      }
    }
  } else {
    // Add to wishlist
    wishlist.push(productHandle);
    showToast('Product added to wishlist', 'success');
    
    // Update button states
    buttons.forEach(button => {
      button.classList.add('active');
      const svg = button.querySelector('svg');
      if (svg) {
        svg.classList.add('text-olive-verde', 'fill-current', 'animate-pulse');
        // Use requestAnimationFrame for smoother animations
        requestAnimationFrame(() => {
          setTimeout(() => {
            svg.classList.remove('animate-pulse');
          }, 1000);
        });
      }
    });
  }
  
  // Save to localStorage
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  
  // Update counts
  updateWishlistCounts();
  
  // Also update cookies for compatibility with application.js
  if (typeof setCookie === 'function') {
    setCookie('wishlist', JSON.stringify(wishlist), 30);
  }
  
  return wishlist;
}

/**
 * Update all wishlist count elements on the page
 */
function updateWishlistCounts() {
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (wishlistCountElements) {
    wishlistCountElements.forEach(element => {
      element.textContent = wishlist.length;
      element.classList.toggle('hidden', wishlist.length === 0);
    });
  }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The type of toast (success, error, info)
 */
function showToast(message, type = 'success') {
  // Cache toast icons for better performance
  if (!window.toastIcons) {
    window.toastIcons = {
      success: '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>',
      error: '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>',
      info: '<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
    };
  }
  
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => {
    // Cancel any pending animations
    clearTimeout(toast.hideTimeout);
    // Remove the toast
    toast.remove();
  });
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-out opacity-0';
  
  // Add type-specific classes
  switch (type) {
    case 'success':
      toast.classList.add('bg-green-500', 'text-white');
      break;
    case 'error':
      toast.classList.add('bg-red-500', 'text-white');
      break;
    case 'info':
      toast.classList.add('bg-blue-500', 'text-white');
      break;
    default:
      toast.classList.add('bg-gray-800', 'text-white');
  }
  
  // Set icon based on type
  const icon = window.toastIcons[type] || '';
  
  toast.innerHTML = `
    <div class="flex items-center">
      ${icon}
      <span>${message}</span>
    </div>
    <button class="absolute top-1 right-1 text-white opacity-70 hover:opacity-100" onclick="this.parentElement.remove()">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  // Use requestAnimationFrame for smoother animations
  requestAnimationFrame(() => {
    toast.classList.add('opacity-100');
  });
  
  // Animate out after delay
  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove('opacity-100');
    toast.classList.add('opacity-0');
    
    // Remove from DOM after animation completes
    toast.addEventListener('transitionend', () => {
      if (toast.parentElement) {
        document.body.removeChild(toast);
      }
    }, { once: true });
  }, 3000);
  
  return toast;
}

// Export functions for global use
window.showToast = showToast;
window.toggleWishlist = toggleWishlist;

/**
 * Load wishlist products on the wishlist page
 */
function loadWishlistProducts() {
  if (!wishlistContainer) return;
  
  const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
  
  if (wishlist.length === 0) {
    if (emptyWishlistMessage) {
      emptyWishlistMessage.classList.remove('hidden');
    }
    wishlistContainer.innerHTML = '';
    return;
  }
  
  if (emptyWishlistMessage) {
    emptyWishlistMessage.classList.add('hidden');
  }
  
  // Show loading state - use a document fragment for better performance
  const loadingElement = document.createElement('div');
  loadingElement.className = 'flex justify-center items-center py-12';
  loadingElement.innerHTML = '<div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-olive-verde"></div>';
  
  wishlistContainer.innerHTML = '';
  wishlistContainer.appendChild(loadingElement);
  
  // Use a batch approach to fetch products for better performance
  // Fetch products in batches of 4 to avoid overwhelming the server
  const batchSize = 4;
  const batches = [];
  
  for (let i = 0; i < wishlist.length; i += batchSize) {
    batches.push(wishlist.slice(i, i + batchSize));
  }
  
  // Process batches sequentially
  let allProducts = [];
  
  const processBatch = (index) => {
    if (index >= batches.length) {
      // All batches processed, render products
      renderWishlistProducts(allProducts);
      return;
    }
    
    const batch = batches[index];
    const batchPromises = batch.map(handle => {
      return fetch(`/products/${handle}.js`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch product: ${handle}`);
          }
          return response.json();
        })
        .catch(error => {
          console.error('Error fetching product:', error);
          return null;
        });
    });
    
    Promise.all(batchPromises)
      .then(products => {
        // Add valid products to the collection
        allProducts = allProducts.concat(products.filter(p => p !== null));
        // Process next batch
        processBatch(index + 1);
      })
      .catch(error => {
        console.error('Error processing batch:', error);
        processBatch(index + 1);
      });
  };
  
  // Start processing batches
  processBatch(0);
}

/**
 * Render wishlist products
 * @param {Array} products - The products to render
 */
function renderWishlistProducts(products) {
  if (!wishlistContainer) return;
  
  if (products.length === 0) {
    wishlistContainer.innerHTML = '<p class="text-center py-8">No products found in your wishlist.</p>';
    if (emptyWishlistMessage) {
      emptyWishlistMessage.classList.remove('hidden');
    }
    return;
  }
  
  // Use a document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  // Render products
  products.forEach(product => {
    const productCard = createProductCard(product);
    fragment.appendChild(productCard);
  });
  
  // Clear container and append all products at once
  wishlistContainer.innerHTML = '';
  wishlistContainer.appendChild(fragment);
  
  // Initialize wishlist buttons
  initWishlistButtons();
}

/**
 * Create a product card element for the wishlist
 * @param {Object} product - The product data
 * @returns {HTMLElement} - The product card element
 */
function createProductCard(product) {
  if (!product) return null;
  
  const card = document.createElement('div');
  card.className = 'product-card card relative animate-fade-in';
  card.setAttribute('data-product-handle', product.handle);
  
  // Get product details with fallbacks for missing data
  const featuredImage = product.featured_image || (product.images && product.images.length > 0 ? product.images[0] : '');
  const formattedPrice = formatMoney(product.price);
  const compareAtPrice = product.compare_at_price ? formatMoney(product.compare_at_price) : null;
  const isOnSale = compareAtPrice && product.compare_at_price > product.price;
  const description = product.description || '';
  const truncatedDescription = description.length > 120 ? 
    description.substring(0, 120) + '...' : 
    description;
  
  // Get first available variant or default to first variant
  const variant = product.variants && product.variants.length > 0 ? 
    (product.variants.find(v => v.available) || product.variants[0]) : 
    null;
  
  if (!variant) {
    console.error('No variant found for product:', product.title);
    return null;
  }
  
  card.innerHTML = `
    <div class="flex flex-col sm:flex-row items-start gap-4 p-4">
      <a href="/products/${product.handle}" class="block w-full sm:w-1/4" aria-label="View ${product.title}">
        <div class="relative overflow-hidden rounded-lg">
          <img 
            src="${featuredImage}" 
            alt="${product.title}" 
            class="transition-transform duration-300 hover:scale-110 rounded-lg object-cover w-full aspect-w-1 aspect-h-1"
            loading="lazy"
          >
          ${isOnSale ? `
            <span class="absolute top-2 left-2 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/10">
              Sale
            </span>
          ` : ''}
        </div>
      </a>
      
      <div class="flex-1">
        <a href="/products/${product.handle}" class="block" aria-label="View ${product.title}">
          <h3 class="text-lg font-semibold text-deep-moss-black dark:text-mist-gray hover-underline">${product.title}</h3>
          <div class="flex items-center mt-1">
            <p class="text-gray-700 dark:text-gray-300">${formattedPrice}</p>
            ${isOnSale ? `<p class="ml-2 line-through text-gray-500 dark:text-gray-400">${compareAtPrice}</p>` : ''}
          </div>
          <p class="text-gray-700 dark:text-gray-300 mt-2">${truncatedDescription}</p>
        </a>
        
        <div class="flex space-x-2 mt-4">
          <button 
            class="btn-primary py-2 px-4 flex items-center justify-center"
            onclick="addToCart('${variant.id}', 1, this)"
            ${!variant.available ? 'disabled' : ''}
            ${!variant.available ? 'class="opacity-50 cursor-not-allowed"' : ''}
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            ${variant.available ? 'Add to Cart' : 'Sold Out'}
          </button>
          
          <button 
            class="btn-secondary py-2 px-4"
            onclick="toggleWishlist('${product.handle}')"
            data-product-handle="${product.handle}"
            data-wishlist-button
          >
            <svg class="w-5 h-5 text-olive-verde fill-current" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
  
  return card;
}

/**
 * Format money value
 * @param {number} cents - The price in cents
 * @returns {string} - Formatted price
 */
function formatMoney(cents) {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  
  const value = parseInt(cents || 0) / 100;
  
  // Use memoization for the formatter to improve performance
  if (!window.moneyFormatter) {
    window.moneyFormatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    });
  }
  
  return window.moneyFormatter.format(value);
}

/**
 * Add a product to the cart
 * @param {string} variantId - The variant ID to add
 * @param {number} quantity - The quantity to add
 * @param {HTMLElement} button - The button element that triggered the action
 */
function addToCart(variantId, quantity = 1, button = null) {
  if (!variantId) {
    showToast('Error: No product variant selected', 'error');
    return;
  }
  
  // Show loading state on button if provided
  const originalButtonHtml = button ? button.innerHTML : null;
  if (button) {
    button.innerHTML = '<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>';
    button.disabled = true;
  }
  
  const data = {
    id: variantId,
    quantity: quantity
  };
  
  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => {
    if (!response.ok) {
      return response.json().then(error => {
        throw new Error(error.description || 'Error adding to cart');
      });
    }
    return response.json();
  })
  .then(data => {
    // Reset button if provided
    if (button && originalButtonHtml) {
      button.innerHTML = originalButtonHtml;
      button.disabled = false;
    }
    
    showToast('Product added to cart', 'success');
    
    // Update cart count
    updateCartCount();
  })
  .catch(error => {
    console.error('Error adding to cart:', error);
    
    // Reset button if provided
    if (button && originalButtonHtml) {
      button.innerHTML = originalButtonHtml;
      button.disabled = false;
    }
    
    showToast(error.message || 'Error adding product to cart', 'error');
  });
}

/**
 * Update cart count
 */
function updateCartCount() {
  fetch('/cart.js')
    .then(response => response.json())
    .then(cart => {
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(element => {
        element.textContent = cart.item_count;
        element.classList.toggle('hidden', cart.item_count === 0);
      });
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
    });
}

/**
 * Clear the wishlist
 */
function clearWishlist() {
  if (confirm('Are you sure you want to clear your wishlist?')) {
    localStorage.setItem('wishlist', '[]');
    updateWishlistCounts();
    showToast('Wishlist cleared', 'info');
    
    // Reload wishlist page if we're on it
    if (wishlistContainer) {
      // Add fade-out animation to all product cards
      const productCards = wishlistContainer.querySelectorAll('.product-card');
      productCards.forEach(card => {
        card.classList.add('animate-fade-out');
      });
      
      // Wait for animation to complete before clearing
      setTimeout(() => {
        wishlistContainer.innerHTML = '';
        if (emptyWishlistMessage) {
          emptyWishlistMessage.classList.remove('hidden');
        }
      }, 300);
    }
  }
}

// Export functions for global use
window.toggleWishlist = toggleWishlist;
window.clearWishlist = clearWishlist;
window.loadWishlistProducts = loadWishlistProducts;
window.addToCart = addToCart;
window.updateWishlistCounts = updateWishlistCounts;
window.showToast = showToast;