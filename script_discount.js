// how much discount?
let discountRate = 10;

// discount registration deadline
let YYYY =2025; // year
let MM=11;      // month
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
    
    const questionText = `حاصل جمع ${num3} + ${num4} چند می‌شود؟`;
    const captchaElement = document.getElementById("captchaQuestion_discount");
    
    if (captchaElement) {
        captchaElement.textContent = questionText;
        console.log('Captcha question set:', questionText);
    } else {
        console.error('Captcha element not found!');
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing captcha');
    generateCaptcha1();
    
    // Add form submit event listener
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
            DiscountRequestStatusDiv.textContent = "❌ مهلت ثبت نام به پایان رسیده است.";
            DiscountRequestStatusDiv.style.color = 'red';
            return;
        }
        
        DiscountRequestStatusDiv.textContent = 'در حال ارسال درخواست ...';
        DiscountRequestStatusDiv.style.color = 'blue';
        DiscountRequestStatusDiv.appendChild(spinnerformDSCNT);
        
        document.getElementById("captchaError_discount").style.display = "none";
        document.getElementById("DiscountSuccessMessage").style.display = "none";

        let DiscountFormData = {
            phone: document.getElementById("phoneNumber_discount").value,
            name: document.getElementById("fullName_discount").value,
            discount: discountRate,
            password: document.getElementById("DiscountVerifCode").value,
            status: "active",
            time_used: "",
            date_used: "",
            Expiration_Date: expiryDate
        };

        fetch("https://script.google.com/macros/s/AKfycbzMk5POv3CjcdGGt3PbDtZ094vKc5vEczAU3PV2HVt2Tpl7yoiTtaXITNkwq71WS9tH/exec", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(DiscountFormData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('خطای ارسال، بعدا تلاش کنید');
            }
            return response.json();
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
});

function resetDiscountForm() {
    document.getElementById("DiscountSuccessMessage").style.display = "none";
    document.getElementById("DiscountForm").reset();
    generateCaptcha1();
}
