// Get the current date
const currentDate = new Date();
const spinnerformDSCNT = document.createElement('div');
spinnerformDSCNT.className = 'spinner';

let correctAnswer1 = 0;
const MERCHANT_ID = '04daeba9-a655-44c1-87aa-0bdcb1330b37';
const CALLBACK_URL = 'https://www.dezuni.ir/payment-success.html';

function generateCaptcha1() {
    const num3 = Math.floor(Math.random() * 10) + 1;
    const num4 = Math.floor(Math.random() * 10) + 1;
    correctAnswer1 = num3 + num4;
    
    const captchaElement = document.getElementById("captchaQuestion_discount");
    if (captchaElement) {
        captchaElement.textContent = `حاصل جمع ${num3} + ${num4} چند می‌شود؟`;
    }
}

function initDiscountForm() {
    console.log('Initializing discount form...');
    
    const form = document.getElementById("DiscountForm");
    if (form) {
        console.log('Discount form found');
        generateCaptcha1();
        
        form.addEventListener("submit", function(event) {
            event.preventDefault();
            handleFormSubmit();
        });
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
    
    DiscountRequestStatusDiv.textContent = 'در حال اتصال به درگاه پرداخت ...';
    DiscountRequestStatusDiv.style.color = 'blue';
    DiscountRequestStatusDiv.appendChild(spinnerformDSCNT);
    
    document.getElementById("captchaError_discount").style.display = "none";
    document.getElementById("DiscountSuccessMessage").style.display = "none";

    // ذخیره اطلاعات فرم در localStorage برای استفاده در صفحه بازگشت
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
        store_profit: document.getElementById("selectedStoreProfitInput").value,
        Cart_Banki_No: document.getElementById("selectedCartBankiNoInput").value,
        Cart_Banki_Owner: document.getElementById("selectedCartBankiOwnerInput").value
    };
    
    localStorage.setItem('discountFormData', JSON.stringify(formData));

    // تبدیل تومان به ریال (زرین‌پال به ریال کار می‌کند)
    const amountToman = parseInt(formData.adv_pay);
    const amountRial = amountToman * 10;

    // ارسال درخواست به زرین‌پال
    fetch("https://payment.zarinpal.com/pg/v4/payment/request.json", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            merchant_id: MERCHANT_ID,
            amount: amountRial,
            currency: "IRR",
            description: `پیش‌پرداخت کارت تخفیف ${formData.title}`,
            callback_url: CALLBACK_URL,
            metadata: {
                mobile: formData.phone,
                email: "",
                order_id: "discount_" + Date.now()
            }
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('خطا در اتصال به درگاه پرداخت');
        }
        return response.json();
    })
    .then(data => {
        console.log('ZarinPal response:', data);
        
        if (data.data && data.data.code === 100) {
            // موفقیت‌آمیز - هدایت به صفحه پرداخت
            const authority = data.data.authority;
            localStorage.setItem('paymentAuthority', authority);
            
            DiscountRequestStatusDiv.textContent = '';
            if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
                DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
            }
            
            // هدایت به درگاه پرداخت
            window.location.href = `https://payment.zarinpal.com/pg/StartPay/${authority}`;
        } else {
            throw new Error(data.data.message || 'خطا در درخواست پرداخت');
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDiscountForm);
} else {
    initDiscountForm();
}

// فیلتر کردن خدمات
document.querySelectorAll('.filter-btn').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        const filter = button.getAttribute('data-filter');
        const serviceItems = document.querySelectorAll('.service-item1');
        
        serviceItems.forEach(item => {
            const categories = item.getAttribute('data-category').split(' ');
            item.style.display = categories.includes(filter) ? 'flex' : 'none';
        });
    });
});
