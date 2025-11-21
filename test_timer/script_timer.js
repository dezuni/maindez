// تایمر برای کارت‌های تخفیف
document.addEventListener('DOMContentLoaded', function() {
    // ⚙️ تغییر این مقدار برای هر صفحه: 'fastfood', 'clothing', 'medical', 'gym', ...
    const CURRENT_CATEGORY = 'fastfood';

    // تابع برای تبدیل اعداد انگلیسی به فارسی
    function toPersianNumber(number) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return number.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
    }

    // تابع برای ایجاد تایمر
    function createTimer(expiryDate, expiryTime, cardId) {
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        timerContainer.id = `timer-${cardId}`;

        // ایجاد تاریخ انقضا به درستی
        const [year, month, day] = expiryDate.split('-').map(Number);
        const [hours, minutes] = expiryTime.split(':').map(Number);
        
        const expiryDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        const now = new Date();

        if (expiryDateTime <= now) {
            // مهلت تمام شده
            timerContainer.classList.add('timer-expired');
            timerContainer.innerHTML = `
                <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                <div class="timer-expired-message">مهلت ثبت نام به پایان رسیده است</div>
            `;
            return timerContainer;
        }

        // تایمر فعال
        const timerHTML = `
            <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
            <div class="timer-display">
                <div class="time-unit">
                    <span class="time-value" id="days-${cardId}">00</span>
                    <span class="time-label">روز</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="hours-${cardId}">00</span>
                    <span class="time-label">ساعت</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="minutes-${cardId}">00</span>
                    <span class="time-label">دقیقه</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="seconds-${cardId}">00</span>
                    <span class="time-label">ثانیه</span>
                </div>
            </div>
        `;

        timerContainer.innerHTML = timerHTML;

        // تابع به‌روزرسانی تایمر
        function updateTimer() {
            const now = new Date();
            const timeRemaining = expiryDateTime - now;

            // اگر زمان به پایان رسیده باشد
            if (timeRemaining <= 0) {
                timerContainer.classList.add('timer-expired');
                timerContainer.innerHTML = `
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">مهلت ثبت نام به پایان رسیده است</div>
                `;
                return;
            }

            // محاسبه روز، ساعت، دقیقه و ثانیه باقی‌مانده
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // نمایش مقادیر
            document.getElementById(`days-${cardId}`).textContent = toPersianNumber(days);
            document.getElementById(`hours-${cardId}`).textContent = toPersianNumber(hours);
            document.getElementById(`minutes-${cardId}`).textContent = toPersianNumber(minutes);
            document.getElementById(`seconds-${cardId}`).textContent = toPersianNumber(seconds);

            // اگر زمان کمتر از ۲۴ ساعت باقی مانده
            if (days === 0 && hours < 24) {
                timerContainer.classList.add('timer-urgent');
            }
        }

        // شروع تایمر
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);

        // ذخیره interval برای پاکسازی
        timerContainer.dataset.intervalId = timerInterval;

        return timerContainer;
    }

    // تابع اصلی برای بارگذاری کارت‌ها با تایمر
    async function loadVouchersWithTimer() {
        const container = document.getElementById('vouchers-container');
        const API_URL = 'https://script.google.com/macros/s/AKfycbxfBqJKr9LPQzJMFMGZi7VIc2IS1ts9_AyMpgV_AHbiwAIoUfK421MhnS--t6OuAnOlEw/exec';

        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('خطا در دریافت داده');
            const cards = await response.json();

            container.innerHTML = '';

            if (!Array.isArray(cards) || cards.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#888;">هیچ کارتی موجود نیست.</p>';
                return;
            }

            const filteredCards = cards.filter(card =>
                card.dis_card_id && card.dis_card_id.trim().toLowerCase() === CURRENT_CATEGORY.toLowerCase()
            );

            if (filteredCards.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#888;">در این دسته کارتی موجود نیست.</p>';
                return;
            }

            let hasActive = false;
            filteredCards.forEach(card => {
                const isActive = card.status === 'active';
                if (isActive) hasActive = true;

                const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                const hasAddress = card.address && card.address.trim() !== '';

                // ایجاد تایمر اگر تاریخ و زمان موجود باشد
                let timerHTML = '';
                if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                    const timerElement = createTimer(card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time, cardId);
                    timerHTML = timerElement.outerHTML;
                }

                // تهیه دکمه رزرو با اطلاعات اضافی
                const reserveBtn = isActive 
                    ? `<a href="#" class="deposit-link" 
                          data-store="${card.store_name || ''}" 
                          data-label="${card.dis_card_label || ''}"
                          onclick="scrollToForm('${card.store_name || ''}', '${card.dis_card_label || ''}', '${card.adv_pay || '0'}'); return false;">
                          رزرو کارت تخفیف
                       </a>`
                    : '<div class="deposit-link disabled">غیرفعال</div>';

                const html = `
                    <div class="voucher-card ${!isActive ? 'dimmed' : ''}">
                        ${timerHTML}
                        <div class="voucher-title">${card.title || 'کارت تخفیف'}</div>
                        <div class="voucher-item">
                            <span class="voucher-label">مبلغ اعتبار:</span>
                            <span class="voucher-value credit">${formatToToman(card.credit)}</span>
                        </div>
                        <div class="voucher-item">
                            <span class="voucher-label">مبلغ تخفیف:</span>
                            <span class="voucher-value discount">${formatToToman(card.dis_amo)}</span>
                        </div>
                        <div class="divider"></div>
                        <div class="voucher-item">
                            <span class="voucher-label">هزینه کل:</span>
                            <span class="voucher-value total">${formatToToman(card.total_pay)}</span>
                        </div>
                        <div class="voucher-item">
                            <span class="voucher-label">پرداخت در فروشگاه:</span>
                            <span class="voucher-value inshop">${formatToToman(card.in_shop_pay)}</span>
                        </div>
                        <div class="voucher-item">
                            <span class="voucher-label">پیش پرداخت:</span>
                            <span class="voucher-value advance">${formatToToman(card.adv_pay)}</span>
                        </div>
                        <div class="divider"></div>
                        <div class="voucher-item">
                            <span class="voucher-label">تاریخ انقضای کارت تخفیف:</span>
                            <span class="voucher-value" style="color:#6b7280; font-weight:normal;">
                               ${(typeof card.expire_date === 'string' ? card.expire_date : 'مشخص نشده')}
                            </span>
                        </div>
                        ${reserveBtn}
                        <div class="voucher-help-text">
                            توضیح: فقط با پرداخت <strong>${formatToToman(card.total_pay)}</strong>، 
                            <strong>${formatToToman(card.credit)}</strong> خرید کن!
                        </div>
                        <div style="display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 12px;">
                            <a href="#" class="help-link" onclick="toggleHelp('${cardId}'); return false;">
                                📌 راهنمای جزئی‌تر
                            </a>
                            ${hasAddress ? `
                                <a href="#" class="help-link" style="color:#d97706;" onclick="toggleAddress('${cardId}'); return false;">
                                    📍 آدرس
                                </a>
                            ` : ''}
                        </div>
                        <div id="help-text-${cardId}" class="voucher-help-text" style="display:none; margin-top:12px;">
                            <strong>چگونه کارت تخفیف کار می‌کند؟</strong><br>
                            - ابتدا <strong>${formatToToman(card.adv_pay)}</strong> را پرداخت کنید تا کارت رزرو شود.<br>
                            - سپس با مراجعه به فروشگاه، برای خرید <strong>${formatToToman(card.credit)}</strong> اعتبار، 
                              فقط <strong>${formatToToman(card.in_shop_pay)}</strong> را پرداخت کنید.<br>
                            - در مجموع، شما <strong>${formatToToman(card.total_pay)}</strong> پرداخت کرده‌اید 
                              و <strong>${formatToToman(card.dis_amo)}</strong> تومان سود کرده‌اید!
                        </div>
                        ${hasAddress ? `
                            <div id="address-text-${cardId}" class="address-text" style="display:none; margin-top:12px;">
                                ${card.address}
                            </div>
                        ` : ''}
                    </div>
                `;
                container.innerHTML += html;
            });

        } catch (error) {
            console.error('خطا:', error);
            container.innerHTML = '<p style="text-align:center; color:red;">خطا در بارگذاری کارت‌ها. لطفاً دوباره تلاش کنید.</p>';
        }
    }

    // تابع‌های کمکی موجود در اسکریپت اصلی
    function formatToToman(value) {
        const num = parseInt(value) || 0;
        const thousand = Math.floor(num);
        return new Intl.NumberFormat('fa-IR').format(thousand) + ' هزار تومان';
    }

    function toggleHelp(cardId) {
        const helpEl = document.getElementById(`help-text-${cardId}`);
        const isVisible = helpEl.style.display === 'block';
        helpEl.style.display = isVisible ? 'none' : 'block';
    }

    function toggleAddress(cardId) {
        const addrEl = document.getElementById(`address-text-${cardId}`);
        const isVisible = addrEl.style.display === 'block';
        addrEl.style.display = isVisible ? 'none' : 'block';
    }

    function scrollToForm(storeName, cardLabel, advPay) {
        document.getElementById('selectedStoreName').textContent = storeName || '—';
        document.getElementById('selectedCardLabel').textContent = cardLabel || '—';
        document.getElementById('selectedStoreNameInput').value = storeName || '';
        document.getElementById('selectedCardLabelInput').value = cardLabel || '';
        document.getElementById('selectedAdvPayInput').value = advPay || '0';

        const form = document.getElementById('reservation-form');
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // بارگذاری اولیه
    loadVouchersWithTimer();
});
