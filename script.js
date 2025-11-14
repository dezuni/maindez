document.addEventListener('DOMContentLoaded', function() {
    
  // Set current year in footer
  setCurrentYear();
  
  // Initialize service filtering
  initServiceFiltering();
  
  // Initialize mobile menu toggle
  initMobileMenu();

      // check for version updates (this will reload if needed)
  checkVersion();

        console.log('صفحه با موفقیت بارگذاری شد');
    console.log('تعداد خدمات: ' + document.querySelectorAll('.service-item1').length);
    console.log('تعداد خدمات دارای تخفیف: ' + document.querySelectorAll('.service-item1[data-category*="DISCOUNT"]').length);
    
    // به طور پیش‌فرض خدمات دارای تخفیف را نمایش بده
    const discountButton = document.querySelector('.filter-btn[data-filter="DISCOUNT"]');
    if (discountButton) {
        discountButton.click();
    }
});

// Current app version - update with each deployment
const APP_VERSION = '25.04.16.1';

// check version updates
async function checkVersion() {
// Skip entirely if in private mode (where localStorage isn't persistent)
if (isPrivateMode()) {
  console.log('Private mode detected - skipping version check');
  return;
}

try {
  const storedVersion = localStorage.getItem('app_version');
  if (storedVersion !== APP_VERSION) {
    console.log(`Version update: ${storedVersion} → ${APP_VERSION}`);
    await clearCaches();
    await unregisterServiceWorkers();
    localStorage.setItem('app_version', APP_VERSION);
    reloadWithCacheBust();
  }
} catch (e) {
  console.warn('Version check failed:', e);
}
}

// Helper function to detect private mode
function isPrivateMode() {
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  return false;
} catch (e) {
  return true;
}
}

// Cache-clearing with modern browser support check
async function clearCaches() {
if ('caches' in window && typeof caches.keys === 'function') {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(c => caches.delete(c)));
  } catch (e) {
    console.warn('Cache clearing failed:', e);
  }
}
}

// Service worker unregistration with legacy browser support
async function unregisterServiceWorkers() {
if ('serviceWorker' in navigator) {
  try {
    // Modern browsers
    if (navigator.serviceWorker.getRegistrations) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(r => r.unregister()));
    } 
    // Legacy fallback
    else if (navigator.serviceWorker.controller) {
      await navigator.serviceWorker.controller.postMessage('unregister');
    }
  } catch (e) {
    console.warn('ServiceWorker cleanup failed:', e);
  }
}
}

// Cache-busting reload with hash preservation and double-reload protection
function reloadWithCacheBust() {
const url = new URL(window.location.href);

// Only add forceReload if not already present
if (!url.searchParams.has('forceReload')) {
  url.searchParams.set('forceReload', Date.now());
}

// Preserve hash if exists
const targetUrl = url.toString() + (window.location.hash || '');

// Delay ensures all async operations complete
setTimeout(() => window.location.assign(targetUrl), 100);
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
  document.getElementById("successMessage").style.display = "none";
  document.getElementById("captchaError").style.display = "none";
    
  
  document.getElementById('fullName_discount').value = '';
  document.getElementById('phoneNumber_discount').value = '';  
  document.getElementById('DiscountVerifCode').value = '';
  document.getElementById('captchaAnswer_discount').value = '';  
  document.getElementById('captchaAnswer_discount').value = '';
  document.getElementById('DiscountSuccessMessage').value = '';
  document.getElementById('DiscountRequestStatus').value = '';
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
