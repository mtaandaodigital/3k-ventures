// Add your JavaScript code here

const MAX_WISHLIST_ITEMS = 10; // Maximum number of wishlist items
const COOKIE_EXPIRY_DAYS = 30; // Cookie expiry time in days

// Simulate logged-in state
const isLoggedIn = {{ customer | json }} != null; // Replace with actual check

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

function openQuickView(productHandle) {
  // Implement logic to open a quick view modal or redirect to the product page
  window.location.href = '/products/' + productHandle; // Basic implementation: redirect to product page
}

function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    let date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  let nameEQ = name + "=";
  let ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// This function is now defined in wishlist.js
// Keeping this as a wrapper to avoid breaking any existing code
function toggleWishlist(productHandle) {
  // Check if the wishlist.js implementation is available
  if (typeof window.toggleWishlist === 'function') {
    // Use the implementation from wishlist.js
    return window.toggleWishlist(productHandle);
  }
  
  // Fallback implementation if wishlist.js is not loaded
  let wishlist = [];

  if (isLoggedIn) {
    console.log('Toggling wishlist for logged-in user (metafield update required):', productHandle);
  } else {
    wishlist = JSON.parse(getCookie('wishlist') || '[]'); // Use cookies for guests

    const index = wishlist.indexOf(productHandle);

    if (index > -1) {
      wishlist.splice(index, 1);
    } else {
      if (wishlist.length < MAX_WISHLIST_ITEMS) {
        wishlist.push(productHandle);
      } else {
        alert('Your wishlist is full. Please remove an item before adding another.');
        return;
      }
    }

    setCookie('wishlist', JSON.stringify(wishlist), COOKIE_EXPIRY_DAYS);
  }

  console.log('Wishlist:', wishlist);
}

document.addEventListener("DOMContentLoaded", function() {
  var lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

  if ("IntersectionObserver" in window) {
    let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          let lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove("lazy");
          lazyImageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      lazyImageObserver.observe(lazyImage);
    });
  } else {
    // Possibly fall back to event handlers here
  }

  // Image Zoom Functionality
  const zoomableImages = document.querySelectorAll('.zoomable-image');

  zoomableImages.forEach(img => {
    img.addEventListener('mousemove', (e) => {
      // Fixed the condition - removed the negation that was causing the zoom to work only for logged out users
      if (true) { // Always enable zoom regardless of login status
        const x = e.offsetX;
        const y = e.offsetY;
        img.style.transformOrigin = `${x}px ${y}px`;
        img.style.transform = 'scale(2)';
      }
    });

    img.addEventListener('mouseleave', () => {
      img.style.transformOrigin = `center center`;
      img.style.transform = 'scale(1)';
    });
  });
});
