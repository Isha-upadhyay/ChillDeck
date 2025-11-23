import pdfplumber

class PDFLoader:
    def load(self, file_path):
        text = ""
        
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + " "
        except Exception as e:
            raise Exception(f"Failed to load PDF: {e}")

        text = text.strip()

        return {
            "raw_text": text,
            "chunks": self.chunk_text(text),
            "summary": self.create_summary(text),
            "topics": self.extract_topics(text)
        }

    def chunk_text(self, text, chunk_size=1200):
        words = text.split()
        chunks = []

        for i in range(0, len(words), chunk_size):
            chunk = " ".join(words[i:i+chunk_size])
            chunks.append(chunk)

        return chunks

    def create_summary(self, text):
        return text[:800] + "..."

    def extract_topics(self, text):
        # naive topic extraction
        words = text.split()[:50]
        return list(set([w for w in words if w.istitle() and len(w) > 4]))
