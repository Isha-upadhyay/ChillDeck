import docx

class DOCXLoader:
    def load(self, file_path):
        doc = docx.Document(file_path)
        text = ""

        for p in doc.paragraphs:
            txt = p.text.strip()
            if txt:
                text += txt + " "

        text = text.strip()

        return {
            "raw_text": text,
            "chunks": self.chunk_text(text),
            "summary": self.create_summary(text),
            "topics": self.extract_topics(text)
        }

    def chunk_text(self, text, chunk_size=1200):
        return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    def create_summary(self, text):
        return text[:800] + "..."

    def extract_topics(self, text):
        words = text.split()[:40]
        return [w for w in words if w.istitle()]
