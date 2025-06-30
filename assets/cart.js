// Cart Functionality

class Cart {
  constructor() {
    this.items = [];
    this.drawer = document.getElementById('cart-drawer');
    this.overlay = document.getElementById('cart-drawer-overlay');
    this.closeBtn = document.getElementById('cart-drawer-close');
    this.itemsContainer = document.getElementById('cart-items');
    this.emptyState = document.getElementById('empty-cart');
    this.subtotal = document.getElementById('cart-subtotal');
    this.checkoutBtn = document.getElementById('cart-checkout');
    this.clearBtn = document.getElementById('cart-clear');
    
    this.init();
  }
  
  init() {
    // Fetch cart data
    this.fetchCart();
    
    // Initialize drawer events
    if (this.drawer) {
      if (this.overlay) {
        this.overlay.addEventListener('click', this.closeDrawer.bind(this));
      }
      
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.closeDrawer.bind(this));
      }
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.drawer.classList.contains('hidden')) {
          this.closeDrawer();
        }
      });
      
      // Clear cart button
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          this.clear();
        });
      }
    }
    
    // Initialize cart icon in header
    const cartIcon = document.querySelector('.cart-icon');
    
    if (cartIcon) {
      cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    }
    
    // Initialize add to cart forms
    const addToCartForms = document.querySelectorAll('form[action="/cart/add"]');
    
    addToCartForms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const variantId = form.querySelector('input[name="id"]').value;
        const quantity = form.querySelector('input[name="quantity"]') ? 
                        form.querySelector('input[name="quantity"]').value : 1;
        
        this.addItem(variantId, quantity);
      });
    });
  }
  
  fetchCart() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        this.items = cart.items;
        this.updateCount(cart.item_count);
        
        // Update drawer if open
        if (this.drawer && !this.drawer.classList.contains('hidden')) {
          this.updateDrawer(cart);
        }
      })
      .catch(error => {
        console.error('Error fetching cart:', error);
      });
  }
  
  addItem(variantId, quantity) {
    // Add to cart using Shopify AJAX API
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    })
    .then(response => response.json())
    .then(data => {
      this.showNotification('Product added to cart');
      this.fetchCart();
      this.openDrawer();
    })
    .catch(error => {
      console.error('Error adding to cart:', error);
      this.showNotification('Error adding to cart', 'error');
    });
  }
  
  updateItem(lineItem, quantity) {
    // Update cart item using Shopify AJAX API
    fetch('/cart/change.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        line: lineItem,
        quantity: quantity
      })
    })
    .then(response => response.json())
    .then(cart => {
      this.items = cart.items;
      this.updateCount(cart.item_count);
      this.updateDrawer(cart);
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      this.showNotification('Error updating cart', 'error');
    });
  }
  
  removeItem(lineItem) {
    this.updateItem(lineItem, 0);
  }
  
  clear() {
    // Clear cart using Shopify AJAX API
    fetch('/cart/clear.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(cart => {
      this.items = [];
      this.updateCount(0);
      this.updateDrawer(cart);
      this.showNotification('Cart cleared');
    })
    .catch(error => {
      console.error('Error clearing cart:', error);
      this.showNotification('Error clearing cart', 'error');
    });
  }
  
  updateCount(count) {
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
      cartCount.textContent = count;
      
      if (count > 0) {
        cartCount.classList.remove('hidden');
      } else {
        cartCount.classList.add('hidden');
      }
    }
  }
  
  openDrawer() {
    if (this.drawer) {
      this.drawer.classList.remove('hidden');
      this.fetchCart();
    }
  }
  
  closeDrawer() {
    if (this.drawer) {
      this.drawer.classList.add('hidden');
    }
  }
  
  updateDrawer(cart) {
    if (!this.itemsContainer || !this.emptyState || !this.subtotal) return;
    
    if (cart.item_count === 0) {
      this.emptyState.classList.remove('hidden');
      this.itemsContainer.classList.add('hidden');
      this.subtotal.textContent = this.formatMoney(0);
      
      if (this.checkoutBtn) {
        this.checkoutBtn.disabled = true;
        this.checkoutBtn.classList.add('opacity-50', 'cursor-not-allowed');
      }
    } else {
      this.emptyState.classList.add('hidden');
      this.itemsContainer.classList.remove('hidden');
      this.subtotal.textContent = this.formatMoney(cart.total_price);
      
      if (this.checkoutBtn) {
        this.checkoutBtn.disabled = false;
        this.checkoutBtn.classList.remove('opacity-50', 'cursor-not-allowed');
      }
      
      // Clear existing items
      this.itemsContainer.innerHTML = '';
      
      // Add items
      cart.items.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item flex items-center py-4 border-b border-gray-200 dark:border-gray-700';
        
        itemElement.innerHTML = `
          <div class="w-20 h-20 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
            <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
          </div>
          
          <div class="ml-4 flex-grow">
            <h3 class="text-sm font-medium text-gray-900 dark:text-white">${item.title}</h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">${item.variant_title || ''}</p>
            <div class="flex items-center mt-2">
              <button class="cart-item-decrease text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" data-line="${index + 1}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                </svg>
              </button>
              <span class="mx-2 text-gray-700 dark:text-gray-300">${item.quantity}</span>
              <button class="cart-item-increase text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" data-line="${index + 1}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-900 dark:text-white">${this.formatMoney(item.line_price)}</p>
            <button class="cart-item-remove mt-1 text-xs text-red-500 hover:text-red-700 transition-colors duration-200" data-line="${index + 1}">
              Remove
            </button>
          </div>
        `;
        
        this.itemsContainer.appendChild(itemElement);
        
        // Add event listeners
        const decreaseBtn = itemElement.querySelector('.cart-item-decrease');
        const increaseBtn = itemElement.querySelector('.cart-item-increase');
        const removeBtn = itemElement.querySelector('.cart-item-remove');
        
        if (decreaseBtn) {
          decreaseBtn.addEventListener('click', () => {
            const line = parseInt(decreaseBtn.getAttribute('data-line'));
            const newQuantity = item.quantity - 1;
            if (newQuantity > 0) {
              this.updateItem(line, newQuantity);
            } else {
              this.removeItem(line);
            }
          });
        }
        
        if (increaseBtn) {
          increaseBtn.addEventListener('click', () => {
            const line = parseInt(increaseBtn.getAttribute('data-line'));
            this.updateItem(line, item.quantity + 1);
          });
        }
        
        if (removeBtn) {
          removeBtn.addEventListener('click', () => {
            const line = parseInt(removeBtn.getAttribute('data-line'));
            this.removeItem(line);
          });
        }
      });
    }
  }
  
  showNotification(message, type = 'success') {
    if (window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback notification
      alert(message);
    }
  }
  
  formatMoney(cents) {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    
    return formatter.format(cents / 100);
  }
}

// Initialize Cart
document.addEventListener('DOMContentLoaded', function() {
  window.cartInstance = new Cart();
  
  // Make addToCart function available globally
  window.addToCart = function(variantId, quantity) {
    if (window.cartInstance) {
      window.cartInstance.addItem(variantId, quantity);
    }
  };
});