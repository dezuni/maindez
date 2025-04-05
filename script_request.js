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

        document.getElementById("serviceForm").addEventListener("submit", function(event) {
            event.preventDefault();
            document.getElementById("spinner").style.display = "block";
            document.getElementById("successMessage").style.display = "none";

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
                document.getElementById("spinner").style.display = "none";
                document.getElementById("successMessage").style.display = "block";
                document.getElementById("serviceForm").reset();
            })
            .catch(error => {
                document.getElementById("spinner").textContent = "❌ خطا در ارسال فرم";
                console.error("Error:", error);
            });
        });

        function resetForm() {
            document.getElementById("successMessage").style.display = "none";
            document.getElementById("serviceForm").reset();
        }
