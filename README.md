# AI Document Chat

A free, local AI-powered document chat application that allows you to upload documents (PDF, Word, text) and ask questions about their content. Built with React, Flask, and Ollama.

## Features

- 📄 **Document Upload**: Support for PDF, Word documents, and text files
- 🤖 **AI Chat**: Powered by Ollama with local LLM models (no API costs!)
- 🎯 **Smart Relevance**: Automatically detects if questions are related to the uploaded document
- 💬 **Real-time Chat**: Modern chat interface similar to ChatGPT
- 🔒 **Privacy**: All processing happens locally - your documents never leave your computer
- 🚀 **No Database**: Lightweight in-memory storage for sessions
- ⚡ **Fast Processing**: Optimized for quick responses with local AI

## Prerequisites

Before running this application, you need to install:

### 1. Python 3.8+

- Download from [python.org](https://python.org)
- Make sure Python is added to your PATH

### 2. Node.js 16+

- Download from [nodejs.org](https://nodejs.org)
- Make sure npm is available

### 3. Ollama

- Download from [ollama.ai](https://ollama.ai)
- Install and start Ollama service
- Pull a model: `ollama pull llama2`

## Quick Setup

### Option 1: Automated Setup (Windows)

1. Clone the repository
2. Run `setup.bat` to install all dependencies
3. Run `start_simple.bat` to start both backend and frontend

### Option 2: Manual Setup

#### 1. Clone the repository

```bash
git clone https://github.com/KlienGumapac/docu-chat-ai.git
cd docu-chat-ai
```

#### 2. Install Python Dependencies

```bash
pip install flask flask-cors PyPDF2 python-docx
```

#### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

## Running the Application

### 1. Start Ollama

Make sure Ollama is running and you have a model installed:

```bash
# Start Ollama service (Windows)
C:\Users\[YourUsername]\AppData\Local\Programs\Ollama\ollama.exe serve

# Or if Ollama is in PATH:
ollama serve

# In another terminal, pull a model (if not already done)
ollama pull llama2
```

### 2. Start Backend

```bash
python simple_backend.py
```

The backend will start on `http://localhost:5000`

### 3. Start Frontend

```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Usage

1. **Upload a Document**: Click "Choose File" and select a PDF, Word document, or text file
2. **Wait for Processing**: The document will be processed and extracted
3. **Start Chatting**: Ask questions about the document content
4. **Get Smart Responses**: The AI will answer based on the document content and indicate if your question is related

## Supported File Types

- **PDF** (.pdf) - Text extraction with PyPDF2
- **Word Documents** (.docx, .doc) - XML parsing for .docx, text reading for .doc
- **Text Files** (.txt) - Direct text reading

## Project Structure

```
docu-chat-ai/
├── simple_backend.py        # Flask backend application
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   ├── index.tsx        # React entry point
│   │   └── index.css        # Styles
│   ├── public/
│   └── package.json
├── start_simple.bat         # Windows startup script
├── setup.bat               # Windows setup script
└── README.md
```

## How It Works

1. **Document Processing**: Documents are parsed using appropriate libraries (PyPDF2 for PDFs, XML parsing for .docx)
2. **Text Extraction**: Clean text is extracted and stored in memory
3. **Relevance Check**: User questions are analyzed for relevance to the document
4. **AI Response**: Ollama generates responses using the document context
5. **Response Cleaning**: AI commentary is automatically removed for clean output

## Configuration

### Changing AI Model

To use a different Ollama model, edit `simple_backend.py`:

```python
result = subprocess.run([
    "C:\\Users\\Admin\\AppData\\Local\\Programs\\Ollama\\ollama.exe",
    "run", "llama2",  # Change this to your preferred model
    prompt
], ...)
```

### Available Models

- `llama2` - Good general purpose model
- `mistral` - Fast and efficient
- `codellama` - Good for technical documents
- `llama2:7b` - Smaller, faster version

## Troubleshooting

### Common Issues

1. **Ollama not running**

   - Make sure Ollama is installed and running
   - On Windows, use the full path: `C:\Users\[Username]\AppData\Local\Programs\Ollama\ollama.exe serve`
   - Check if model is installed: `ollama list`

2. **Model not found**

   - Pull the model: `ollama pull llama2`
   - Check available models: `ollama list`

3. **Port conflicts**

   - Backend runs on port 5000
   - Frontend runs on port 3000
   - Change ports in the respective configuration files if needed

4. **Document not reading properly**

   - For Word documents, ensure they are in .docx format for best results
   - For PDFs, ensure they contain extractable text (not scanned images)

5. **AI responses taking too long**
   - The system has a 45-second timeout
   - Try asking simpler questions
   - Consider using a smaller model

### Performance Tips

- Use smaller models for faster responses
- Limit document size for better performance
- Close other applications to free up memory
- Ensure Ollama has enough RAM allocated

## Development

### Adding New Features

- Backend: Modify `simple_backend.py`
- Frontend: Modify files in `frontend/src/`
- Styles: Modify `frontend/src/index.css`

### Testing

- Backend health check: `http://localhost:5000/health`
- Frontend: `http://localhost:3000`

## Contributing

Feel free to contribute to this project by:

- Reporting bugs
- Suggesting new features
- Submitting pull requests

## Author

**Klien Gumapac**

- GitHub: [@KlienGumapac](https://github.com/KlienGumapac)
- Repository: [docu-chat-ai](https://github.com/KlienGumapac/docu-chat-ai.git)

## License

This project is licensed under the MIT License - see below for details.

---

## MIT License

Copyright (c) 2024 Klien Gumapac

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- [Ollama](https://ollama.ai) for providing local LLM capabilities
- [Flask](https://flask.palletsprojects.com) for the backend framework
- [React](https://reactjs.org) for the frontend framework
- [PyPDF2](https://pypdf2.readthedocs.io) for PDF processing
- [python-docx](https://python-docx.readthedocs.io) for Word document processing
