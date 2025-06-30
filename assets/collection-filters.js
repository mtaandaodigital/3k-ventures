// Collection Filters and Sorting

class CollectionFilters {
  constructor() {
    this.mobileFilterToggle = document.getElementById('mobile-filter-toggle');
    this.mobileFilterDrawer = document.getElementById('mobile-filter-drawer');
    this.mobileFilterOverlay = document.getElementById('mobile-filter-overlay');
    this.mobileFilterClose = document.getElementById('mobile-filter-close');
    this.mobileFilterApply = document.getElementById('mobile-filter-apply');
    this.mobileFilterClear = document.getElementById('mobile-filter-clear');
    
    this.filterToggles = document.querySelectorAll('.filter-toggle');
    this.filterDropdowns = document.querySelectorAll('.filter-dropdown');
    
    this.applyFilterBtns = document.querySelectorAll('.apply-filter');
    this.clearFilterBtns = document.querySelectorAll('.clear-filter');
    
    this.applyPriceRangeBtns = document.querySelectorAll('.apply-price-range');
    
    this.sortBySelect = document.getElementById('sort-by');
    
    this.gridViewBtn = document.getElementById('grid-view');
    this.listViewBtn = document.getElementById('list-view');
    this.productsContainer = document.querySelector('.products-container');
    
    this.init();
  }
  
  init() {
    this.initMobileFilter();
    this.initDesktopFilters();
    this.initFilterActions();
    this.initSorting();
    this.initViewToggle();
  }
  
  initMobileFilter() {
    if (this.mobileFilterToggle && this.mobileFilterDrawer) {
      this.mobileFilterToggle.addEventListener('click', () => {
        this.mobileFilterDrawer.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
      });
      
      if (this.mobileFilterOverlay) {
        this.mobileFilterOverlay.addEventListener('click', () => {
          this.mobileFilterDrawer.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        });
      }
      
      if (this.mobileFilterClose) {
        this.mobileFilterClose.addEventListener('click', () => {
          this.mobileFilterDrawer.classList.add('hidden');
          document.body.classList.remove('overflow-hidden');
        });
      }
    }
  }
  
