// تایمر برای کارت‌های تخفیف
document.addEventListener('DOMContentLoaded', function() {
    // ⚙️ تغییر این مقدار برای هر صفحه: 'fastfood', 'clothing', 'medical', 'gym', ...
    const CURRENT_CATEGORY = 'fastfood';

    // تابع برای تبدیل اعداد انگلیسی به فارسی
    function toPersianNumber(number) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return number.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
    }

    // شیء برای ذخیره اطلاعات تایمرها
    const timers = {};

    // تابع برای به‌روزرسانی یک تایمر خاص
    function updateTimer(cardId, expiryDateTime) {
        const now = new Date();
        const timeRemaining = expiryDateTime - now;

        // پیدا کردن المنت‌های تایمر
        const daysElement = document.getElementById(`days-${cardId}`);
        const hoursElement = document.getElementById(`hours-${cardId}`);
        const minutesElement = document.getElementById(`minutes-${cardId}`);
        const secondsElement = document.getElementById(`seconds-${cardId}`);
        const timerContainer = document.getElementById(`timer-container-${cardId}`);

        // اگر المنت‌ها وجود ندارند، تایمر را متوقف کن
        if (!daysElement || !hoursElement || !minutesElement || !secondsElement || !timerContainer) {
            if (timers[cardId]) {
                clearInterval(timers[cardId].interval);
                delete timers[cardId];
            }
            return;
        }

        // اگر زمان به پایان رسیده باشد
        if (timeRemaining <= 0) {
            timerContainer.classList.add('timer-expired');
            timerContainer.innerHTML = `
                <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                <div class="timer-expired-message">مهلت ثبت نام به پایان رسیده است</div>
            `;
            
            // پاک کردن interval
            if (timers[cardId]) {
                clearInterval(timers[cardId].interval);
                delete timers[cardId];
            }
            return;
        }

        // محاسبه روز، ساعت، دقیقه و ثانیه باقی‌مانده
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

        // به‌روزرسانی مقادیر
        daysElement.textContent = toPersianNumber(days);
        hoursElement.textContent = toPersianNumber(hours);
        minutesElement.textContent = toPersianNumber(minutes);
        secondsElement.textContent = toPersianNumber(seconds);

        // اگر زمان کمتر از ۲۴ ساعت باقی مانده
        if (days === 0 && hours < 24) {
            timerContainer.classList.add('timer-urgent');
        } else {
            timerContainer.classList.remove('timer-urgent');
        }
    }

    // تابع برای شروع تایمر
    function startTimer(cardId, RegistrationexpiryDateString) {
        // ایجاد تاریخ از رشته ISO (فرمت: 2025-11-24T22:59:00)
        const expiryDateTime = new Date(RegistrationexpiryDateString);

        // بررسی اگر تاریخ معتبر نیست
        if (isNaN(expiryDateTime.getTime())) {
            const timerContainer = document.getElementById(`timer-container-${cardId}`);
            if (timerContainer) {
                timerContainer.classList.add('timer-expired');
                timerContainer.innerHTML = `
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">خطا در تاریخ ثبت نام</div>
                `;
            }
            return;
        }

        // اولین به‌روزرسانی
        updateTimer(cardId, expiryDateTime);

        // شروع interval برای به‌روزرسانی هر ثانیه
        const interval = setInterval(() => {
            updateTimer(cardId, expiryDateTime);
        }, 1000);

        // ذخیره اطلاعات تایمر
        timers[cardId] = {
            interval: interval,
            expiry: expiryDateTime
        };
    }

    // تابع برای ایجاد HTML تایمر
    function createTimerHTML(cardId, RegistrationexpiryDateString) {
        const expiryDateTime = new Date(RegistrationexpiryDateString);
        const now = new Date();

        if (isNaN(expiryDateTime.getTime())) {
            // تاریخ نامعتبر
            return `
                <div class="timer-container timer-expired" id="timer-container-${cardId}">
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">خطا در تاریخ ثبت نام</div>
                </div>
            `;
        }

        if (expiryDateTime <= now) {
            // مهلت تمام شده
            return `
                <div class="timer-container timer-expired" id="timer-container-${cardId}">
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">مهلت ثبت نام به پایان رسیده است</div>
                </div>
            `;
        }

        // تایمر فعال
        return `
            <div class="timer-container" id="timer-container-${cardId}">
                <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                <div class="timer-display">
                    <div class="time-unit">
                        <span class="time-value" id="days-${cardId}">۰۰</span>
                        <span class="time-label">روز</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="hours-${cardId}">۰۰</span>
                        <span class="time-label">ساعت</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="minutes-${cardId}">۰۰</span>
                        <span class="time-label">دقیقه</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="seconds-${cardId}">۰۰</span>
                        <span class="time-label">ثانیه</span>
                    </div>
                </div>
            </div>
        `;
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

            // ایجاد HTML همه کارت‌ها
            filteredCards.forEach(card => {
                const isActive = card.status === 'active';
                const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                const hasAddress = card.address && card.address.trim() !== '';
                console.log('وضعیت تایمر:', isActive);
                
                // ایجاد تایمر برای مهلت ثبت نام
                let timerHTML = '';
                if (card.dscnt_reg_expiry_date) {
                    timerHTML = createTimerHTML(cardId, card.dscnt_reg_expiry_date);
                }

                // اگر مهلت ثبت نام تمام شده، کارت را غیر فعال کن
                const now = new Date();
                if (card.dscnt_reg_expiry_date < now) {
                        // مهلت ثبت نام تمام شده
                    isActive=false;
                }
                console.log('وضعیت تایمر:', isActive);
                
                // تهیه دکمه رزرو با اطلاعات اضافی
                const reserveBtn = isActive 
                    ? `<a href="#" class="deposit-link" 
                          data-store="${card.store_name || ''}" 
                          data-label="${card.dis_card_label || ''}"
                          onclick="scrollToForm('${card.store_name || ''}', '${card.dis_card_label || ''}', '${card.adv_pay || '0'}', '${card.credit || '0'}', '${card.in_shop_pay || '0'}', '${card.expire_date || '0'}','${card.Expiration_Date_english || '0'}'); return false;">
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

            // بعد از اضافه شدن همه کارت‌ها به DOM، تایمرها را شروع کن
            setTimeout(() => {
                filteredCards.forEach(card => {
                    const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                    if (card.dscnt_reg_expiry_date) {
                        startTimer(cardId, card.dscnt_reg_expiry_date);
                    }
                });
            }, 100);

        } catch (error) {
            container.innerHTML = '<p style="text-align:center; color:red;">خطا در بارگذاری کارت‌ها. لطفاً دوباره تلاش کنید.</p>';
        }
    }

    // تابع‌های کمکی موجود در اسکریپت اصلی
    function formatToToman(value) {
        const num = parseInt(value) || 0;
        const thousand = Math.floor(num);
        return new Intl.NumberFormat('fa-IR').format(thousand) + ' تومان';
    }

    window.toggleHelp = function(cardId) {
        const helpEl = document.getElementById(`help-text-${cardId}`);
        if (helpEl) {
            const isVisible = helpEl.style.display === 'block';
            helpEl.style.display = isVisible ? 'none' : 'block';
        }
    }

    window.toggleAddress = function(cardId) {
        const addrEl = document.getElementById(`address-text-${cardId}`);
        if (addrEl) {
            const isVisible = addrEl.style.display === 'block';
            addrEl.style.display = isVisible ? 'none' : 'block';
        }
    }

    window.scrollToForm = function(storeName, cardLabel, advPay,credit, in_shop_pay, expire_date, Expiration_Date_english ) {
        document.getElementById('selectedStoreName').textContent = storeName || '—';
        document.getElementById('selectedCardLabelInput').textContent = cardLabel || '—';
        document.getElementById('selectedStoreNameInput').value = storeName || '';
        document.getElementById('selectedCardLabelInput').value = cardLabel || '';
        document.getElementById('selectedAdvPayInput').value = advPay || '0';
        document.getElementById('selectedCreditInput').value = credit || '0'; 
        document.getElementById('selectedShoppayInput').value = in_shop_pay || '0'; 
        document.getElementById('selectedexpireInput').value = expire_date || '0'; 
        document.getElementById('selectedExpirationEnglishInput').value =Expiration_Date_english || '0'; 

        const form = document.getElementById('reservation-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // پاکسازی intervalها هنگام خروج از صفحه
    window.addEventListener('beforeunload', function() {
        Object.values(timers).forEach(timer => {
            if (timer.interval) {
                clearInterval(timer.interval);
            }
        });
    });

    // بارگذاری اولیه
    loadVouchersWithTimer();
});


