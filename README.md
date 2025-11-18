# 🚀 ChillDek (AI-Powered Auto Slide Generator )

An **end-to-end agentic AI system** that automatically creates beautiful, research-backed presentations from **any topic** or **uploaded document**.  
Built with **Next.js**, **FastAPI**, **LangChain**, **LangGraph**, **OpenAI**, and modern slide rendering engines.

---

## ✨ Key Highlights

- 🔍 **Topic → Complete Presentation**
- 📄 **Document Upload → Auto Slides**
- 🧠 **Multi-Agent AI Pipeline**
- 🎨 **Multiple Themes (Corporate, Dark, Tech, Cute)**
- 🖼️ **AI Image Generation**
- ⚡ **Real-Time Slide Preview**
- 📤 **Exports: PPTX, PDF, Images, Markdown, Notion**
- 📝 **Speaker Notes Support**
- 🧹 **Auto Grammar Fix + Quality Enhancement**

---

## 📚 Table of Contents

- [Overview](#-overview)  
- [Core Features](#-core-features)  
- [Tech Stack](#-tech-stack)  
- [System Architecture](#-system-architecture)  
- [Agentic Pipeline](#-agentic-pipeline)  
- [API Endpoints](#-api-endpoints)  
- [Frontend Structure](#-frontend-structure)  
- [How to Run Locally](#-how-to-run-locally)  
- [Future Enhancements](#-future-enhancements)  
- [Screenshots](#-screenshots-optional)  
- [Resume Description](#-resume-description)

---

## 🧭 Overview

**AI-Powered Auto Slide Generator** is a next-gen productivity tool inspired by **Gamma**, **Kimi**, and **Notion AI**.

It transforms:
- a **topic**,  
- a **PDF/DOCX/TXT**,  
- or a **research query**  

into a **beautiful, themed, fully exportable presentation** with:
- structured slide layout  
- facts & statistics  
- AI-generated images  
- speaker notes  

All automated through an **agent-based AI pipeline**.

---

## ⭐ Core Features

### 🎯 Topic-to-Slides
Enter any topic → get a complete presentation.

### 📁 Document-to-Slides
Upload a file → system extracts → summarizes → converts to slides.

### 🧠 Multi-Agent AI Workflow
Each agent specializes in:
- Planning  
- Research  
- Writing  
- Quality Improvement  
- Designing  
- Image Suggestion/Generation  

### 🎨 Custom Themes
- Modern  
- Corporate  
- Minimal  
- Tech  
- Dark  
- Cute  

### 📤 Export Options
- PPTX  
- PDF  
- PNG / JPG  
- Markdown  
- Notion page export  

### 🔥 Smart Editing Tools
- Extend slide  
- Shorten slide  
- Regenerate content  
- Auto-format  
- Add speaker notes  

---

## 🏗️ Tech Stack

### **Frontend**
- Next.js 14  
- TypeScript  
- Tailwind CSS  
- ShadCN UI  
- Zustand / Redux  
- React-PPT or HTML-to-PPT  

### **Backend**
- FastAPI (Python)  
- LangChain + LangGraph  
- PyPDF / python-docx  
- OpenAI / Gemini / Llama  
- Tavily / SerpAPI Search APIs  

### **Storage**
- Firebase / Supabase / S3  
- ChromaDB / Pinecone (for RAG)


---

## 🤖 Agentic Pipeline

### 1️⃣ Planning Agent  
Creates complete slide outline + structure.

### 2️⃣ Research Agent  
Uses search APIs → extracts stats, facts, recent data.

### 3️⃣ Content Writer Agent  
Generates bullet points, headings, and examples.

### 4️⃣ Quality Checker Agent  
Improves:
- grammar  
- clarity  
- repetition  
- formatting  

### 5️⃣ Slide Designer Agent  
Adds:
- layout instructions  
- icons/emojis  
- image suggestions  

### 6️⃣ Image Generation Agent  
Creates cover images, illustrations, diagrams.

---

## 🔌 API Endpoints

### **POST** `/generate`
Generate slides from a topic.

```json
{
  "topic": "Impact of AI on Education",
  "theme": "corporate",
  "detail": "medium"
}



