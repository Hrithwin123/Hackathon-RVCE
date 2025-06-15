from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get the absolute path to the model file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'alexnet.pkl')

# Replace with your Gemini API key
GEMINI_API_KEY = "AIzaSyAUvXUEy1Uq7PJ7atxC4ipCcSrv8_EV-dM"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

# PlantVillage class labels (10 classes - matching the saved model)
PLANTVILLAGE_CLASSES = [
    'Apple_scab', 'Apple_black_rot', 'Apple_cedar_rust', 'Apple_healthy',
    'Corn_common_rust', 'Corn_gray_leaf_spot', 'Corn_northern_leaf_blight', 'Corn_healthy',
    'Potato_early_blight', 'Potato_late_blight'  # Removed Potato_healthy and Tomato classes
]

# Image preprocessing for AlexNet
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def create_alexnet_model(num_classes=10):  # Fixed to 10 classes to match saved model
    # Load pretrained AlexNet with updated weights parameter
    model = models.alexnet(weights=models.AlexNet_Weights.IMAGENET1K_V1)
    
    # Modify the classifier for our number of classes
    model.classifier[6] = nn.Linear(model.classifier[6].in_features, num_classes)
    
    return model

def load_alexnet_model(pkl_path=None):
    try:
        # Use the absolute path if no specific path is provided
        model_path = pkl_path or MODEL_PATH
        print(f"Loading model from: {model_path}")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at: {model_path}")
        
        # Create a new model instance with 10 classes
        model = create_alexnet_model(num_classes=10)  # Explicitly set to 10 classes
        
        # Load the checkpoint dictionary
        checkpoint = torch.load(model_path, map_location=torch.device('cpu'))
        print("Loaded checkpoint keys:", checkpoint.keys())
        
        # Extract the state dict from the checkpoint
        if isinstance(checkpoint, dict):
            if 'state_dict' in checkpoint:
                state_dict = checkpoint['state_dict']
                # Remove 'module.' prefix if it exists (from DataParallel/DDP)
                state_dict = {k.replace('module.', ''): v for k, v in state_dict.items()}
                print("State dict keys:", state_dict.keys())
                print("Model architecture:", checkpoint.get('arch', 'Unknown'))
                print("Training epoch:", checkpoint.get('epoch', 'Unknown'))
                model.load_state_dict(state_dict)
            else:
                # If it's a direct state dict
                model.load_state_dict(checkpoint)
        else:
            # If it's a full model
            model = checkpoint
            
        model.eval()
        print("Model loaded successfully!")
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Stack trace:", e.__traceback__)
        import traceback
        traceback.print_exc()
        return None

# Load model at startup
print(f"Current working directory: {os.getcwd()}")
print(f"Looking for model at: {MODEL_PATH}")
alexnet_model = load_alexnet_model()

def format_response(text):
    # Convert LaTeX-style formatting to HTML-like tags
    # Convert **text** to <strong>text</strong>
    text = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', text)
    # Convert *text* to <em>text</em>
    text = re.sub(r'\*(.*?)\*', r'<em>\1</em>', text)
    # Convert # Heading to <h3>Heading</h3>
    text = re.sub(r'^#\s+(.*?)$', r'<h3>\1</h3>', text, flags=re.MULTILINE)
    # Convert ## Subheading to <h4>Subheading</h4>
    text = re.sub(r'^##\s+(.*?)$', r'<h4>\1</h4>', text, flags=re.MULTILINE)
    # Convert bullet points to HTML list items
    text = re.sub(r'^\s*[-•]\s+(.*?)$', r'<li>\1</li>', text, flags=re.MULTILINE)
    # Wrap consecutive list items in <ul> tags
    text = re.sub(r'(<li>.*?</li>\n?)+', lambda m: f'<ul>{m.group(0)}</ul>', text)
    # Convert numbered lists
    text = re.sub(r'^\s*\d+\.\s+(.*?)$', r'<li>\1</li>', text, flags=re.MULTILINE)
    # Wrap consecutive numbered list items in <ol> tags
    text = re.sub(r'(<li>.*?</li>\n?)+', lambda m: f'<ol>{m.group(0)}</ol>', text)
    
    # Add line breaks for better readability
    text = text.replace('\n', '<br>')
    
    return text

def parse_remedy_text(text):
    if not text:
        return {'immediateActions': [], 'futurePrevention': []}

    # Split the text into sections
    parts = text.split('Future Prevention')
    if len(parts) != 2:
        return {'immediateActions': [], 'futurePrevention': []}

    actions_text, prevention_text = parts
    
    def process_section(section_text, is_actions=False):
        # Remove section header and clean up
        if is_actions:
            section_text = section_text.replace('Immediate Actions', '')
        
        # Remove any 'start' text and clean up
        section_text = re.sub(r'^start\s*', '', section_text, flags=re.IGNORECASE)
        section_text = section_text.strip()
        
        # Split into numbered items and process each item
        items = []
        for item in re.split(r'\d+\.\s+', section_text):
            item = item.strip()
            if not item or 'start' in item.lower():
                continue
                
            # Format the item with HTML tags
            formatted_item = format_response(item)
            if formatted_item:
                items.append(formatted_item)
        
        return items

    return {
        'immediateActions': process_section(actions_text, True),
        'futurePrevention': process_section(prevention_text)
    }

