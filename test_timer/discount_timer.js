        // شناسه نوع تخفیف برای این صفحه
        const currentDiscountType = 'fastfood';
        
        // آدرس واقعی Google Apps Script - این را جایگزین کنید
        const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx53SDyKOSlESCXpuvfjUFbWEJuBmIBi_qfUBfF-ZVMH86rmUdFsOiu5OORaaWwQkhi/exec';
        
        // تابع برای نمایش وضعیت
/*
        function showStatus(message, type = 'info') {
            const statusContainer = document.getElementById('status-container');
            const className = type === 'success' ? 'success-message' : type === 'error' ? 'error-message' : 'loading';
            statusContainer.innerHTML = `<div class="${className}">${message}</div>`;
        } */

        // تابع برای تبدیل اعداد انگلیسی به فارسی
        function toPersianNumber(number) {
            const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
            return number.toString().replace(/\d/g, digit => persianDigits[parseInt(digit)]);
        }
        
        // تابع برای دریافت داده‌ها از Google Sheets
        async function fetchDiscountData() {
            try {
                //console.log('دریافت داده از Google Sheets...');
                //showStatus('در حال دریافت داده از Google Sheets...', 'info');
                
                const response = await fetch(`${GOOGLE_SCRIPT_URL}?dis_card_id=${currentDiscountType}`);
                
                console.log('وضعیت پاسخ:', response.status, response.statusText);
                
                if (!response.ok) {
                    throw new Error(`خطای HTTP: ${response.status} - ${response.statusText}`);
                }
                
                const text = await response.text();
                console.log('پاسخ خام از سرور:', text);
                
                let data;
                try {
                    data = JSON.parse(text);
                } catch (parseError) {
                    console.error('خطا در تجزیه JSON:', parseError);
                    throw new Error('پاسخ غیرمعتبر از سرور: ' + text.substring(0, 100));
                }
                
                // بررسی اگر خطا برگردانده شده
                if (data && data.error) {
                    throw new Error('خطا از سرور: ' + data.error);
                }
                
                // بررسی اگر داده‌ای دریافت نشده
                if (!data || data.length === 0) {
                    throw new Error('هیچ داده‌ای از Sheets دریافت نشد');
                }
                
                console.log('داده‌های پردازش شده:', data);
                showStatus(`داده‌ها با موفقیت از Sheets دریافت شد (${data.length} تایمر)`, 'success');
                return data;
                
            } catch (error) {
                console.error('خطا در دریافت داده از Sheets:', error);
                showStatus(`خطا در دریافت داده: ${error.message}`, 'error');
                
                // استفاده از داده‌های نمونه در صورت خطا
                return [
                    {
                        dis_card_label: 'amo_normal',
                        dis_card_id: 'fastfood',
                        dscnt_reg_expiry_date: '2025-11-20',
                        dscnt_reg_expiry_time: '03:30'
                    },
                    {
                        dis_card_label: 'amo_best',
                        dis_card_id: 'fastfood',
                        dscnt_reg_expiry_date: '2025-11-21',
                        dscnt_reg_expiry_time: '03:30'
                    }
                ];
            }
        }
        
        // تابع برای ایجاد تایمر
        function createTimer(discount) {
            const timerCard = document.createElement('div');
            timerCard.className = 'timer-card';
            timerCard.id = `timer-${discount.dis_card_label}`;
            
            const discountInfo = `
                <div class="discount-info">
                    <div class="discount-label">شناسه: ${discount.dis_card_label}</div>
                    <div class="discount-id">${discount.dis_card_id}</div>
                </div>
                <div class="timer-title">فرصت باقی مانده تا پایان مهلت ثبت نام</div>
            `;
            
            timerCard.innerHTML = discountInfo;
            
            // بررسی تاریخ انقضا
            const expiryDate = new Date(`${discount.dscnt_reg_expiry_date}T${discount.dscnt_reg_expiry_time}`);
            const now = new Date();
            
            if (expiryDate <= now) {
                // مهلت تمام شده
                timerCard.innerHTML += `
                    <div class="expired-message">
                        مهلت ثبت نام تمام شده است
                    </div>
                `;
                return timerCard;
            }
            
            // تایمر فعال
            const timerHTML = `
                <div class="timer">
                    <div class="time-unit">
                        <span class="time-value" id="days-${discount.dis_card_label}">00</span>
                        <span class="time-label">روز</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="hours-${discount.dis_card_label}">00</span>
                        <span class="time-label">ساعت</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="minutes-${discount.dis_card_label}">00</span>
                        <span class="time-label">دقیقه</span>
                    </div>
                    <div class="time-unit">
                        <span class="time-value" id="seconds-${discount.dis_card_label}">00</span>
                        <span class="time-label">ثانیه</span>
                    </div>
                </div>
            `;
            
            timerCard.innerHTML += timerHTML;
            
            // تابع به‌روزرسانی تایمر
            function updateTimer() {
                const now = new Date();
                const timeRemaining = expiryDate - now;
                
                // اگر زمان به پایان رسیده باشد
                if (timeRemaining <= 0) {
                    timerCard.innerHTML = `
                        <div class="discount-info">
                            <div class="discount-label">شناسه: ${discount.dis_card_label}</div>
                            <div class="discount-id">${discount.dis_card_id}</div>
                        </div>
                        <div class="expired-message">
                            مهلت ثبت نام تمام شده است
                        </div>
                    `;
                    return;
                }
                
                // محاسبه روز، ساعت، دقیقه و ثانیه باقی‌مانده
                const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
                
                // نمایش مقادیر
                const daysElement = document.getElementById(`days-${discount.dis_card_label}`);
                const hoursElement = document.getElementById(`hours-${discount.dis_card_label}`);
                const minutesElement = document.getElementById(`minutes-${discount.dis_card_label}`);
                const secondsElement = document.getElementById(`seconds-${discount.dis_card_label}`);
                
                if (daysElement) daysElement.textContent = toPersianNumber(days);
                if (hoursElement) hoursElement.textContent = toPersianNumber(hours);
                if (minutesElement) minutesElement.textContent = toPersianNumber(minutes);
                if (secondsElement) secondsElement.textContent = toPersianNumber(seconds);
                
                // اگر زمان کمتر از ۲۴ ساعت باقی مانده
                if (days === 0 && hours < 24) {
                    const timeUnits = timerCard.querySelectorAll('.time-unit');
                    timeUnits.forEach(unit => {
                        unit.classList.add('urgent');
                    });
                }
            }
            
            // شروع تایمر
            updateTimer();
            const timerInterval = setInterval(updateTimer, 1000);
            
            // ذخیره interval برای پاکسازی
            timerCard.dataset.intervalId = timerInterval;
            
            return timerCard;
        }
        
        // تابع اصلی برای بارگذاری و نمایش تایمرها
        async function loadTimers() {
            const container = document.getElementById('timers-container');
            
            try {
                console.log('شروع بارگذاری تایمرها...');
                
                const discountData = await fetchDiscountData();
                console.log('داده‌های دریافت شده برای نمایش:', discountData);
                
                if (!discountData || discountData.length === 0) {
                    container.innerHTML = '<div class="loading">هیچ تایمر فعالی در Sheets پیدا نشد</div>';
                    return;
                }
                
                container.innerHTML = '';
                
                discountData.forEach(discount => {
                    console.log('ایجاد تایمر برای:', discount.dis_card_label);
                    const timerElement = createTimer(discount);
                    container.appendChild(timerElement);
                });
                
                console.log('تایمرها با موفقیت بارگذاری شدند');
                
            } catch (error) {
                console.error('خطا در بارگذاری تایمرها:', error);
                container.innerHTML = '<div class="loading">خطا در بارگذاری تایمرها از Sheets</div>';
            }
        }
        
        // بارگذاری اولیه تایمرها وقتی صفحه کاملاً لود شد
        window.addEventListener('load', function() {
            console.log('صفحه کاملاً لود شد، شروع بارگذاری تایمرها...');
            loadTimers();
        });
