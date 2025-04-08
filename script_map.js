 async function searchOffice() {
            const name = document.getElementById("officeName").value;
            const apiUrl = "https://script.google.com/macros/s/AKfycbziT4ZmtjMwZovAKkkfCQuiG2sUmkOcNssi1P2CitM-r0L6GkVR4UmtLbIYYkQhOD8YUA/exec?name=" + encodeURIComponent(name);

            // Show spinner
            const spinnerContainer = document.getElementById("spinnerContainer");
            spinnerContainer.style.display = "flex";

            try {
                let officeSearchResultDiv = document.getElementById("officeSearchResult");
                officeSearchResultDiv.innerHTML = "";
             
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.length === 0) {
                    Div.innerHTML = "<p>هیچ دفتری یافت نشد.</p>";
                } else {
                    data.forEach(office => {
                        const latitude = office.latitude;
                        const longitude = office.longitude;
                        const mapUrl = `https://www.google.com/maps?q=${latitude},${longitude}`; // لینک گوگل مپ

                        officeSearchResultDiv.innerHTML += 
                            `<div>
                                <h3>${office.officeName}</h3>
                                <p>ساختمان: ${office.building}</p>
                                <p>طبقه: ${office.floor}</p>
                                <p>شماره اتاق: ${office.roomNumber}</p>
                                <p>موقعیت: <a href="${mapUrl}" target="_blank">مشاهده در نقشه</a></p>
                            </div><hr>`;
                    });
                }
            } catch (error) {
                console.error("خطا در دریافت اطلاعات:", error);
                document.getElementById("officeSearchResult").innerHTML = "<p>یافت نشد </p>";
            } finally {
                // Hide spinner
                spinnerContainer.style.display = "none";
            }
        }

// This script intercepts and modifies all clicks within the iframe
        document.getElementById('interactive-map').addEventListener('click', function(e) {
            // Only intercept clicks that would open the app
            if (e.target.closest('a[href^="https://maps.app.goo.gl"]') ||
                e.target.closest('a[href^="comgooglemaps://"]')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }, true);

        // Additional protection by modifying iframe content
        window.addEventListener('message', function(event) {
            if (event.origin !== "https://www.google.com") return;

            // Post a message to the iframe to disable app links
            const iframe = document.querySelector('#interactive-map iframe');
            iframe.contentWindow.postMessage({
                disableAppLinks: true,
                disableNavigation: true
            }, 'https://www.google.com');
        });
