// how much discount?
let discountRate = 10;

// discount registration deadline
let YYYY =2025; // year
let MM=10;      // month
let DD=15;      // day
let RegistrationDeadline = new Date(YYYY, MM-1, DD, 24, 00, 00); // YYYY-MM-DD

// discount expiration date
YYYY =2025; // year
MM=11;      // month
DD=30;      // day
const expiryDate = new Date(YYYY, MM-1, DD, 24, 00, 00); // YYYY-MM-DD

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
    document.getElementById("captchaQuestion_discount").textContent = `حاصل جمع ${num3} + ${num4} چند می‌شود؟`;
}

generateCaptcha1(); // Generate first captcha on page load

document.getElementById("DiscountForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const userCaptcha1 = parseInt(document.getElementById("captchaAnswer_discount").value);
    const DiscountRequestStatusDiv = document.getElementById('DiscountRequestStatus');
    
    if (userCaptcha1 !== correctAnswer1) {
        DiscountRequestStatusDiv.textContent = "";
        document.getElementById("DiscountSuccessMessage").style.display = "none";
        document.getElementById("captchaError_discount").style.display = "block";
        generateCaptcha1(); // Generate new question
        document.getElementById("captchaAnswer_discount").value = ""; // Clear wrong answer
        return; // Prevent form submission
    }
    // discount registration deadline passed?
    if ( currentDate > RegistrationDeadline ) {
        DiscountRequestStatusDiv.textContent = "❌ مهلت ثبت نام برای تخفیف به اتمام رسیده است.";
        DiscountRequestStatusDiv.style.color = 'red';
        document.getElementById("captchaError_discount").style.display = "block";
        generateCaptcha1(); // Generate new question
        document.getElementById("captchaAnswer_discount").value = ""; 
        return;
    }
    
    DiscountRequestStatusDiv.textContent = 'در حال ارسال درخواست ...';
    DiscountRequestStatusDiv.style.color = 'blue';
    DiscountRequestStatusDiv.appendChild(spinnerformDSCNT);
    
    document.getElementById("captchaError_discount").style.display = "none";
    document.getElementById("DiscountSuccessMessage").style.display = "none";

    let formData = new FormData();
    formData.append("phone", document.getElementById("phoneNumber_discount").value);
    formData.append("name", document.getElementById("fullName_discount").value);
    formData.append("discount", discountRate);
    formData.append("password", document.getElementById("DiscountVerifCode").value); 
    formData.append("status", "active");
    formData.append("time_used", "");
    formData.append("date_used", "");
    formData.append("Expiration_Date", expiryDate );
    
    fetch("https://script.google.com/macros/s/AKfycbxK4pmFkIphGVBT5xYmdo0P7E_6F8N-W5KB2jeuiynt0G5JDqJsyZWEupEhWF8nq1Zm/exec", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('خطای ارسال، بعدا تلاش کنید');
        }
        return response.text();
    })
    .then(data => {
        generateCaptcha1(); // Generate new captcha after successful submission
        DiscountRequestStatusDiv.textContent = '';
        if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
            DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
        }
        document.getElementById("DiscountSuccessMessage").style.display = "block";
        document.getElementById("DiscountForm").reset();
    })
    .catch(error => {
        DiscountRequestStatusDiv.textContent = "❌ خطا در ارسال فرم";
        DiscountRequestStatusDiv.style.color = 'red';
        if (DiscountRequestStatusDiv.contains(spinnerformDSCNT)) {
            DiscountRequestStatusDiv.removeChild(spinnerformDSCNT);
        }
        console.error("Error:", error);
    });
});

function resetDiscountForm() {
    document.getElementById("DiscountSuccessMessage").style.display = "none";
    document.getElementById("DiscountForm").reset();
    generateCaptcha1();
}
