document.getElementById('DiscountForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form values
  const fullName = document.getElementById('fullName_discount').value.trim();
  const phoneNumber = document.getElementById('phoneNumber_discount').value.trim();
  const studentCode = document.getElementById('DiscountVerifCode').value.trim();
  const captchaAnswer = document.getElementById('captchaAnswer_discount').value.trim();

  // Simple CAPTCHA validation (example: 5 + 3 = 8)
  // You should generate this dynamically in real use
  const correctAnswer = sessionStorage.getItem('correctCaptcha') || '8';
  if (captchaAnswer !== correctAnswer) {
    document.getElementById('captchaError_discount').style.display = 'block';
    return;
  }

  // Prepare data
  const data = {
    fullName,
    phoneNumber,
    studentCode,
    captchaAnswer
  };

  const statusEl = document.getElementById('DiscountRequestStatus');
  statusEl.textContent = 'در حال ارسال...';
  statusEl.style.color = '#3b82f6';

  try {
    // ✅ Use your NEW Web App URL here
    const response = await fetch('https://script.google.com/macros/s/AKfycbw0s8XOqYZCKOcSByxHAJwM13QRmDZSiv2N5J_LSPRl1_vta2P8GZ9vmwCQ3AK8Ad1t/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      document.getElementById('DiscountSuccessMessage').style.display = 'block';
      document.getElementById('DiscountForm').reset();
      statusEl.textContent = '';
      document.getElementById('captchaError_discount').style.display = 'none';
    } else {
      throw new Error('خطا در ثبت اطلاعات');
    }
  } catch (err) {
  console.error('خطای واقعی:', err);
  
  if (err.name === 'TypeError' && err.message.includes('fetch')) {
    statusEl.textContent = '❌ ارتباط با سرور برقرار نشد. لطفاً اینترنت خود را بررسی کنید.';
  } else if (err.message.includes('500') || err.message.includes('403')) {
    statusEl.textContent = '❌ سرور در دسترس نیست. لطفاً بعداً تلاش کنید.';
  } else {
    statusEl.textContent = '❌ خطایی رخ داد. با پشتیبانی تماس بگیرید.';
  }
  statusEl.style.color = '#d32f2f';
}
});

// Optional: Generate CAPTCHA dynamically (simple example)
function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  document.getElementById('captchaQuestion_discount').textContent = `${a} + ${b} = ?`;
  sessionStorage.setItem('correctCaptcha', (a + b).toString());
}
generateCaptcha();
