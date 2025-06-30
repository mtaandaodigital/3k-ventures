// Notification Functionality

class Notification {
  constructor() {
    this.container = null;
    this.createContainer();
  }
  
  createContainer() {
    // Check if notification container exists
    this.container = document.getElementById('notification-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(this.container);
    }
  }
  
  show(message, type = 'success') {
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification p-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    
    // Add icon based on type
    let icon = '';
    if (type === 'success') {
      icon = `
        <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
      `;
    } else {
      icon = `
        <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      `;
    }
    
    notification.innerHTML = `
      <div class="flex items-center">
        ${icon}
        <span>${message}</span>
      </div>
    `;
    
    // Add to container
    this.container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      notification.addEventListener('transitionend', () => {
        notification.remove();
      });
    }, 3000);
  }
}

// Initialize Notification
document.addEventListener('DOMContentLoaded', function() {
  window.notificationInstance = new Notification();
  
  // Make showNotification function available globally
  window.showNotification = function(message, type = 'success') {
    if (window.notificationInstance) {
      window.notificationInstance.show(message, type);
    }
  };
});