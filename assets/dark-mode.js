// Dark Mode Functionality

class DarkMode {
  constructor() {
    this.darkModeToggle = document.getElementById('dark-mode-toggle');
    this.darkModeIcon = document.getElementById('dark-mode-icon');
    this.lightModeIcon = document.getElementById('light-mode-icon');
    
    this.init();
  }
  
  init() {
    // Check for saved theme preference or respect OS preference
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!localStorage.getItem('color-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      this.updateIcons(true);
    } else {
      document.documentElement.classList.remove('dark');
      this.updateIcons(false);
    }
    
    // Dark mode toggle
    if (this.darkModeToggle) {
      this.darkModeToggle.addEventListener('click', () => {
        // Toggle dark class on html element
        document.documentElement.classList.toggle('dark');
        
        // Update localStorage
        if (document.documentElement.classList.contains('dark')) {
          localStorage.setItem('color-theme', 'dark');
          this.updateIcons(true);
        } else {
          localStorage.setItem('color-theme', 'light');
          this.updateIcons(false);
        }
      });
    }
    
    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      if (!localStorage.getItem('color-theme')) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
          this.updateIcons(true);
        } else {
          document.documentElement.classList.remove('dark');
          this.updateIcons(false);
        }
      }
    });
  }
  
  updateIcons(isDark) {
    if (this.darkModeIcon && this.lightModeIcon) {
      if (isDark) {
        this.darkModeIcon.classList.add('hidden');
        this.lightModeIcon.classList.remove('hidden');
      } else {
        this.darkModeIcon.classList.remove('hidden');
        this.lightModeIcon.classList.add('hidden');
      }
    }
  }
}

// Initialize Dark Mode
document.addEventListener('DOMContentLoaded', function() {
  new DarkMode();
});