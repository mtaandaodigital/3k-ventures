// Compare Functionality

class Compare {
  constructor() {
    this.items = [];
    this.maxItems = 3;
    this.modal = document.getElementById('compare-modal');
    this.overlay = document.getElementById('compare-overlay');
    this.closeBtn = document.getElementById('compare-close');
    this.emptyState = document.getElementById('empty-compare');
    this.compareTable = document.getElementById('compare-table');
    this.clearBtn = document.getElementById('clear-compare');
    
    this.init();
  }
  
  init() {
    // Load saved compare list from localStorage
    this.loadFromLocalStorage();
    
    // Update compare count
    this.updateCount();
    
    // Initialize modal events
    if (this.modal) {
      if (this.overlay) {
        this.overlay.addEventListener('click', this.closeModal.bind(this));
      }
      
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', this.closeModal.bind(this));
      }
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
          this.closeModal();
        }
      });
      
      // Clear compare button
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', () => {
          this.clear();
          this.updateModal();
        });
      }
      
      // Remove individual product from compare
      const compareRemoveBtns = document.querySelectorAll('.compare-remove');
      compareRemoveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.getAttribute('data-index'));
          if (this.items[index]) {
            this.items.splice(index, 1);
            this.saveToLocalStorage();
            this.updateCount();
            this.updateModal();
          }
        });
      });
    }
    
    // Initialize compare toggle buttons
    const compareButtons = document.querySelectorAll('[onclick^="addToCompare"]');
    
    compareButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const productHandle = button.getAttribute('onclick').match(/'([^']+)'/)[1];
        this.add(productHandle);
      });
    });
    
    // Initialize compare icon in header
    const compareIcon = document.querySelector('.compare-icon');
    
    if (compareIcon) {
      compareIcon.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal();
      });
    }
  }
  
  loadFromLocalStorage() {
    if (localStorage.getItem('compareList')) {
      try {
        this.items = JSON.parse(localStorage.getItem('compareList'));
      } catch (e) {
        console.error('Error loading compare list from localStorage', e);
        this.items = [];
      }
    }
  }
  
  saveToLocalStorage() {
    localStorage.setItem('compareList', JSON.stringify(this.items));
  }
  
  add(productHandle) {
    if (this.items.includes(productHandle)) {
      this.showNotification('Product already in compare list');
      return;
    }
    
    if (this.items.length >= this.maxItems) {
      this.showNotification(`Compare list is full (max ${this.maxItems} products)`);
      return;
    }
    
    this.items.push(productHandle);
    this.showNotification('Product added to compare list');
    
    // Save to localStorage
    this.saveToLocalStorage();
    
    // Update compare count
    this.updateCount();
    
    // Update compare modal if open
    if (this.modal && !this.modal.classList.contains('hidden')) {
      this.updateModal();
    }
  }
  
  remove(index) {
    if (this.items[index]) {
      this.items.splice(index, 1);
      this.saveToLocalStorage();
      this.updateCount();
      
      // Update compare modal if open
      if (this.modal && !this.modal.classList.contains('hidden')) {
        this.updateModal();
      }
    }
  }
  
  updateCount() {
    const compareCount = document.querySelector('.compare-count');
    
    if (compareCount) {
      compareCount.textContent = this.items.length;
      
      if (this.items.length > 0) {
        compareCount.classList.remove('hidden');
      } else {
        compareCount.classList.add('hidden');
      }
    }
  }
  
  openModal() {
    if (this.modal) {
      this.modal.classList.remove('hidden');
      this.updateModal();
    }
  }
  
  closeModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');
    }
  }
  
  updateModal() {
    if (!this.emptyState || !this.compareTable) return;
    
    if (this.items.length === 0) {
      this.emptyState.classList.remove('hidden');
      this.compareTable.classList.add('hidden');
    } else {
      this.emptyState.classList.add('hidden');
      this.compareTable.classList.remove('hidden');
      
      // Reset placeholders
      for (let i = 1; i <= this.maxItems; i++) {
        const placeholder = document.querySelector(`.compare-product-placeholder:nth-child(${i})`);
        if (placeholder) {
          placeholder.textContent = `Product ${i}`;
        }
        
        const imageContainer = document.querySelector(`.compare-image-${i}`);
        if (imageContainer) {
          imageContainer.innerHTML = `
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          `;
        }
        
        const title = document.querySelector(`.compare-title-${i}`);
        if (title) {
          title.textContent = '-';
        }
        
        const price = document.querySelector(`.compare-price-${i}`);
        if (price) {
          price.textContent = '-';
        }
        
        const availability = document.querySelector(`.compare-availability-${i}`);
        if (availability) {
          availability.textContent = '-';
        }
        
        const description = document.querySelector(`.compare-description-${i}`);
        if (description) {
          description.textContent = '-';
        }
        
        const addToCartBtn = document.querySelector(`.compare-add-to-cart-${i}`);
        if (addToCartBtn) {
          addToCartBtn.style.display = 'none';
        }
      }
      
      // Add products
      this.items.forEach((productHandle, index) => {
        if (index < this.maxItems) {
          this.fetchProductData(productHandle, index);
        }
      });
    }
  }
  
  fetchProductData(productHandle, index) {
    fetch(`/products/${productHandle}.js`)
      .then(response => response.json())
      .then(product => {
        const placeholder = document.querySelector(`.compare-product-placeholder:nth-child(${index + 1})`);
        if (placeholder) {
          placeholder.textContent = product.title;
        }
        
        const imageContainer = document.querySelector(`.compare-image-${index + 1}`);
        if (imageContainer) {
          const img = document.createElement('img');
          img.src = product.featured_image;
          img.alt = product.title;
          img.className = 'w-full h-full object-contain';
          imageContainer.innerHTML = '';
          imageContainer.appendChild(img);
        }
        
        const title = document.querySelector(`.compare-title-${index + 1}`);
        if (title) {
          title.textContent = product.title;
        }
        
        const price = document.querySelector(`.compare-price-${index + 1}`);
        if (price) {
          price.textContent = this.formatMoney(product.price);
        }
        
        const availability = document.querySelector(`.compare-availability-${index + 1}`);
        if (availability) {
          availability.innerHTML = product.available ? 
            '<span class="text-green-500">In Stock</span>' : 
            '<span class="text-red-500">Out of Stock</span>';
        }
        
        const description = document.querySelector(`.compare-description-${index + 1}`);
        if (description) {
          description.textContent = product.description.substring(0, 100) + '...';
        }
        
        const addToCartBtn = document.querySelector(`.compare-add-to-cart-${index + 1}`);
        if (addToCartBtn) {
          addToCartBtn.style.display = 'inline-flex';
          addToCartBtn.onclick = () => {
            if (window.addToCart) {
              window.addToCart(product.variants[0].id, 1);
              this.closeModal();
            }
          };
        }
      })
      .catch(error => {
        console.error('Error fetching product data:', error);
      });
  }
  
  clear() {
    this.items = [];
    this.saveToLocalStorage();
    this.updateCount();
  }
  
  showNotification(message) {
    if (window.showNotification) {
      window.showNotification(message);
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

// Initialize Compare
document.addEventListener('DOMContentLoaded', function() {
  window.compareInstance = new Compare();
  
  // Make addToCompare function available globally
  window.addToCompare = function(productHandle) {
    if (window.compareInstance) {
      window.compareInstance.add(productHandle);
    }
  };
});