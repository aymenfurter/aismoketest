let currentStep = 1;
const totalSteps = 3;

function nextStep() {
    if (currentStep < totalSteps) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateFields();
    }
}

function previousStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
    }
}

function updateFields() {
    const testType = document.getElementById('testType').value;
    document.getElementById('openaiChatFields').classList.add('hidden');
    document.getElementById('openaiEmbeddingFields').classList.add('hidden');
    document.getElementById('aiSearchFields').classList.add('hidden');

    if (testType === 'openai-chat') {
        document.getElementById('openaiChatFields').classList.remove('hidden');
    } else if (testType === 'openai-embedding') {
        document.getElementById('openaiEmbeddingFields').classList.remove('hidden');
    } else if (testType === 'ai-search') {
        document.getElementById('aiSearchFields').classList.remove('hidden');
    }
}

function showLoader() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    document.getElementById('results').innerHTML = '';
    document.getElementById('results').appendChild(loader);
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

async function runTest() {
    const testType = document.getElementById('testType').value;
    let endpoint, apiKey, sampleText, modelName;

    showLoader();

    try {
        if (testType === 'openai-chat') {
            endpoint = document.getElementById('chatEndpoint').value;
            apiKey = document.getElementById('chatApiKey').value;
            modelName = document.getElementById('chatModelName').value;
            sampleText = document.getElementById('chatSampleText').value === 'custom' 
                ? document.getElementById('chatCustomText').value 
                : document.getElementById('chatSampleText').value;

            const response = await fetch('/test_openai_chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint, api_key: apiKey, sample_text: sampleText, model_name: modelName })
            });
            const result = await response.json();
            displayResults(result);
        } else if (testType === 'openai-embedding') {
            endpoint = document.getElementById('embeddingEndpoint').value;
            apiKey = document.getElementById('embeddingApiKey').value;
            modelName = document.getElementById('embeddingModelName').value;
            sampleText = document.getElementById('embeddingSampleText').value === 'custom' 
                ? document.getElementById('embeddingCustomText').value 
                : document.getElementById('embeddingSampleText').value;

            const response = await fetch('/test_openai_embedding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint, api_key: apiKey, sample_text: sampleText, model_name: modelName })
            });
            const result = await response.json();
            displayResults(result);
        } else if (testType === 'ai-search') {
            const searchEndpoint = document.getElementById('searchEndpoint').value;
            const searchApiKey = document.getElementById('searchApiKey').value;
            const searchIndex = document.getElementById('searchIndex').value;
            const searchContentColumn = document.getElementById('searchContentColumn').value;
            const searchQuery = document.getElementById('searchQuery').value;

            const response = await fetch('/test_ai_search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    search_endpoint: searchEndpoint, 
                    api_key: searchApiKey, 
                    index_name: searchIndex, 
                    content_column: searchContentColumn, 
                    search_query: searchQuery 
                })
            });
            const result = await response.json();
            displayResults(result);
        }
    } catch (error) {
        console.error('Error:', error);
        displayResults({ success: false, error: 'An unexpected error occurred. Please check the console for more details.' });
    }

    nextStep();
}

function displayResults(result) {
    hideLoader();
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (result.success) {
        resultsDiv.innerHTML += `<p class="success">Test successful!</p>`;
        resultsDiv.innerHTML += `<p>Response time: ${result.response_time}</p>`;
        
        if (result.response) {
            resultsDiv.innerHTML += `<p>Response: ${result.response}</p>`;
        }
        if (result.embedding) {
            resultsDiv.innerHTML += `<p>Embedding (first 20 values): ${result.embedding.join(', ')}</p>`;
        }
        if (result.search_result) {
            resultsDiv.innerHTML += `<p>Search result: ${result.search_result}</p>`;
        }
    } else {
        resultsDiv.innerHTML += `<p class="error">Test failed: ${result.error}</p>`;
    }
}

function resetWizard() {
    currentStep = 1;
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById('step1').classList.add('active');
    document.getElementById('testType').value = '';
    document.getElementById('results').innerHTML = '';
    
    document.querySelectorAll('input, select, textarea').forEach(input => {
        input.value = '';
    });
}

document.getElementById('chatSampleText').addEventListener('change', function() {
    document.getElementById('chatCustomText').classList.toggle('hidden', this.value !== 'custom');
});

document.getElementById('embeddingSampleText').addEventListener('change', function() {
    document.getElementById('embeddingCustomText').classList.toggle('hidden', this.value !== 'custom');
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('step1').classList.add('active');
});