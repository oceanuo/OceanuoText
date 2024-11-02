const config = {
    get apiHost() {
        return localStorage.getItem('apiHost');
    },
    
    get apiKey() {
        return localStorage.getItem('apiKey');
    },
    
    // Base prompts that will be combined with user input
    basePrompts: {
        imageToText: "You are an expert in text extraction. Please extract the text from the following image(s), ensuring to maintain the original layout and structure. Feel free to reformat the content as necessary, without regard for the order of the images. Output the extracted text directly without any additional commentary or formatting.",
        proofread: "You are a professional proofreader. Review and correct the following text for grammar, spelling, and clarity. Output corrected text directly without any additional text: ",
        rewrite: "You are a content rewriter. Rewrite the following text while preserving its core meaning. Output rewritten text directly without any additional text: ",
        friendly: "You are a tone adjustment expert. Make the following text more warm and friendly while keeping the main message. Output friendly text directly without any additional text: ",
        professional: "You are a business writing expert. Convert the following text into professional business language. Output professional text directly without any additional text: ",
        concise: "You are a conciseness expert. Make this text more concise while keeping all important information. Output concise text directly without any additional text: ",
        summary: "You are a summarization expert. Create a comprehensive summary of the following text. Output summary directly without any additional text: ",
        keyPoints: "You are a key points expert. Extract and list the main points from the following text. Output key points directly without any additional text: ",
        list: "You are a list formatting expert. Convert this text into a well-organized list format. Output list directly without any additional text: ",
        table: "You are a data organization expert. Convert this information into a clear table format. Output table directly without any additional text: "
    }
};

// Add config UI handling
document.addEventListener('DOMContentLoaded', () => {
    const configBtn = document.getElementById('configBtn');
    const configModal = document.getElementById('configModal');
    const closeConfig = document.getElementById('closeConfig');
    const saveConfig = document.getElementById('saveConfig');
    const apiHostInput = document.getElementById('apiHost');
    const apiKeyInput = document.getElementById('apiKey');

    // Load saved values
    apiHostInput.value = config.apiHost;
    apiKeyInput.value = config.apiKey;

    configBtn.addEventListener('click', () => {
        configModal.classList.add('active');
    });

    closeConfig.addEventListener('click', () => {
        configModal.classList.remove('active');
    });

    saveConfig.addEventListener('click', () => {
        localStorage.setItem('apiHost', apiHostInput.value.trim());
        localStorage.setItem('apiKey', apiKeyInput.value.trim());
        configModal.classList.remove('active');
    });

    // Close modal when clicking outside
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            configModal.classList.remove('active');
        }
    });
});
