# 🚀 ChillDeck — AI-Powered Automatic Slide Generator  
### *Generate stunning, research-backed presentations from any topic or document using Multi-Agent AI.*

<div align="center">

✨ Powered by **Next.js + FastAPI + LangChain + LangGraph + ChromaDB + Generative AI**  
📊 Creates smart, beautiful presentations like **Gamma**, **Notion AI**, **Kimi** — but fully customizable & open-source  

</div>

---

# 🌟 Overview

**ChillDeck** is an advanced **AI slide generator** that transforms:
- a **topic**,  
- an **uploaded document (PDF/DOCX/TXT)**, or  
- a **research query**  

into a complete, themed, editable presentation with:
- structured slides  
- researched facts  
- AI-generated images  
- speaker notes  
- professional themes  
- export options (PDF, PPTX, PNG, Markdown, Notion)

All powered by an intelligent **multi-agent LLM pipeline**.

---

# 🚀 Features at a Glance

### 🧠 Multi-Agent AI Workflow  
Planner → Researcher → Writer → Improver → Designer → Image Agent

### 🎯 Input Options  
- Enter a topic  
- Upload a document  
- Provide detailed research query  

### 🎨 Smart Slide Generation  
- Auto headings  
- Concise points  
- Layout instructions  
- Icons & design cues  
- Optional illustrations

### 🎨 Themes  
Corporate • Minimal • Cute • Tech • Modern • Dark

### 🖼️ AI Image Generation  
HuggingFace inference models for cover images & illustrations.

### ⚡ Real-Time Editing  
- Slide preview  
- Modify bullets  
- Regenerate content  
- Grammar fix  
- Extend/shorten slide

### 📤 Export Options  
- PDF  
- PPTX  
- PNG/JPG  
- Markdown  
- Notion page

---

# 🧩 Tech Stack

### **Frontend**
- Next.js 14  
- TypeScript  
- TailwindCSS  
- ShadCN UI  
- Zustand / Redux  

### **Backend**
- FastAPI  
- LangChain  
- LangGraph  
- Groq / OpenAI / Gemini  
- ChromaDB (RAG pipeline)
- Tavily / SerpAPI (web research)

### **Storage**
- Firebase / Supabase / AWS S3  
- Vector storage via ChromaDB

---

# 🧠 System Architecture
                   ┌────────────────────┐
                   │     Next.js UI     │
                   └──────────┬─────────┘
                              │
                  User Input (topic/file)
                              │
                 ┌────────────▼────────────┐
                 │       FastAPI API        │
                 └────────────┬────────────┘
                              │
                 LangChain + LangGraph Engine
                              │
    ┌───────────────Agent Pipeline────────────────┐
    │        Planning Agent                        │
    │        Research Agent (Tavily/SerpAPI)       │
    │        Writer Agent (Slides)                 │
    │        Quality Agent (Grammar/Clarity)       │
    │        Designer Agent (Layout/Emojis)        │
    │        Image Agent (HuggingFace)             │
    └───────────────────────────┬──────────────────┘
                                │
                      Generated Slide Data
                                │
                 ┌──────────────▼──────────────┐
                 │      Next.js Editor UI       │
                 └──────────────┬──────────────┘
                                │
                       Export Engine (PDF/PPTX)

                       
---

# ⚡ Quick Start

### **Prerequisites**
- Python 3.11+
- Node.js 18+
- Groq / OpenAI API Key

---

## 🔧 Backend Setup (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
# OR: venv\Scripts\activate  # Windows
```
```bash
pip install -r requirements.txt
```

# Add GROQ_API_KEY or OPENAI_API_KEY in .env
```bash
uvicorn main:app --reload
```
```bash
cd frontend
npm install
```

# Set backend endpoint
```bash
echo "NEXT_PUBLIC_API_BASE=http://localhost:8000" > .env.local
npm run dev
```
✔ Run the App

Visit:
👉 http://localhost:3000

Enter a topic → Select theme → Generate slides!
🤖 Agentic Pipeline (How It Works)
1️⃣ Planning Agent

Creates slide outline + logical structure.

2️⃣ Research Agent
Uses Tavily/SerpAPI → extracts current data, stats, quotes.

3️⃣ Content Writer Agent
Writes bullet points, headings, examples.

4️⃣ Quality Agent
Enhances grammar, readability, emphasis.

5️⃣ Slide Designer Agent
Adds emojis, layout hints, visual instructions.

6️⃣ Image Agent
Generates slide-cover or illustration images using HF models.

🔌 API Endpoints
POST /generate

Generate slides from topic.
{
  "topic": "Impact of AI on Education",
  "theme": "corporate",
  "detail": "medium"
}

POST /generate-from-file

Upload a document → Create slides automatically.

📁 Frontend Folder Structure
frontend/
│-- app/
│-- components/
│-- slides/
│-- store/
│-- utils/
└-- export/

🖼 Screenshots (Add Later)
/screenshots/home.png
/screenshots/editor.png
/screenshots/theme.png
/screenshots/export.png

🔮 Future Enhancements

🎤 AI Voiceover for presentations
🔗 Real-time collaboration mode
🧩 Plugin marketplace (templates, charts, animations)
📊 Auto chart/graph generation from CSV
⏳ Offline RAG + local models

