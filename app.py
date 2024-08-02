from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import requests
import json
import time

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/test_openai_chat', methods=['POST'])
def test_openai_chat():
    data = request.json
    endpoint = data.get('endpoint')
    api_key = data.get('api_key')
    sample_text = data.get('sample_text')
    model_name = data.get('model_name', 'gpt-35-turbo') 

    headers = {
        'Content-Type': 'application/json',
        'api-key': api_key
    }

    body = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": sample_text}
        ],
        "max_tokens": 100
    }

    try:
        start_time = time.time()
        response = requests.post(f"{endpoint}/openai/deployments/{model_name}/chat/completions?api-version=2023-05-15", 
                                 headers=headers, json=body)
        end_time = time.time()

        if response.status_code == 200:
            result = response.json()
            return jsonify({
                'success': True,
                'response': result['choices'][0]['message']['content'],
                'response_time': f"{(end_time - start_time):.2f} seconds"
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Error: {response.status_code} - {response.text}"
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/test_openai_embedding', methods=['POST'])
def test_openai_embedding():
    data = request.json
    endpoint = data.get('endpoint')
    api_key = data.get('api_key')
    sample_text = data.get('sample_text')
    model_name = data.get('model_name', 'text-embedding-ada-002') 

    headers = {
        'Content-Type': 'application/json',
        'api-key': api_key
    }

    body = {
        "input": sample_text,
        "model": model_name
    }

    try:
        start_time = time.time()
        response = requests.post(f"{endpoint}/openai/deployments/{model_name}/embeddings?api-version=2023-05-15", 
                                 headers=headers, json=body)
        end_time = time.time()

        if response.status_code == 200:
            result = response.json()
            embedding = result['data'][0]['embedding']
            truncated_embedding = embedding[:20] + ['...']
            return jsonify({
                'success': True,
                'embedding': truncated_embedding,
                'response_time': f"{(end_time - start_time):.2f} seconds"
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Error: {response.status_code} - {response.text}"
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/test_ai_search', methods=['POST'])
def test_ai_search():
    data = request.json
    search_endpoint = data.get('search_endpoint')
    api_key = data.get('api_key')
    index_name = data.get('index_name')
    content_column = data.get('content_column')
    search_query = data.get('search_query')

    headers = {
        'Content-Type': 'application/json',
        'api-key': api_key
    }

    body = {
        'search': search_query,
        'select': content_column,
        'top': 1
    }

    try:
        start_time = time.time()
        response = requests.post(f"{search_endpoint}/indexes/{index_name}/docs/search?api-version=2021-04-30-Preview", 
                                 headers=headers, json=body)
        end_time = time.time()

        if response.status_code == 200:
            result = response.json()
            if result['value']:
                search_result = result['value'][0][content_column]
            else:
                search_result = "No results found, but the search was successful."
            return jsonify({
                'success': True,
                'search_result': search_result,
                'response_time': f"{(end_time - start_time):.2f} seconds"
            })
        else:
            return jsonify({
                'success': False,
                'error': f"Error: {response.status_code} - {response.text}"
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)