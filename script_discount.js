// Get the current date
const currentDate = new Date();
const spinnerformDSCNT = document.createElement('div');
spinnerformDSCNT.className = 'spinner';

let correctAnswer1 = 0;
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwyJyYM5bKYCssdSNwiaGlkM8_l6YsMRk5hxNoRhqCInY0I38Wz3cCqRWJ6NCJrbk8/exec';

function generateCaptcha1() {
    const num3 = Math.floor(Math.random() * 10) + 1;
    const num4 = Math.floor(Math.random() * 10) + 1;
    correctAnswer1 = num3 + num4;
    
    const captchaElement = document.getElementById("captchaQuestion_discount");
    if (captchaElement) {
        captchaElement.textContent = `حاصل جمع ${num3} + ${num4} چند می‌شود؟`;
        console.log('Captcha generated:', correctAnswer1);
    } else {
        console.error('ERROR: captchaQuestion_discount element NOT FOUND!');
    }
}

function initDiscountForm() {
    console.log('Initializing discount form...');
    
    const form = document.getElementById("DiscountForm");
    if (!form) {
        console.error('ERROR: DiscountForm NOT FOUND!');
        return;
    }
    
    console.log('Discount form found ✓');
    generateCaptcha1();
    
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        handleFormSubmit();
    });
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
    
    DiscountRequestStatusDiv.textContent = 'در حال اتصال به درگاه پرداخت ...';
    DiscountRequestStatusDiv.style.color = 'blue';
    DiscountRequestStatusDiv.appendChild(spinnerformDSCNT);
    
    document.getElementById("captchaError_discount").style.display = "none";
    document.getElementById("DiscountSuccessMessage").style.display = "none";

    // ذخیره اطلاعات فرم
    const formData = {
        phone: document.getElementById("phoneNumber_discount").value,
        name: document.getElementById("fullName_discount").value,
        password: document.getElementById("DiscountVerifCode").value,
        store_name: document.getElementById("selectedStoreNameInput").value,
        dis_card_label: document.getElementById("selectedCardLabelInput").value,
        credit: document.getElementById("selectedCreditInput").value,
        in_shop_pay: document.getElementById("selectedShoppayInput").value,
        expire_date: document.getElementById("selectedexpireInput").value,
        Expiration_Date_english: document.getElementById("selectedExpirationEnglishInput").value,
        title: document.getElementById("selectedTitleInput").value,
        adv_pay: document.getElementById("selectedAdvPayInput").value,
        dezuni_profit_percent: document.getElementById("selectedProfitPercentInput").value,
        dezuni_profit: document.getElementById("selectedOurProfitInput").value,
        store_profit: document.getElementById("selectedStoreProfitInput").value
    };
    
    localStorage.setItem('discountFormData', JSON.stringify(formData));

    // تبدیل تومان به ریال
    const amountToman = parseInt(formData.adv_pay);
    const amountRial = amountToman * 10;

    // ایجاد FormData (نکته کلیدی: بدون هدر!)
    const paymentData = new FormData();
    paymentData.append("action", "payment_request");
    paymentData.append("merchant_id", "04daeba9-a655-44c1-87aa-0bdcb1330b37");
    paymentData.append("amount", amountRial);
    paymentData.append("currency", "IRR");
    paymentData.append("description", `پیش‌پرداخت کارت تخفیف ${formData.title}`);
    paymentData.append("callback_url", "https://www.dezuni.ir/payment-success.html");
    //paymentData.append("mobile", formData.phone);
    //paymentData.append("order_id", "discount_" + Date.now());

    // ارسال بدون هدر (حل مشکل CORS!)
    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: paymentData
    })
    .then(response => response.json())
    .then(data => {
        if (data.data && data.data.code === 100) {
            const authority = data.data.authority;
            localStorage.setItem('paymentAuthority', authority);
            DiscountRequestStatusDiv.textContent = '';
            if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
                DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
            }
            window.location.href = `https://payment.zarinpal.com/pg/StartPay/${authority}`;
        } else {
            const errorMsg = data.errors && data.errors.length > 0 
                ? data.errors[0].message 
                : 'خطا در درخواست پرداخت';
            throw new Error(errorMsg);
        }
    })
    .catch(error => {
        console.error("Payment error:", error);
        DiscountRequestStatusDiv.textContent = "❌ " + error.message;
        DiscountRequestStatusDiv.style.color = 'red';
        if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
            DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
        }
        generateCaptcha1();
    });
}

function resetDiscountForm() {
    document.getElementById("DiscountSuccessMessage").style.display = "none";
    document.getElementById("DiscountForm").reset();
    generateCaptcha1();
}

// اطمینان از بارگذاری کامل DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscountForm);
} else {
    initDiscountForm();
}
