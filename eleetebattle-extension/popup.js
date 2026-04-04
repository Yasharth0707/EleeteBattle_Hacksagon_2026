document.getElementById('syncBtn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = 'Fetching cookies...';
    statusDiv.className = '';

    try {
        // Fetch cookies from LeetCode
        chrome.cookies.get({ url: 'https://leetcode.com', name: 'LEETCODE_SESSION' }, (sessionCookie) => {
            chrome.cookies.get({ url: 'https://leetcode.com', name: 'csrftoken' }, (csrfCookie) => {
                
                if (!sessionCookie || !csrfCookie) {
                    statusDiv.textContent = '❌ Missing cookies! Please log into LeetCode.com first.';
                    return;
                }

                const lcSession = sessionCookie.value;
                const lcCsrf = csrfCookie.value;

                // Inject into the active tab
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    const activeTab = tabs[0];
                    if (!activeTab) {
                        statusDiv.textContent = '❌ Unable to access active tab.';
                        return;
                    }

                    chrome.scripting.executeScript({
                        target: { tabId: activeTab.id },
                        func: (session, csrf) => {
                            localStorage.setItem('lc_session', session);
                            localStorage.setItem('lc_csrf', csrf);
                            
                            // Visual feedback on the webpage
                            const banner = document.createElement('div');
                            banner.style.position = 'fixed';
                            banner.style.top = '20px';
                            banner.style.left = '50%';
                            banner.style.transform = 'translateX(-50%)';
                            banner.style.background = '#00ffcc';
                            banner.style.color = '#000';
                            banner.style.padding = '10px 20px';
                            banner.style.borderRadius = '5px';
                            banner.style.fontWeight = 'bold';
                            banner.style.zIndex = '999999';
                            banner.innerText = '✅ LeetCode Cookies Synced!';
                            document.body.appendChild(banner);
                            
                            setTimeout(() => {
                                banner.remove();
                                // We won't force reload, because submitCode reads localStorage dynamically!
                                // This prevents users from losing their code if they sync mid-battle.
                            }, 2000);
                        },
                        args: [lcSession, lcCsrf]
                    }).then(() => {
                        statusDiv.textContent = '✅ Synced Successfully!';
                        statusDiv.className = 'success';
                    }).catch(err => {
                        statusDiv.textContent = '❌ Failed to inject: ' + err.message;
                    });
                });
            });
        });

    } catch (err) {
        statusDiv.textContent = '❌ Error: ' + err.message;
    }
});