  initDesktopFilters() {
    this.filterToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const dropdown = toggle.nextElementSibling;
        
        // Close all other dropdowns
        this.filterDropdowns.forEach(otherDropdown => {
          if (otherDropdown !== dropdown) {
            otherDropdown.classList.add('hidden');
          }
        });
        
        // Toggle current dropdown
        dropdown.classList.toggle('hidden');
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filter-group')) {
        this.filterDropdowns.forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    });
  }
  
  initFilterActions() {
    // Apply filters
    this.applyFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterGroup = btn.closest('.filter-group');
        const filterName = filterGroup.getAttribute('data-filter');
        const checkboxes = filterGroup.querySelectorAll('input[type="checkbox"]:checked');
        
        if (checkboxes.length > 0) {
          const url = new URL(window.location.href);
          
          // Remove existing filter params
          const params = url.searchParams;
          params.delete(filterName);
          
          // Add new filter params
          checkboxes.forEach(checkbox => {
            params.append(filterName, checkbox.value);
          });
          
          window.location.href = url.toString();
        } else {
          // If no checkboxes are checked, remove the filter
          const url = new URL(window.location.href);
          url.searchParams.delete(filterName);
          window.location.href = url.toString();
        }
      });
    });
    
    // Clear filters
    this.clearFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterGroup = btn.closest('.filter-group');
        const filterName = filterGroup.getAttribute('data-filter');
        
        // Uncheck all checkboxes
        filterGroup.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
        });
        
        // Remove filter from URL
        const url = new URL(window.location.href);
        url.searchParams.delete(filterName);
        window.location.href = url.toString();
      });
    });
    
    // Apply price range
    this.applyPriceRangeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filterGroup = btn.closest('.filter-group, .mb-6');
        const minInput = filterGroup.querySelector('input[name="price_min"]');
        const maxInput = filterGroup.querySelector('input[name="price_max"]');
        
        if (minInput && maxInput) {
          const min = minInput.value;
          const max = maxInput.value;
          
          if (min || max) {
            const url = new URL(window.location.href);
            
            if (min) {
              url.searchParams.set('filter.v.price.gte', min);
            } else {
              url.searchParams.delete('filter.v.price.gte');
            }
            
            if (max) {
              url.searchParams.set('filter.v.price.lte', max);
            } else {
              url.searchParams.delete('filter.v.price.lte');
            }
            
            window.location.href = url.toString();
          }
        }
      });
    });
    
    // Mobile apply all filters
    if (this.mobileFilterApply) {
      this.mobileFilterApply.addEventListener('click', () => {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        
        // Clear existing filter params
        Array.from(params.keys()).forEach(key => {
          if (key.startsWith('filter.')) {
            params.delete(key);
          }
        });
        
        // Get all checked checkboxes
        const checkboxes = document.querySelectorAll('#mobile-filter-drawer input[type="checkbox"]:checked');
        
        // Group checkboxes by filter name
        const filterGroups = {};
        checkboxes.forEach(checkbox => {
          const name = checkbox.name;
          if (!filterGroups[name]) {
            filterGroups[name] = [];
          }
          filterGroups[name].push(checkbox.value);
        });
        
        // Add filter params
        Object.keys(filterGroups).forEach(name => {
          filterGroups[name].forEach(value => {
            params.append(`filter.${name}`, value);
          });
        });
        
        // Add price range if set
        const minPrice = document.querySelector('#mobile-filter-drawer input[name="price_min"]').value;
        const maxPrice = document.querySelector('#mobile-filter-drawer input[name="price_max"]').value;
        
        if (minPrice) {
          params.set('filter.v.price.gte', minPrice);
        }
        
        if (maxPrice) {
          params.set('filter.v.price.lte', maxPrice);
        }
        
        window.location.href = url.toString();
      });
    }
    
    // Mobile clear all filters
    if (this.mobileFilterClear) {
      this.mobileFilterClear.addEventListener('click', () => {
        window.location.href = window.location.pathname;
      });
    }
  }
  
  initSorting() {
    if (this.sortBySelect) {
      this.sortBySelect.addEventListener('change', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', this.sortBySelect.value);
        window.location.href = url.toString();
      });
      
      // Set current sort value
      const urlParams = new URLSearchParams(window.location.search);
      const currentSort = urlParams.get('sort_by');
      if (currentSort) {
        this.sortBySelect.value = currentSort;
      }
    }
  }
  
  initViewToggle() {
    if (this.gridViewBtn && this.listViewBtn && this.productsContainer) {
      this.gridViewBtn.addEventListener('click', () => {
        this.productsContainer.classList.remove('list-view');
        this.productsContainer.classList.add('grid-view');
        this.gridViewBtn.classList.add('text-primary', 'bg-gray-100', 'dark:bg-gray-800');
        this.gridViewBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        this.listViewBtn.classList.remove('text-primary', 'bg-gray-100', 'dark:bg-gray-800');
        this.listViewBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        
        // Save preference to localStorage
        localStorage.setItem('collection-view', 'grid');
      });
      
      this.listViewBtn.addEventListener('click', () => {
        this.productsContainer.classList.remove('grid-view');
        this.productsContainer.classList.add('list-view');
        this.listViewBtn.classList.add('text-primary', 'bg-gray-100', 'dark:bg-gray-800');
        this.listViewBtn.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        this.gridViewBtn.classList.remove('text-primary', 'bg-gray-100', 'dark:bg-gray-800');
        this.gridViewBtn.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-800');
        
        // Save preference to localStorage
        localStorage.setItem('collection-view', 'list');
      });
      
      // Load saved preference
      const savedView = localStorage.getItem('collection-view');
      if (savedView === 'list') {
        this.listViewBtn.click();
      }
    }
  }
}

// Initialize Collection Filters
document.addEventListener('DOMContentLoaded', function() {
  new CollectionFilters();
});