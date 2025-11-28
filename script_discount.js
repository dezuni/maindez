// how much discount?
//let discountRate = 10;

// Get the current date
const currentDate = new Date();
// Add a spinner for visual feedback
const spinnerformDSCNT = document.createElement('div');
spinnerformDSCNT.className = 'spinner';

let correctAnswer1 = 0;

function generateCaptcha1() {
    const num3 = Math.floor(Math.random() * 10) + 1;
    const num4 = Math.floor(Math.random() * 10) + 1;
    correctAnswer1 = num3 + num4;
    
    const captchaElement = document.getElementById("captchaQuestion_discount");
    if (captchaElement) {
        captchaElement.textContent = `حاصل جمع ${num3} + ${num4} چند می‌شود؟`;
        console.log('Captcha question set:', captchaElement.textContent);
    } else {
        console.error('Captcha element not found!');
    }
}


// Initialize when page loads
function initDiscountForm() {
    console.log('Initializing discount form...');
    
    const form = document.getElementById("DiscountForm");
    if (form) {
        console.log('Discount form found');
        generateCaptcha1(); // Generate first captcha
        
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            handleFormSubmit();
        });
    } else {
        console.error('Discount form not found!');
    }
}

function handleFormSubmit() {
    const userCaptcha1 = parseInt(document.getElementById("captchaAnswer_discount").value);
    const DiscountRequestStatusDiv = document.getElementById('DiscountRequestStatus');
        
    if (userCaptcha1 !== correctAnswer1) {
        DiscountRequestStatusDiv.textContent = "";
        document.getElementById("DiscountSuccessMessage").style.display = "none";
        document.getElementById("captchaError_discount").style.display = "block";
        generateCaptcha1();
        document.getElementById("captchaAnswer_discount").value = "";
        return;
    }
           
    DiscountRequestStatusDiv.textContent = 'در حال ارسال درخواست ...';
    DiscountRequestStatusDiv.style.color = 'blue';
    DiscountRequestStatusDiv.appendChild(spinnerformDSCNT);
    
    document.getElementById("captchaError_discount").style.display = "none";
    document.getElementById("DiscountSuccessMessage").style.display = "none";

    // Use FormData instead of JSON to avoid CORS
    let DiscountFormData = new FormData();
    DiscountFormData.append("phone", document.getElementById("phoneNumber_discount").value);
    DiscountFormData.append("name", document.getElementById("fullName_discount").value);
    //DiscountFormData.append("discount", discountRate);
    DiscountFormData.append("password", document.getElementById("DiscountVerifCode").value);
    DiscountFormData.append("status", "active");
    DiscountFormData.append("time_used", "");
    DiscountFormData.append("date_used", "");
    DiscountFormData.append("Expiration_Date_english", document.getElementById("selectedExpirationEnglishInput").value);
    DiscountFormData.append("store_name", document.getElementById("selectedStoreNameInput").value);
    DiscountFormData.append("dis_card_label", document.getElementById("selectedCardLabelInput").value);
    DiscountFormData.append("credit", document.getElementById("selectedCreditInput").value);
    //console.log("credit selected:", document.getElementById("selectedCreditInput").value);
    DiscountFormData.append("in_shop_pay", document.getElementById("selectedShoppayInput").value);
    //console.log("shoppay:", document.getElementById("selectedShoppayInput").value);
    DiscountFormData.append("expire_date", document.getElementById("selectedexpireInput").value);
    //console.log("expire:", document.getElementById("selectedexpireInput").value);
    //console.log("expire_english:", document.getElementById("selectedExpirationEnglishInput").value);
    
    fetch("https://script.google.com/macros/s/AKfycbyNf3lnfDJkt8Rp0YQ_dCXK2gPWkl9EcKeQ1qXW0s5VBKkAd8kbrMRSDX8MXm2rVo6S/exec", {
        method: "POST",
        body: DiscountFormData
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('خطای ارسال، بعدا تلاش کنید. Status: ' + response.status);
        }
        return response.text();
    })
   .then(data => {
    console.log('Success response:', data);
    generateCaptcha1();
    DiscountRequestStatusDiv.textContent = '';
    if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
        DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
    }
 
    const advPay = document.getElementById('selectedAdvPayInput').value;
    const formattedAdvPay = new Intl.NumberFormat('fa-IR').format(advPay) + ' تومان';

    const customerName = document.getElementById("fullName_discount").value; 

    const successMsgEl = document.getElementById("DiscountSuccessMessage");
    /*successMsgEl.innerHTML = `
        جهت نهایی کردن تخفیف مبلغ پیش پرداخت <strong>${formattedAdvPay}</strong> را به شماره کارت 6037998185198362 به نام محمد عادلی واریز نموده 
        و فیش را برای شماره 09028839140 یا ادمین دزیونی در ایتا یا تلگرام ارسال نمایید<br>
        @dezuni_admin
    `;*/
    successMsgEl.innerHTML = `
    <strong>${customerName}</strong> عزیز، برای دریافت کارت تخفیف:

    💳 *پرداخت:* مبلغ <strong>${formattedAdvPay}</strong> 
    به کارت: `6037998185198362` (آقای عادلی)
    
    📤 *ارسال فیش:* از طریق ایتا/تلگرام به:
    → @admin 
    → یا شماره: 09028839140
    
    ✅ *دریافت رسید:* بلافاصله پس از تأیید واریز، کارت تخفیف برای شما ارسال می‌شود.
    `;
        
    successMsgEl.style.display = "block";

    document.getElementById("DiscountForm").reset();
})
    .catch(error => {
        console.error("Fetch error:", error);
        DiscountRequestStatusDiv.textContent = "❌ خطا در ارسال فرم";
        DiscountRequestStatusDiv.style.color = 'red';
        if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
            DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
        }
    });
}

function resetDiscountForm() {
    document.getElementById("DiscountSuccessMessage").style.display = "none";
    document.getElementById("DiscountForm").reset();
    generateCaptcha1();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscountForm);
} else {
    initDiscountForm();
}


/********  new lines for discount logos ********/
/********  new lines for discount logos ********/
/********  new lines for discount logos ********/


// فیلتر کردن خدمات بر اساس دسته‌بندی
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        // حذف کلاس active از همه دکمه‌ها
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // اضافه کردن کلاس active به دکمه کلیک شده
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        const serviceItems = document.querySelectorAll('.service-item1');
        
        serviceItems.forEach(item => {
            const categories = item.getAttribute('data-category').split(' ');
            
            // اگر دسته‌بندی مورد نظر در لیست دسته‌بندی‌های آیتم وجود دارد، نمایش بده
            if (categories.includes(filter)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
});
