document.getElementById('DiscountForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName_discount').value.trim();
  const phoneNumber = document.getElementById('phoneNumber_discount').value.trim();
  const studentCode = document.getElementById('DiscountVerifCode').value.trim();
  const captchaAnswer = document.getElementById('captchaAnswer_discount').value.trim();

  const correctAnswer = sessionStorage.getItem('correctCaptcha') || '8';
  if (captchaAnswer !== correctAnswer) {
    document.getElementById('captchaError_discount').style.display = 'block';
    return;
  }

  // ✅ تبدیل داده‌ها به فرمت فرم (نه JSON)
  const formData = new URLSearchParams();
  formData.append('fullName', fullName);
  formData.append('phoneNumber', phoneNumber);
  formData.append('studentCode', studentCode);
  formData.append('captchaAnswer', captchaAnswer);

  const statusEl = document.getElementById('DiscountRequestStatus');
  statusEl.textContent = 'در حال ارسال...';
  statusEl.style.color = '#3b82f6';

  try {
    // ✅ بدون Content-Type! مرورگر خودش تنظیم می‌کنه
    const response = await fetch('https://script.google.com/macros/s/AKfycbysb8ZPfP_r791_wxuLAyr3YA5EaFl2kaGXs8hL4d18PBOb7u0awGmhZBPsLoIbBBrp/exec', {
      method: 'POST',
      body: formData  // ⚠️ نه JSON.stringify
    });

    const text = await response.text();
    const result = JSON.parse(text); // Google همیشه JSON برمی‌گردونه

    if (result.success) {
      document.getElementById('DiscountSuccessMessage').style.display = 'block';
      document.getElementById('DiscountForm').reset();
      statusEl.textContent = '';
      document.getElementById('captchaError_discount').style.display = 'none';
      generateCaptcha(); // کپچای جدید
    } else {
      throw new Error('خطا در پردازش');
    }
  } catch (err) {
    console.error('خطا:', err);
    statusEl.textContent = '❌ خطایی در ارسال رخ داد. لطفاً دوباره تلاش کنید.';
    statusEl.style.color = '#d32f2f';
  }
});

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  document.getElementById('captchaQuestion_discount').textContent = `${a} + ${b} = ?`;
  sessionStorage.setItem('correctCaptcha', (a + b).toString());
}
generateCaptcha();
