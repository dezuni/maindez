// Service options for dropdown
const serviceOptions = {
    "آموزشی": ["اخذ امضاهای پایان نامه", "فرم معادلسازی دروس", "امور انتخاب واحد"],
    "پژوهشی": ["تهیه فرمهای پژوهشیار", "اخذ معرفی نامه کارورزی/کارآموزی", "پروپوزال ارشد/دکتری", "دفاعیه ارشد/دکتری"],
    "دانشجویی": ["امور فارغ التحصیلی", "امور خوابگاه"]
};

// Populate sub-service dropdown based on main service selection
document.getElementById("serviceType").addEventListener("change", function() {
    let subService = document.getElementById("subService");
    subService.innerHTML = "<option value=''>انتخاب کنید</option>";
    let selectedService = this.value;
    
    if (selectedService in serviceOptions) {
        serviceOptions[selectedService].forEach(option => {
            let newOption = document.createElement("option");
            newOption.value = option;
            newOption.textContent = option;
            subService.appendChild(newOption);
        });
    }
});

// Captcha system
let correctAnswer = 0;

function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    correctAnswer = num1 + num2;
    document.getElementById("captchaQuestion").textContent = `حاصل جمع ${num1} + ${num2} چند می‌شود؟`;
    document.getElementById("captchaAnswer").value = "";
    document.getElementById("captchaError").style.display = "none";
}

// Initialize captcha on page load
generateCaptcha();

// Form submission handler
document.getElementById("serviceForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    // Get submit button and disable it during submission
    const submitButton = this.querySelector("button[type='submit']");
    submitButton.disabled = true;
    
    // Show spinner and hide messages
    document.getElementById("successMessage").style.display = "none";
    document.getElementById("spinner").style.display = "block";
    document.getElementById("spinner").textContent = " در حال ارسال فرم...";   
     /*"🔄 در حال ارسال فرم...";*/
    
    // Validate captcha
    const userCaptcha = parseInt(document.getElementById("captchaAnswer").value);
    if (userCaptcha !== correctAnswer) {
        document.getElementById("captchaError").style.display = "block";
        generateCaptcha();
        document.getElementById("spinner").style.display = "none";
        submitButton.disabled = false;
        return false;
    }
    
    // Prepare form data
    let formData = new FormData();
    formData.append("نام و نام خانوادگی", document.getElementById("fullName").value);
    formData.append("شماره تماس", document.getElementById("phoneNumber").value);
    formData.append("نوع خدمات", document.getElementById("serviceType").value);
    formData.append("نوع فعالیت", document.getElementById("subService").value);
    formData.append("توضیحات", document.getElementById("description").value);
    formData.append("تاریخ ثبت", new Date().toLocaleString("fa-IR"));
    
    // Record start time for minimum spinner display
    const startTime = Date.now();
    const minDisplayTime = 1000; // Show spinner for at least 1 second
    
    // Submit to Google Apps Script
    fetch("https://script.google.com/macros/s/AKfycbyMqaXSgQpvA88bbodhMcU3bDuzEwxihZXifrAud0KgFmmVpjyLyEMJM2yJ7mjYJ5r5qw/exec", {
        method: "POST",
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        // Calculate remaining time to meet minimum display duration
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => {
            generateCaptcha(); // Generate new captcha
            document.getElementById("spinner").style.display = "none";
            document.getElementById("successMessage").style.display = "block";
            document.getElementById("serviceForm").reset();
            submitButton.disabled = false;
        }, remainingTime);
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById("spinner").textContent = "❌ خطا در ارسال فرم";
        
        // Keep spinner visible for minimum time even on error
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);
        
        setTimeout(() => {
            document.getElementById("spinner").style.display = "none";
            submitButton.disabled = false;
        }, remainingTime);
    });
});

// Reset form function
function resetForm() {
    document.getElementById("successMessage").style.display = "none";
    document.getElementById("serviceForm").reset();
    generateCaptcha();
}
