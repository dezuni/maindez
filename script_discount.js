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
    DiscountFormData.append("password", document.getElementById("DiscountVerifCode").value);
    DiscountFormData.append("status", "active");
    DiscountFormData.append("time_used", "");
    DiscountFormData.append("date_used", "");
    DiscountFormData.append("Expiration_Date_english", document.getElementById("selectedExpirationEnglishInput").value);
    DiscountFormData.append("store_name", document.getElementById("selectedStoreNameInput").value);
    DiscountFormData.append("dis_card_label", document.getElementById("selectedCardLabelInput").value);
    DiscountFormData.append("credit", document.getElementById("selectedCreditInput").value);
    DiscountFormData.append("in_shop_pay", document.getElementById("selectedShoppayInput").value);
    DiscountFormData.append("expire_date", document.getElementById("selectedexpireInput").value);
    DiscountFormData.append("DiscountCode", "");
    DiscountFormData.append("MessageSent", "0");
    DiscountFormData.append("title", document.getElementById("selectedTitleInput").value);    
    DiscountFormData.append("adv_pay", document.getElementById("selectedAdvPayInput").value);
    DiscountFormData.append("dezuni_profit_percent", document.getElementById("selectedProfitPercentInput").value);
    DiscountFormData.append("dezuni_profit", document.getElementById("selectedOurProfitInput").value);
    DiscountFormData.append("store_profit", document.getElementById("selectedStoreProfitInput").value);
    
    // ⚠️ لینک بک‌اند را با لینک جدید جایگزین کنید
    fetch("https://script.google.com/macros/s/YOUR_NEW_DEPLOYMENT_ID/exec", {
        method: "POST",
        body: DiscountFormData
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('خطای ارسال، بعدا تلاش کنید. Status: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success response:', data);
        generateCaptcha1();
        DiscountRequestStatusDiv.textContent = '';
        if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
            DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
        }
        
        // ✅ هدایت به درگاه زرین‌پال
        if (data.status === "payment_initiated" && data.authority) {
            // حالت تست (sandbox) - برای حالت واقعی تغییر دهید
            const paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${data.authority}`;
            window.location.href = paymentUrl;
        } else if (data.status === "error") {
            throw new Error(data.message || 'خطا در ایجاد درخواست پرداخت');
        } else {
            throw new Error('پاسخ نامعتبر از سرور');
        }
    })
    .catch(error => {
        console.error("Fetch error:", error);
        DiscountRequestStatusDiv.textContent = "❌ " + error.message;
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