def create_prompt(user_input, context=None):
    base_prompt = "You are a plant disease expert assistant. Please provide responses in plain text format. Use **bold** for emphasis, *italics* for scientific terms, and # for headings. Use bullet points (- or •) for lists. Avoid using LaTeX or markdown formatting. "
    
    if context and context.get('disease'):
        base_prompt += f"The user's plant has been diagnosed with {context['disease']} "
        if context.get('severity'):
            base_prompt += f"with {context['severity']} severity. "
        
        if context.get('recommendations'):
            base_prompt += "\nRecommended actions:\n" + "\n".join(f"- {rec}" for rec in context['recommendations'])
        
        if context.get('prevention'):
            base_prompt += "\nPrevention measures:\n" + "\n".join(f"- {prev}" for prev in context['prevention'])
        
        base_prompt += "\n\nBased on this context, "
    
    base_prompt += f"Answer this user query concisely and professionally: {user_input}"
    return base_prompt

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_input = data.get('message')
    context = data.get('context', {})
    
    if not user_input:
        return jsonify({'error': 'No message provided'}), 400

    # Create a prompt that includes context if available
    prompt = create_prompt(user_input, context)

    # Prepare Gemini API request
    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024,
        }
    }


    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=data
        )
        response.raise_for_status()
        result = response.json()
        
        if 'candidates' in result and len(result['candidates']) > 0:
            reply = result['candidates'][0]['content']['parts'][0]['text']
            # Format the response
            formatted_reply = format_response(reply)
            return jsonify({'reply': formatted_reply})
        else:
            return jsonify({'error': 'No response from Gemini API'}), 500
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'API request failed: {str(e)}'}), 500
    except Exception as e:
        return jsonify({'error': f'Unexpected error: {str(e)}'}), 500

@app.route('/remedy', methods=['POST'])
def remedy():
    disease = request.json.get('disease')
    if not disease:
        return jsonify({'error': 'No disease provided'}), 400

    headers = {'Content-Type': 'application/json'}
    data = {
        "contents": [{
            "parts": [{
                "text": f"You are a plant disease expert. For the plant disease '{disease}', provide eco-friendly remedies in two sections: 1) Immediate Actions as a numbered list of steps to address the active infection, 2) Future Prevention as a numbered list of steps to avoid recurrence. Use the exact headers 'Immediate Actions' and 'Future Prevention' and keep each section concise."
            }]
        }]
    }

    try:
        response = requests.post(f"{GEMINI_API_URL}?key={GEMINI_API_KEY}", headers=headers, json=data)
        response.raise_for_status()
        result = response.json()
        remedy_text = result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse and format the remedy text
        parsed_remedy = parse_remedy_text(remedy_text)
        return jsonify(parsed_remedy)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image_file = request.files['image']
    try:
        # Process image with AlexNet model
        image = Image.open(image_file).convert('RGB')
        image_tensor = transform(image).unsqueeze(0)  # Add batch dimension

        if alexnet_model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        with torch.no_grad():
            outputs = alexnet_model(image_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, max_index = probabilities[0].max(0)
            predicted_class = PLANTVILLAGE_CLASSES[max_index.item()]
            confidence = confidence.item()

        # Format the disease name for display
        disease_name = predicted_class.replace('_', ' ').title()
        
        # Get remedies for the predicted disease
        headers = {'Content-Type': 'application/json'}
        remedy_data = {
            "contents": [{
                "parts": [{
                    "text": f"You are a plant disease expert. For the plant disease '{disease_name}', provide eco-friendly remedies in two sections: 1) Immediate Actions as a numbered list of steps to address the active infection, 2) Future Prevention as a numbered list of steps to avoid recurrence. Use the exact headers 'Immediate Actions' and 'Future Prevention' and keep each section concise."
                }]
            }]
        }

        remedy_response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=remedy_data
        )
        remedy_response.raise_for_status()
        remedy_result = remedy_response.json()
        remedy_text = remedy_result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse and format the remedy text
        parsed_remedy = parse_remedy_text(remedy_text)

        return jsonify({
            'disease': disease_name,
            'confidence': float(confidence * 100),  # Convert to percentage
            'immediateActions': parsed_remedy['immediateActions'],
            'futurePrevention': parsed_remedy['futurePrevention']
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)