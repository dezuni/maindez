document.addEventListener('DOMContentLoaded', function() {
    // First check for version updates (this will reload if needed)
    checkVersion();
    
    // Set current year in footer
    setCurrentYear();
    
    // Initialize service filtering
    initServiceFiltering();
    
    // Initialize mobile menu toggle
    initMobileMenu();
});

// Current app version - update with each deployment
const APP_VERSION = '25.04.13.0';

// Check for version update
async function checkVersion() {
  const storedVersion = localStorage.getItem('app_version');
  
  if (storedVersion !== APP_VERSION) {
    console.log(`Updating from ${storedVersion} to ${APP_VERSION}`);
    
    // 1. Clear all caches
    if ('caches' in window) {
      await caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      });
    }
    
    // 2. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }
    
    // 3. Update version in storage
    localStorage.setItem('app_version', APP_VERSION);
    
    // 4. Force reload (with cache bypass)
    window.location.href = window.location.href + '?forceReload=' + Date.now();
  }
}
    

function setCurrentYear() {
    document.getElementById('current-year').textContent = new Date().getFullYear();
}

function initServiceFiltering() {
    const menuLinks = document.querySelectorAll('.services-nav a');
    const allServices = document.querySelectorAll('.service-item');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            filterServices(this, allServices);
        });
    });
}

function initMobileMenu() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.services-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    
    toggleBtn.addEventListener('click', function() {
        menu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    overlay.addEventListener('click', function() {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
}

function resetAllServices() {
    // Reset academic service (جزوه یاب)
    const responseDiv = document.getElementById('response');
    const spinner = responseDiv.querySelector('.spinner');
    if (spinner) {
        responseDiv.removeChild(spinner);
    }
    document.getElementById('authorInput').value = '';
    responseDiv.textContent = '';
    document.getElementById('authorButtons').innerHTML = '';
    document.getElementById('articleList').innerHTML = '';
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('articleResults').style.display = 'none';
    document.getElementById('officeName').value = '';
    document.getElementById('officeSearchResult').innerHTML = '';
    resetForm(); // request form

    document.getElementById('articleListِDisclaimer').textContent='';
    //document.getElementById('articleListِDisclaimer').style.color = 'red'; 
    
    // Add reset for other services here if needed
    // For example:
    // document.getElementById('financial-input').value = '';
    // document.getElementById('welfare-input').value = '';
}

function filterServices(clickedLink, allServices) {
    // Update active menu item
    document.querySelectorAll('.services-nav a').forEach(item => {
        item.classList.remove('active');
    });
    clickedLink.classList.add('active');
    
    const category = clickedLink.dataset.category;
    
    // Reset all services when switching
    resetAllServices();
    
    // Filter services
    if (category === 'all') {
        allServices.forEach(service => {
            service.classList.remove('hidden');
        });
    } else {
        allServices.forEach(service => {
            if (service.dataset.category === category) {
                service.classList.remove('hidden');
            } else {
                service.classList.add('hidden');
            }
        });
    }
    
    // Close mobile menu if open
    const menu = document.querySelector('.services-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
}
