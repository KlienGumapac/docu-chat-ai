from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
import shutil
import uuid
import subprocess
import json

app = Flask(__name__)
CORS(app)

active_sessions = {}

@app.route('/upload', methods=['POST'])
def upload_document():
    """Simple document upload endpoint"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        allowed_extensions = {'.pdf', '.docx', '.doc', '.txt'}
        file_extension = os.path.splitext(file.filename)[1].lower()
        
        if file_extension not in allowed_extensions:
            return jsonify({'error': 'Unsupported file type'}), 400
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            file.save(temp_file.name)
            temp_path = temp_file.name
        
        document_content = ""
        if file_extension == '.txt':
            try:
                with open(temp_path, 'r', encoding='utf-8') as f:
                    document_content = f.read()
            except:
                document_content = f"Text document: {file.filename}"
        elif file_extension == '.pdf':
            try:
                import PyPDF2
                import re
                with open(temp_path, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page in pdf_reader.pages:
                        text = page.extract_text()
                        
                        text = re.sub(r'\x00', '', text)  
                        text = re.sub(r'\s+', ' ', text)  
                        document_content += text + "\n"
           
                document_content = document_content.strip()
            except Exception as e:
                document_content = f"PDF document: {file.filename} (Error reading: {str(e)})"
        elif file_extension in ['.docx', '.doc']:
         
            document_content = ""
            try:
                if file_extension == '.docx':
                 
                    import zipfile
                    import xml.etree.ElementTree as ET
                    
                    with zipfile.ZipFile(temp_path) as zip_file:
                        
                        if 'word/document.xml' in zip_file.namelist():
                            xml_content = zip_file.read('word/document.xml')
                    
                            root = ET.fromstring(xml_content)
                      
                            text_elements = root.findall('.//{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t')
                            document_content = ' '.join([elem.text for elem in text_elements if elem.text])
                            print(f"Successfully extracted text from .docx file using XML parsing")
                        else:
                            print(f"Could not find word/document.xml in .docx file")
                else:
                   
                    for encoding in ['utf-8', 'cp1252', 'latin-1']:
                        try:
                            with open(temp_path, 'r', encoding=encoding, errors='ignore') as f:
                                content = f.read()
                                if content.strip() and len(content) > 100:
                                    document_content = content
                                    print(f"Successfully read .doc file with {encoding} encoding")
                                    break
                        except:
                            continue
                
                if not document_content.strip():
                    document_content = f"Word document: {file.filename} (Content extraction failed - please try converting to PDF or text format)"
                    print(f"All Word extraction methods failed for {file.filename}")
                    
            except Exception as e:
                document_content = f"Word document: {file.filename} (Error: {str(e)})"
                print(f"Word file processing error: {str(e)}")
        else:
            document_content = f"Document: {file.filename} (Unsupported format)"
        
        print(f"=== DOCUMENT UPLOAD DEBUG ===")
        print(f"File: {file.filename}")
        print(f"File extension: {file_extension}")
        print(f"Content length: {len(document_content)} characters")
        print(f"Content preview (first 1000 chars):")
        print("=" * 50)
        print(document_content[:1000])
        print("=" * 50)
        
        if len(document_content.strip()) < 50:
            print("WARNING: Very little content extracted!")
            document_content = f"WARNING: Document content extraction failed for {file.filename}. Please try a different file format."
        
        ai_summary = document_content[:1000]  
        print(f"Using document content directly (no AI pre-processing)")
        print(f"=== END DEBUG ===")
        
        session_id = str(uuid.uuid4())
        active_sessions[session_id] = {
            "file_path": temp_path,
            "filename": file.filename,
            "content": document_content,
            "ai_summary": ai_summary,
            "processed": True
        }
        
        return jsonify({
            "session_id": session_id,
            "filename": file.filename,
            "message": "Document uploaded successfully"
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing document: {str(e)}'}), 500

@app.route('/chat', methods=['POST'])
def chat_with_document():
    """Smart chat endpoint using Ollama with conversational AI"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        session_id = data.get('session_id', '')
        
        if not session_id or session_id not in active_sessions:
            return jsonify({'error': 'Session not found'}), 404
        
        session_data = active_sessions[session_id]
        document_content = session_data.get("content", "")
        ai_summary = session_data.get("ai_summary", "")
        
        import re
        document_content = re.sub(r'\x00', '', document_content) 
        document_content = re.sub(r'\s+', ' ', document_content)  
        document_content = document_content.strip()  
        
        user_words = set(user_message.lower().split())
        doc_words = set(document_content.lower().split())
        common_words = user_words.intersection(doc_words)
        
        relevant_keywords = [
            'recommendation', 'recommend', 'suggest', 'propose', 'what', 'how', 'why', 'when', 'where', 'who',
            'find', 'findings', 'conclusion', 'summary', 'count', 'number', 'many', 'few', 'list', 'give',
            'show', 'tell', 'explain', 'describe', 'discuss', 'analyze', 'review', 'examine', 'study',
            'problem', 'issue', 'challenge', 'solution', 'answer', 'response', 'result', 'outcome',
            'example', 'instance', 'case', 'scenario', 'situation', 'context', 'background'
        ]
        
        is_recommendation_question = any(word in user_message.lower() for word in ['recommendation', 'recommend']) and 'recommendation' in user_message.lower()
        
        is_related = any(keyword in user_message.lower() for keyword in relevant_keywords) or len(common_words) > 2
        
        try:
          
            limited_content = document_content[:2500] + "..." if len(document_content) > 2500 else document_content
           
            if is_recommendation_question:
                prompt = f"""Document: {limited_content}

Question: {user_message}

Instructions: 
- Find and list ALL recommendations in the document
- Count them accurately and give the total number
- List each recommendation with proper numbering
- For "add more" requests, provide additional recommendations directly
- Use natural transitions like "Additional recommendations:" for extra items
- Avoid commentary phrases - just answer directly
- If document seems incomplete, mention that

Answer:"""
            else:
                prompt = f"""Document: {limited_content}

Question: {user_message}

Instructions: 
- Answer directly and conversationally based on the document content
- Count items accurately and give complete numbers
- List ALL relevant items with proper formatting
- For "add more" requests, provide additional suggestions directly
- Be comprehensive but concise
- Use natural transitions like "Additional recommendations:" for extra items
- Avoid commentary phrases - just answer directly

Answer:"""
            
            print(f"=== CHAT DEBUG ===")
            print(f"User question: {user_message}")
            print(f"Document content length: {len(document_content)}")
            print(f"Limited content length: {len(limited_content)}")
            print(f"Content being sent to AI:")
            print("=" * 50)
            print(limited_content[:800])
            print("=" * 50)
            print(f"Using simplified AI prompt")

            result = subprocess.run([
                "C:\\Users\\Admin\\AppData\\Local\\Programs\\Ollama\\ollama.exe",
                "run", "llama2",
                prompt
            ], capture_output=True, text=True, encoding='utf-8', errors='ignore', timeout=120)  
            
            if result.returncode == 0:
                response = result.stdout.strip()
                
                import re
                
                response = re.sub(r'^(Of course!|Here is|Based on|According to|The document states|The text shows|I found|Here\'s what|The answer is|The recommendations are|The meaning is).*?[:"]\s*', '', response, flags=re.IGNORECASE)
                
                response = re.sub(r'\s*(\(Chapter.*?\)|as mentioned in the document|from the document|in the document).*$', '', response, flags=re.IGNORECASE)
                
                response = re.sub(r'^["\'](.*)["\']$', r'\1', response.strip())
                
                if not response or len(response.strip()) < 10:
                    if is_related:
                        response = "I can see the document content, but I'm having trouble finding specific information about that. Could you please rephrase your question or ask about something else in the document?"
                    else:
                        response = "I'd be happy to help you with questions about the uploaded document! What would you like to know about it?"
                
                confidence = 0.9 if is_related else 0.4
            else:
                response = "I'm having trouble processing your request right now. Please try again in a moment."
                confidence = 0.0
                
        except subprocess.TimeoutExpired:
            response = "I'm taking a bit longer to think about your question. Please try asking it again or rephrase it slightly."
            confidence = 0.0
        except Exception as e:
            response = f"I encountered an error while processing your request. Please try again."
            confidence = 0.0
        
        return jsonify({
            "response": response,
            "is_related": is_related,
            "confidence": confidence
        })
        
    except Exception as e:
        return jsonify({'error': f'Error getting response: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "AI Document Chat Backend is running"})

if __name__ == '__main__':
    print("Starting AI Document Chat Backend...")
    print("Make sure Ollama is running: ollama serve")
    print("Backend will be available at: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True) 