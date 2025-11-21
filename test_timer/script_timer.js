//**
// تایمر برای کارت‌های تخفیف
document.addEventListener('DOMContentLoaded', function() {
    // ⚙️ تغییر این مقدار برای هر صفحه: 'fastfood', 'clothing', 'medical', 'gym', ...
    const CURRENT_CATEGORY = 'fastfood';

    // تابع برای تبدیل اعداد انگلیسی به فارسی - نسخه ایمن
    function toPersianNumber(number) {
        if (isNaN(number) || number === null || number === undefined) {
            return '۰۰';
        }
        
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return number.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
    }

    // تابع برای تبدیل زمان 12 ساعته به 24 ساعته
    function convertTo24Hour(timeStr) {
        console.log(`تبدیل زمان: "${timeStr}"`);
        
        if (!timeStr) return '23:59';
        
        // اگر زمان به صورت 24 ساعته است (مثلاً 23:59)
        if (timeStr.includes(':')) {
            const timeParts = timeStr.split(':');
            if (timeParts.length >= 2) {
                let hours = parseInt(timeParts[0]);
                let minutes = parseInt(timeParts[1]);
                
                // اگر PM است و ساعت کمتر از 12 است، 12 ساعت اضافه کن
                if (timeStr.toUpperCase().includes('PM') && hours < 12) {
                    hours += 12;
                }
                // اگر AM است و ساعت 12 است، به 0 تبدیل کن
                else if (timeStr.toUpperCase().includes('AM') && hours === 12) {
                    hours = 0;
                }
                
                return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            }
        }
        
        return '23:59'; // مقدار پیش‌فرض
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
            console.log(`تایمر ${cardId} به پایان رسید`);
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
    function startTimer(cardId, expiryDate, expiryTime) {
        console.log(`شروع تایمر برای ${cardId} با تاریخ:`, expiryDate, expiryTime);
        
        // تبدیل زمان به فرمت 24 ساعته
        const time24 = convertTo24Hour(expiryTime);
        console.log(`زمان تبدیل شده به 24 ساعته:`, time24);
        
        // تجزیه تاریخ و زمان با بررسی خطا
        let expiryDateTime;
        
        try {
            // روش 1: استفاده از فرمت استاندارد ISO
            const dateString = `${expiryDate}T${time24}:00`;
            expiryDateTime = new Date(dateString);
            
            console.log(`تاریخ ایجاد شده (روش 1 ISO):`, expiryDateTime.toString());
            
            // اگر تاریخ معتبر نیست، روش 2 را امتحان کن
            if (isNaN(expiryDateTime.getTime())) {
                console.log('روش 1 ISO ناموفق، امتحان روش 2...');
                
                // روش 2: تجزیه دستی تاریخ میلادی (YYYY-MM-DD)
                const dateParts = expiryDate.split('-');
                const timeParts = time24.split(':');
                
                if (dateParts.length === 3 && timeParts.length >= 2) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // ماه در JavaScript از 0 شروع می‌شود
                    const day = parseInt(dateParts[2]);
                    const hours = parseInt(timeParts[0]);
                    const minutes = parseInt(timeParts[1]);
                    
                    console.log(`تجزیه دستی میلادی:`, {year, month, day, hours, minutes});
                    
                    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
                        expiryDateTime = new Date(year, month, day, hours, minutes, 0);
                        console.log(`تاریخ ایجاد شده (روش 2 دستی):`, expiryDateTime.toString());
                    } else {
                        throw new Error('اعداد تاریخ نامعتبر هستند');
                    }
                } else {
                    throw new Error('فرمت تاریخ یا زمان نامعتبر است');
                }
            }
            
            // بررسی نهایی معتبر بودن تاریخ
            if (isNaN(expiryDateTime.getTime())) {
                throw new Error('تاریخ نامعتبر است');
            }
            
        } catch (error) {
            console.error(`خطا در ایجاد تاریخ برای ${cardId}:`, error);
            
            // نمایش پیام خطا در تایمر
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

        const now = new Date();
        const timeRemaining = expiryDateTime - now;
        const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));

        console.log(`تایمر برای ${cardId}:`, {
            تاریخ_ورودی: `${expiryDate} ${expiryTime}`,
            زمان_تبدیل_شده: time24,
            تاریخ_نهایی: expiryDateTime.toString(),
            الان: now.toString(),
            روز_باقی_مانده: daysRemaining
        });

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
    function createTimerHTML(cardId, expiryDate, expiryTime) {
        let expiryDateTime;
        let isValidDate = false;
        
        try {
            // تبدیل زمان به 24 ساعته
            const time24 = convertTo24Hour(expiryTime);
            
            // ایجاد تاریخ اتمام ثبت نام
            const dateString = `${expiryDate}T${time24}:00`;
            expiryDateTime = new Date(dateString);
            
            if (isNaN(expiryDateTime.getTime())) {
                const dateParts = expiryDate.split('-');
                const timeParts = time24.split(':');
                
                if (dateParts.length === 3 && timeParts.length >= 2) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1;
                    const day = parseInt(dateParts[2]);
                    const hours = parseInt(timeParts[0]);
                    const minutes = parseInt(timeParts[1]);
                    
                    if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
                        expiryDateTime = new Date(year, month, day, hours, minutes, 0);
                    }
                }
            }
            
            isValidDate = !isNaN(expiryDateTime.getTime());
        } catch (error) {
            console.error(`خطا در ایجاد تاریخ برای HTML تایمر ${cardId}:`, error);
            isValidDate = false;
        }

        const now = new Date();

        if (!isValidDate) {
            // تاریخ نامعتبر
            return `
                <div class="timer-container timer-expired" id="timer-container-${cardId}">
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">خطا در تاریخ ثبت نام</div>
                </div>
            `;
        }

        if (expiryDateTime <= now) {
            // مهلت ثبت نام تمام شده
            return `
                <div class="timer-container timer-expired" id="timer-container-${cardId}">
                    <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                    <div class="timer-expired-message">مهلت ثبت نام به پایان رسیده است</div>
                </div>
            `;
        }

        // تایمر فعال برای مهلت ثبت نام
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

            console.log('کارت‌های فیلتر شده:', filteredCards);

            // ایجاد HTML همه کارت‌ها
            filteredCards.forEach(card => {
                const isActive = card.status === 'active';
                const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                const hasAddress = card.address && card.address.trim() !== '';

                // ایجاد تایمر برای مهلت ثبت نام (dscnt_reg_expiry_date و dscnt_reg_expiry_time)
                let timerHTML = '';
                if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                    console.log(`کارت ${cardId} دارای تاریخ ثبت نام:`, {
                        expiryDate: card.dscnt_reg_expiry_date,
                        expiryTime: card.dscnt_reg_expiry_time
                    });
                    timerHTML = createTimerHTML(cardId, card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time);
                } else {
                    console.log(`کارت ${cardId} فاقد تاریخ ثبت نام`);
                }

                // بقیه کد ایجاد کارت...
                // [کد قبلی ایجاد کارت بدون تغییر]
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

            // بعد از اضافه شدن همه کارت‌ها به DOM، تایمرها را شروع کن
            setTimeout(() => {
                filteredCards.forEach(card => {
                    const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                    if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                        console.log(`شروع تایمر برای ${cardId}`);
                        startTimer(cardId, card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time);
                    }
                });
            }, 100);

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

    window.scrollToForm = function(storeName, cardLabel, advPay) {
        document.getElementById('selectedStoreName').textContent = storeName || '—';
        document.getElementById('selectedCardLabel').textContent = cardLabel || '—';
        document.getElementById('selectedStoreNameInput').value = storeName || '';
        document.getElementById('selectedCardLabelInput').value = cardLabel || '';
        document.getElementById('selectedAdvPayInput').value = advPay || '0';

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

/************************************************************************/
/************************************************************************/
/************************************************************************/
/************************************************************************/

/*
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
    function startTimer(cardId, expiryDate, expiryTime) {
        // ایجاد تاریخ انقضا
        const [year, month, day] = expiryDate.split('-').map(Number);
        const [hours, minutes] = expiryTime.split(':').map(Number);
        const expiryDateTime = new Date(year, month - 1, day, hours, minutes, 0);

        // بررسی اگر تاریخ معتبر نیست
        if (isNaN(expiryDateTime.getTime())) {
            console.error('تاریخ انقضا نامعتبر برای کارت:', cardId, expiryDate, expiryTime);
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
    function createTimerHTML(cardId, expiryDate, expiryTime) {
        const [year, month, day] = expiryDate.split('-').map(Number);
        const [hours, minutes] = expiryTime.split(':').map(Number);
        const expiryDateTime = new Date(year, month - 1, day, hours, minutes, 0);
        const now = new Date();

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

                // ایجاد تایمر اگر تاریخ و زمان موجود باشد
                let timerHTML = '';
                if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                    timerHTML = createTimerHTML(cardId, card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time);
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

            // بعد از اضافه شدن همه کارت‌ها به DOM، تایمرها را شروع کن
            setTimeout(() => {
                filteredCards.forEach(card => {
                    const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                    if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                        startTimer(cardId, card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time);
                    }
                });
            }, 100);

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

    window.scrollToForm = function(storeName, cardLabel, advPay) {
        document.getElementById('selectedStoreName').textContent = storeName || '—';
        document.getElementById('selectedCardLabel').textContent = cardLabel || '—';
        document.getElementById('selectedStoreNameInput').value = storeName || '';
        document.getElementById('selectedCardLabelInput').value = cardLabel || '';
        document.getElementById('selectedAdvPayInput').value = advPay || '0';

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
*/




/************************************************************************/
/************************************************************************/
/************************************************************************/
/************************************************************************/

/*
// تایمر برای کارت‌های تخفیف
document.addEventListener('DOMContentLoaded', function() {
    // ⚙️ تغییر این مقدار برای هر صفحه: 'fastfood', 'clothing', 'medical', 'gym', ...
    const CURRENT_CATEGORY = 'fastfood';

    // تابع برای تبدیل اعداد انگلیسی به فارسی
    function toPersianNumber(number) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return number.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
    }

    // شیء برای ذخیره intervalهای تایمر
    const timerIntervals = {};

    // تابع برای ایجاد تایمر
    function createTimer(expiryDate, expiryTime, cardId) {
        const timerContainer = document.createElement('div');
        timerContainer.className = 'timer-container';
        timerContainer.id = `timer-container-${cardId}`;

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

        // تایمر فعال - ابتدا با مقادیر اولیه نمایش داده می‌شود
        timerContainer.innerHTML = `
            <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
            <div class="timer-display">
                <div class="time-unit">
                    <span class="time-value" id="days-${cardId}">--</span>
                    <span class="time-label">روز</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="hours-${cardId}">--</span>
                    <span class="time-label">ساعت</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="minutes-${cardId}">--</span>
                    <span class="time-label">دقیقه</span>
                </div>
                <div class="time-unit">
                    <span class="time-value" id="seconds-${cardId}">--</span>
                    <span class="time-label">ثانیه</span>
                </div>
            </div>
        `;

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
                
                // پاک کردن interval
                if (timerIntervals[cardId]) {
                    clearInterval(timerIntervals[cardId]);
                    delete timerIntervals[cardId];
                }
                return;
            }

            // محاسبه روز، ساعت، دقیقه و ثانیه باقی‌مانده
            const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

            // پیدا کردن المنت‌ها از داخل container فعلی
            const daysElement = timerContainer.querySelector(`#days-${cardId}`);
            const hoursElement = timerContainer.querySelector(`#hours-${cardId}`);
            const minutesElement = timerContainer.querySelector(`#minutes-${cardId}`);
            const secondsElement = timerContainer.querySelector(`#seconds-${cardId}`);

            // به‌روزرسانی مقادیر اگر المنت‌ها وجود دارند
            if (daysElement) daysElement.textContent = toPersianNumber(days);
            if (hoursElement) hoursElement.textContent = toPersianNumber(hours);
            if (minutesElement) minutesElement.textContent = toPersianNumber(minutes);
            if (secondsElement) secondsElement.textContent = toPersianNumber(seconds);

            // اگر زمان کمتر از ۲۴ ساعت باقی مانده
            if (days === 0 && hours < 24) {
                timerContainer.classList.add('timer-urgent');
            } else {
                timerContainer.classList.remove('timer-urgent');
            }
        }

        // شروع تایمر بعد از اضافه شدن به DOM
        setTimeout(() => {
            updateTimer(); // اجرای اولیه
            timerIntervals[cardId] = setInterval(updateTimer, 1000);
        }, 100);

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

            filteredCards.forEach(card => {
                const isActive = card.status === 'active';
                const cardId = card.dis_card_id + '-' + (card.title || 'card').replace(/\s+/g, '_').replace(/[^\w]/g, '');
                const hasAddress = card.address && card.address.trim() !== '';

                // ایجاد تایمر اگر تاریخ و زمان موجود باشد
                let timerHTML = '';
                if (card.dscnt_reg_expiry_date && card.dscnt_reg_expiry_time) {
                    try {
                        const timerElement = createTimer(card.dscnt_reg_expiry_date, card.dscnt_reg_expiry_time, cardId);
                        timerHTML = timerElement.outerHTML;
                    } catch (error) {
                        console.error('خطا در ایجاد تایمر برای کارت:', cardId, error);
                        timerHTML = `
                            <div class="timer-container timer-expired">
                                <div class="timer-title">مهلت باقی مانده برای رزرو کارت تخفیف</div>
                                <div class="timer-expired-message">خطا در محاسبه زمان</div>
                            </div>
                        `;
                    }
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

    window.scrollToForm = function(storeName, cardLabel, advPay) {
        document.getElementById('selectedStoreName').textContent = storeName || '—';
        document.getElementById('selectedCardLabel').textContent = cardLabel || '—';
        document.getElementById('selectedStoreNameInput').value = storeName || '';
        document.getElementById('selectedCardLabelInput').value = cardLabel || '';
        document.getElementById('selectedAdvPayInput').value = advPay || '0';

        const form = document.getElementById('reservation-form');
        if (form) {
            form.style.display = 'block';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // پاکسازی intervalها هنگام خروج از صفحه
    window.addEventListener('beforeunload', function() {
        Object.values(timerIntervals).forEach(interval => {
            clearInterval(interval);
        });
    });
    
    // بارگذاری اولیه
    loadVouchersWithTimer();
});
*/
