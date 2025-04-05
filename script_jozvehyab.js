            // Add a spinner for visual feedback
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            
            const gasUrl = 'https://script.google.com/macros/s/AKfycbw9KPNsncmM2Jdl5VZCtOi2V92Xp2pUUGwADHDNGa4Im71V67KAcapAxrczemyqtozF/exec';
            
            function searchAuthor() {
              
              const authorName = document.getElementById('authorInput').value.trim();
              const responseDiv = document.getElementById('response');
              const authorButtonsDiv = document.getElementById('authorButtons');
               if (!authorName) {
                responseDiv.textContent = 'لطفا نام استاد را وارد کنید!';
                responseDiv.style.color='red';    
                 authorButtonsDiv.innerHTML='';
                 document.getElementById('articleList').innerHTML='';
                return;
              }
        
              responseDiv.textContent = 'در حال جستجوی استاد ...';
              responseDiv.style.color='blue';
              responseDiv.appendChild(spinner);
              authorButtonsDiv.innerHTML='';
              document.getElementById('articleList').innerHTML='';     
        
              // Send a POST request to the backend for AUTHORSEARCH
              const requestBody = `action:AUTHORSEARCH|message:${authorName}`;
        
              fetch(gasUrl, {
                method: 'POST',
                body: requestBody,
              })
                .then(response => response.json())
                .then(data => {
                  if (data.result && data.result.length > 0) {
                    // Display search results as buttons
                    responseDiv.removeChild(spinner);
                    responseDiv.textContent = 'روی نام استاد کلیک کنید!';
                    responseDiv.style.color='green';            
                    
                    authorButtonsDiv.innerHTML = data.result.map(author => `
                      <button class="author-button" onclick="selectAuthor('${author}')">${author}</button>
                    `).join('');
                    document.getElementById('searchResults').style.display = 'block';
                    //responseDiv.textContent = '';
                  } else {
                    responseDiv.removeChild(spinner);
                    responseDiv.textContent = 'استاد '+ authorName + '  یافت نشد!' ; 
                    responseDiv.style.color='red';
                  }
                })
                .catch(error => {          
                  responseDiv.textContent = '، دوباره تلاش کنید. خطای جستجو';
                  console.error('Error:', error);
                });
            }
        
            function selectAuthor(selectedAuthor) {
              
              const responseDiv = document.getElementById('response');
              const articleListDiv = document.getElementById('articleList');      
              responseDiv.textContent = 'در حال جستجوی جزوات ...';
              responseDiv.style.color='blue';
              responseDiv.appendChild(spinner);
              document.getElementById('authorButtons').innerHTML='';
              document.getElementById('authorInput').value='';
              articleListDiv.innerHTML='';
        
              // Send a POST request to the backend for ARTICLESEARCH
              const requestBody = `action:ARTICLESEARCH|message:${selectedAuthor}`;
        
              fetch(gasUrl, {
                method: 'POST',
                body: requestBody,
              })
                .then(response => response.json())
                .then(data => {
                  if (data.result && data.result.length > 0) {
                      responseDiv.removeChild(spinner);
                      responseDiv.textContent = 'جزوات استاد '+ selectedAuthor + ':';
                      responseDiv.style.color = 'green';
                    
                      // Filter articles to include only those with a non-empty title
                      const validArticles = data.result.filter(article => article.title && article.title.trim() !== '');
                    
                      if (validArticles.length > 0) {
                        // Display valid articles
                        articleListDiv.innerHTML = validArticles.map(article => `
                          <li>
                            <strong>${article.title}</strong> 
                            (${article.date.split('T')[0]}) <!-- Extract date only -->
                            <a href="${article.link}" target="_blank"><strong>دانلود</strong></a>
                          </li>
                        `).join('');
                      } else {
                        // No valid articles found
                        responseDiv.textContent='متاسفانه برای استاد '+ selectedAuthor + 'جزوه ای یافت نشد!'; 
                        responseDiv.style.color='red';
                      }
                    
                    document.getElementById('articleResults').style.display = 'block';
                    //responseDiv.textContent = '';
                  } else {
                    responseDiv.removeChild(spinner);
                    responseDiv.textContent='متاسفانه برای استاد '+ selectedAuthor + 'جزوه ای یافت نشد!'; 
                    responseDiv.style.color='red';
                  }
                })
                .catch(error => {
                  responseDiv.textContent = 'خطا در نمایش جزوات، دوباره تلاش کنید!';
                  responseDiv.style.color='red';
                  console.error('Error:', error);
                });
            }
