// Product Zoom Functionality

class ProductZoom {
  constructor() {
    this.zoomButton = document.getElementById('zoom-button');
    this.zoomOverlay = document.getElementById('zoom-overlay');
    this.zoomImage = document.getElementById('zoom-image');
    this.zoomClose = document.getElementById('zoom-close');
    
    this.init();
  }
  
  init() {
    if (!this.zoomButton || !this.zoomOverlay || !this.zoomImage || !this.zoomClose) return;
    
    this.zoomButton.addEventListener('click', () => {
      this.openZoom();
    });
    
    this.zoomClose.addEventListener('click', () => {
      this.closeZoom();
    });
    
    this.zoomOverlay.addEventListener('click', (e) => {
      if (e.target === this.zoomOverlay) {
        this.closeZoom();
      }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.zoomOverlay.classList.contains('hidden')) {
        this.closeZoom();
      }
    });
    
    // Add pinch zoom functionality
    this.setupPinchZoom();
  }
  
  openZoom() {
    const visibleImage = document.querySelector('.main-image-item:not(.hidden) img');
    if (visibleImage) {
      // Get the highest resolution image URL
      let imageUrl = visibleImage.src;
      if (visibleImage.dataset.highres) {
        imageUrl = visibleImage.dataset.highres;
      } else {
        // Try to get a higher resolution image by modifying the URL
        imageUrl = imageUrl.replace(/(\d+)x(\d+)/, '1200x1200');
      }
      
      this.zoomImage.src = imageUrl;
      this.zoomImage.alt = visibleImage.alt;
      this.zoomOverlay.classList.remove('hidden');
      this.zoomOverlay.classList.add('flex');
      document.body.classList.add('overflow-hidden');
      
      // Reset zoom level
      this.zoomImage.style.transform = 'scale(1)';
      this.zoomImage.style.transformOrigin = 'center center';
    }
  }
  
  closeZoom() {
    this.zoomOverlay.classList.add('hidden');
    this.zoomOverlay.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }
  
  setupPinchZoom() {
    if (!this.zoomImage) return;
    
    let scale = 1;
    let panning = false;
    let pointX = 0;
    let pointY = 0;
    let startX = 0;
    let startY = 0;
    
    // Mouse events for desktop
    this.zoomImage.addEventListener('mousedown', (e) => {
      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;
      pointX = parseFloat(this.zoomImage.style.transformOrigin.split(' ')[0]) || 0;
      pointY = parseFloat(this.zoomImage.style.transformOrigin.split(' ')[1]) || 0;
      panning = true;
    });
    
    this.zoomOverlay.addEventListener('mousemove', (e) => {
      e.preventDefault();
      if (!panning) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      // Update transform origin
      const newX = pointX + deltaX;
      const newY = pointY + deltaY;
      this.zoomImage.style.transformOrigin = `${newX}px ${newY}px`;
    });
    
    this.zoomOverlay.addEventListener('mouseup', () => {
      panning = false;
    });
    
    this.zoomOverlay.addEventListener('mouseleave', () => {
      panning = false;
    });
    
    // Zoom with mouse wheel
    this.zoomOverlay.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const xs = (e.clientX - this.zoomImage.offsetLeft) / scale;
      const ys = (e.clientY - this.zoomImage.offsetTop) / scale;
      
      // Adjust scale based on wheel direction
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newScale = Math.min(Math.max(1, scale + delta), 3); // Limit scale between 1 and 3
      
      if (newScale !== scale) {
        scale = newScale;
        
        // Set transform origin to mouse position
        this.zoomImage.style.transformOrigin = `${xs}px ${ys}px`;
        this.zoomImage.style.transform = `scale(${scale})`;
      }
    });
    
    // Double click to reset zoom
    this.zoomOverlay.addEventListener('dblclick', () => {
      scale = 1;
      this.zoomImage.style.transform = 'scale(1)';
      this.zoomImage.style.transformOrigin = 'center center';
    });
    
    // Touch events for mobile
    let evCache = [];
    let prevDiff = -1;
    
    this.zoomImage.addEventListener('touchstart', (e) => {
      for (let i = 0; i < e.touches.length; i++) {
        evCache.push(e.touches[i]);
      }
    });
    
    this.zoomImage.addEventListener('touchmove', (e) => {
      e.preventDefault();
      
      // If two pointers are down, check for pinch gestures
      if (evCache.length === 2) {
        // Calculate the distance between the two pointers
        const curDiff = Math.hypot(
          evCache[0].clientX - evCache[1].clientX,
          evCache[0].clientY - evCache[1].clientY
        );
        
        if (prevDiff > 0) {
          // The distance between the two pointers has increased
          if (curDiff > prevDiff) {
            // Zoom in
            scale = Math.min(scale + 0.1, 3);
          }
          // The distance between the two pointers has decreased
          if (curDiff < prevDiff) {
            // Zoom out
            scale = Math.max(scale - 0.1, 1);
          }
          
          this.zoomImage.style.transform = `scale(${scale})`;
        }
        
        // Cache the distance for the next move event
        prevDiff = curDiff;
      }
      
      // Update evCache
      for (let i = 0; i < e.touches.length; i++) {
        for (let j = 0; j < evCache.length; j++) {
          if (evCache[j].identifier === e.touches[i].identifier) {
            evCache[j] = e.touches[i];
            break;
          }
        }
      }
    });
    
    function removeEvent(e) {
      // Remove this event from the target's cache
      for (let i = 0; i < evCache.length; i++) {
        if (evCache[i].identifier === e.changedTouches[i].identifier) {
          evCache.splice(i, 1);
          break;
        }
      }
      
      // If the number of pointers is less than two, reset diff tracker
      if (evCache.length < 2) {
        prevDiff = -1;
      }
    }
    
    this.zoomImage.addEventListener('touchend', removeEvent);
    this.zoomImage.addEventListener('touchcancel', removeEvent);
  }
}

// Initialize Product Zoom
document.addEventListener('DOMContentLoaded', function() {
  new ProductZoom();
});