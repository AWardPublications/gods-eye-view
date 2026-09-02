import re

with open(r"C:\Users\David\gods-eye-view\scratch\extracted_downloads.txt", "r", encoding="utf-8") as f:
    text = f.read()

# Clean up broken newlines inside words/sentences: replace newline between lowercase letters/words with space
cleaned = re.sub(r'([^\n])\n([^\n])', r'\1 \2', text)
# Re-clean multiple spaces
cleaned = re.sub(r'[ \t]+', ' ', cleaned)
# Re-clean multiple newlines
cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

with open(r"C:\Users\David\gods-eye-view\scratch\extracted_downloads_clean.txt", "w", encoding="utf-8") as f:
    f.write(cleaned)

print("Cleaned text saved to scratch/extracted_downloads_clean.txt")
