class TXTLoader:
    def load(self, file_path):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read().replace("\n", " ")

        text = text.strip()

        return {
            "raw_text": text,
            "chunks": self.chunk_text(text),
            "summary": self.create_summary(text),
            "topics": self.extract_topics(text)
        }

    def chunk_text(self, text, size=1200):
        return [text[i:i+size] for i in range(0, len(text), size)]

    def create_summary(self, text):
        return text[:800] + "..."

    def extract_topics(self, text):
        words = text.split()[:30]
        return [w for w in words if w.istitle()]
