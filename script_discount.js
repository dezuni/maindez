// how much discount?
let discountRate = 10;

// discount registration deadline
let YYYY = 2025; // year
let MM = 11;      // month
let DD = 7;      // day
let RegistrationDeadline = new Date(YYYY, MM-1, DD, 24, 00, 00);

// discount expiration date
YYYY = 2025; // year
MM = 11;      // month
DD = 21;      // day
const expiryDate = new Date(YYYY, MM-1, DD, 24, 00, 00);

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
    
    if (currentDate > RegistrationDeadline) {
        DiscountRequestStatusDiv.textContent = "❌ مهلت ثبت نام به پایان رسیده است.";
        DiscountRequestStatusDiv.style.color = 'red';
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
    DiscountFormData.append("discount", discountRate);
    DiscountFormData.append("password", document.getElementById("DiscountVerifCode").value);
    DiscountFormData.append("status", "active");
    DiscountFormData.append("time_used", "");
    DiscountFormData.append("date_used", "");
    DiscountFormData.append("Expiration_Date", expiryDate.toString());

    fetch("https://script.google.com/macros/s/AKfycbxsFfdn1ytXmez9Qa4I89xRir_Zppg7cQQpltPhHZtN51dIkT-OrioHu8iI1v5Vhehb/exec", {
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
        document.getElementById("DiscountSuccessMessage").style.display = "block";
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
