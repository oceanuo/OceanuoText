document.addEventListener('DOMContentLoaded', () => {
    // Theme management
    const themeSelect = document.getElementById('themeSelect');
    
    function setTheme(theme) {
        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            document.body.setAttribute('data-theme', systemTheme);
        } else {
            document.body.setAttribute('data-theme', theme);
        }
    }

    themeSelect.addEventListener('change', (e) => {
        setTheme(e.target.value);
        localStorage.setItem('theme', e.target.value);
    });

    // Initialize theme
    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = savedTheme;
    setTheme(savedTheme);

    // Image to text functionality
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const fileDropZone = document.querySelector('.file-drop-zone');

    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.style.borderColor = 'var(--accent-color)';
    });

    fileDropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        fileDropZone.style.borderColor = 'var(--text-secondary)';
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.style.borderColor = 'var(--text-secondary)';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    function handleFiles(files) {
        imagePreview.innerHTML = '';
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.dataset.originalData = e.target.result; // Store original base64 data
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Updated API call function
    async function callAPI(endpoint, data, promptKey, imageDataArray = null) {
        try {
            const basePrompt = config.basePrompts[promptKey] || '';
            const messages = [{
                role: "user",
                content: []
            }];

            // Add text content if exists
            if (basePrompt || data) {
                messages[0].content.push({
                    type: "text",
                    text: basePrompt + data
                });
            }

            // Add all images if they exist
            if (imageDataArray && imageDataArray.length > 0) {
                imageDataArray.forEach(imageData => {
                    messages[0].content.push({
                        type: "image_url",
                        image_url: {
                            url: imageData
                        }
                    });
                });
            }

            const response = await fetch(`${config.apiHost}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: messages
                })
            });
            
            console.log('API Response status:', response.status);
            const responseData = await response.json();
            console.log('API Response data:', responseData);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${responseData.error?.message || 'Unknown error'}`);
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            alert(`Error: ${error.message}`);
            return null;
        }
    }

    // Modify event listeners to use promptKey instead of prompt
    document.querySelectorAll('.option-card').forEach(card => {
        const textarea = card.querySelector('textarea');
        const button = card.querySelector('.process-btn');
        const cardTitle = card.querySelector('h3').textContent.trim();
        const promptKey = cardTitle.toLowerCase().replace(/\s+/g, '');

        if (button && textarea) {
            button.addEventListener('click', async () => {
                if (!textarea.value.trim()) {
                    alert('Please enter some text first');
                    return;
                }

                button.disabled = true;
                button.textContent = 'Processing...';
                
                try {
                    const result = await callAPI('/v1/chat/completions', textarea.value, promptKey);
                    if (result?.choices?.[0]?.message?.content) {
                        textarea.value = result.choices[0].message.content;
                    } else {
                        throw new Error('Invalid API response format');
                    }
                } catch (error) {
                    console.error('Processing error:', error);
                    alert(`Error processing text: ${error.message}`);
                } finally {
                    button.disabled = false;
                    button.textContent = 'Process';
                }
            });
        }
    });

    // Modified image processing event listener
    const imageProcessBtn = document.querySelector('#imageToText .process-btn');
    if (imageProcessBtn) {
        imageProcessBtn.addEventListener('click', async () => {
            const images = document.querySelectorAll('#imagePreview img');
            if (images.length === 0) {
                alert('Please upload at least one image first');
                return;
            }

            // Remove any existing result textarea
            const existingTextarea = document.querySelector('#imageToText textarea');
            if (existingTextarea) {
                existingTextarea.remove();
            }

            imageProcessBtn.disabled = true;
            imageProcessBtn.textContent = 'Processing...';

            try {
                const imageDataArray = Array.from(images).map(img => img.dataset.originalData);
                
                const result = await callAPI(
                    '/v1/chat/completions',
                    'You are a text extraction expert. Extract text from the following image(s), maintaining layout and structure. Output extracted text directly without any additional text. Image data: ',
                    'imageToText',
                    imageDataArray
                );

                if (result?.choices?.[0]?.message?.content) {
                    const textarea = document.createElement('textarea');
                    textarea.value = result.choices[0].message.content;
                    document.querySelector('#imageToText').appendChild(textarea);
                } else {
                    throw new Error('Invalid API response format');
                }
            } catch (error) {
                console.error('Image processing error:', error);
                alert(`Error processing images: ${error.message}`);
            } finally {
                imageProcessBtn.disabled = false;
                imageProcessBtn.textContent = 'Process Images';
            }
        });
    }
});
