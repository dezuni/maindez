            // Add a spinner for visual feedback
 const spinnerform = document.createElement('div');
    spinnerform.className = 'spinner';

const serviceOptions = {
    "آموزشی": ["اخذ امضاهای پایان نامه", "فرم معادلسازی دروس", "امور انتخاب واحد"],
    "پژوهشی": ["تهیه فرمهای پژوهشیار", "اخذ معرفی نامه کارورزی/کارآموزی", "پروپوزال ارشد/دکتری", "دفاعیه ارشد/دکتری"],
    "دانشجویی": ["امور فارغ التحصیلی", "امور خوابگاه"]
};

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
let correctAnswer = 0;

function generateCaptcha() {
const num1 = Math.floor(Math.random() * 10) + 1;
const num2 = Math.floor(Math.random() * 10) + 1;
correctAnswer = num1 + num2;
document.getElementById("captchaQuestion").textContent = `حاصل جمع ${num1} + ${num2} چند می‌شود؟`;
}

generateCaptcha(); // اولین بار هنگام بارگذاری صفحه
document.getElementById("serviceForm").addEventListener("submit", function(event) {
    event.preventDefault();
const userCaptcha = parseInt(document.getElementById("captchaAnswer").value);
    const requeststatusDiv = document.getElementById('requeststatus');
if (userCaptcha !== correctAnswer) {
             requeststatusDiv.textContent = "";
            document.getElementById("successMessage").style.display = "none";
             document.getElementById("captchaError").style.display = "block";
               generateCaptcha(); // تولید سوال جدید
                document.getElementById("captchaAnswer").value = ""; // پاک کردن پاسخ اشتباه
                //document.getElementById("spinner").style.display = "none";
            return; // از ارسال فرم جلوگیری کن
}
requeststatusDiv.textContent = 'در حال ارسال درخواست ...';
requeststatusDiv.style.color='blue';
requeststatusDiv.appendChild(spinnerform);
    
document.getElementById("captchaError").style.display = "none"; // اگر پاسخ درست بود، پیام خطا رو مخفی کن

    //document.getElementById("spinner").style.display = "block";
    document.getElementById("successMessage").style.display = "none";
   // document.getElementById('newRequest')='';
   //document.getElementById("newRequest").style.display = "none";

    let formData = new FormData();
    formData.append("نام و نام خانوادگی", document.getElementById("fullName").value);
    formData.append("شماره تماس", document.getElementById("phoneNumber").value);
    formData.append("نوع خدمات", document.getElementById("serviceType").value);
    formData.append("نوع فعالیت", document.getElementById("subService").value);
    formData.append("توضیحات", document.getElementById("description").value);
    formData.append("تاریخ ثبت", new Date().toLocaleString("fa-IR"));

    fetch("https://script.google.com/macros/s/AKfycbyMqaXSgQpvA88bbodhMcU3bDuzEwxihZXifrAud0KgFmmVpjyLyEMJM2yJ7mjYJ5r5qw/exec", {
        method: "POST",
        body: formData
    })
    .then(response => response.text())
    .then(data => {
generateCaptcha(); // تولید کپچای جدید بعد از ارسال موفق
        requeststatusDiv.textContent = '';
       //document.getElementById("spinner").style.display = "none";
        requeststatusDiv.removeChild(spinnerform);
        document.getElementById("successMessage").style.display = "block";
        resetForm();
        document.getElementById("serviceForm").reset();
    })
    .catch(error => {
        
        requeststatusDiv.textContent = "❌ خطا در ارسال فرم";
        requeststatusDiv.style.color='red';
       requeststatusDiv.removeChild(spinnerform);
        console.error("Error:", error);
    });
});

function resetForm() {
    document.getElementById("successMessage").style.display = "none";
  // document.getElementById("newRequest").style.display = "none";
    document.getElementById("serviceForm").reset();
}
