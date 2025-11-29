document.addEventListener('DOMContentLoaded', function () {
    // === منوی موبایل (همبرگری) ===
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const menu = document.querySelector('.services-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (mobileToggle && menu && overlay) {
        mobileToggle.addEventListener('click', function () {
            menu.classList.toggle('active');
            overlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        overlay.addEventListener('click', function () {
            menu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // === تنظیم سال در فوتر ===
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
});
