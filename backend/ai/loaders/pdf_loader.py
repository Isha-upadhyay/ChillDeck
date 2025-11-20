import fitz  # PyMuPDF

class PDFLoader:
    def load(self, file_path):
        doc = fitz.open(file_path)
        text = ""

        for page in doc:
            cleaned = page.get_text().replace("\n", " ").strip()
            text += cleaned + " "

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
