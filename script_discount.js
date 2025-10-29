// how much discount?
let discountRate = 10;

// discount registration deadline
const RegistrationDeadline = new Date('2025-11-15'); // YYMMDD

// discount expiration date
const expiryDate = new Date('2025-11-30'); // YYMMDD

// Get the current date
const currentDate = new Date();

// discount registration deadline passed?
if (inputDate > currentDate) {
    return false;
}

// Add a spinner for visual feedback
const spinnerformDSCNT = document.createElement('div');
spinnerformDSCNT.className = 'spinner';


let correctAnswer = 0;

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 + num2;
    document.getElementById("captchaQuestion_discount").textContent = `حاصل جمع ${num1} + ${num2} چند می‌شود؟`;
}

generateCaptcha(); // Generate first captcha on page load

document.getElementById("DiscountForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const userCaptcha = parseInt(document.getElementById("captchaAnswer_discount").value);
    const DiscountRequestStatusDiv = document.getElementById('DiscountRequestStatus');
    
    if (userCaptcha !== correctAnswer) {
        DiscountRequestStatusDiv.textContent = "";
        document.getElementById("DiscountSuccessMessage").style.display = "none";
        document.getElementById("captchaError_discount").style.display = "block";
        generateCaptcha(); // Generate new question
        document.getElementById("captchaAnswer_discount").value = ""; // Clear wrong answer
        return; // Prevent form submission
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
    
    fetch("https://script.google.com/macros/s/AKfycbyMqaXSgQpvA88bbodhMcU3bDuzEwxihZXifrAud0KgFmmVpjyLyEMJM2yJ7mjYJ5r5qw/exec", {
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
        generateCaptcha(); // Generate new captcha after successful submission
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

function resetForm() {
    document.getElementById("DiscountSuccessMessage").style.display = "none";
    document.getElementById("DiscountForm").reset();
    generateCaptcha();
}
