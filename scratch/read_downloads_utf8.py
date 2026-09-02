import os
import glob
import sys
import pypdf

downloads_dir = r"C:\Users\David\Downloads"
files = sorted(glob.glob(os.path.join(downloads_dir, "*")), key=os.path.getmtime, reverse=True)[:7]

output_file = r"C:\Users\David\gods-eye-view\scratch\extracted_downloads.txt"

with open(output_file, "w", encoding="utf-8") as out:
    out.write("================================================================================" + "\n")
    out.write("EXTRACTED TEXT FROM RECENT 7 DOWNLOADED FILES" + "\n")
    out.write("================================================================================" + "\n\n")

    for i, fpath in enumerate(files, 1):
        fname = os.path.basename(fpath)
        out.write(f"=== FILE {i}: {fname} ===\n")
        if fname.lower().endswith('.pdf'):
            try:
                reader = pypdf.PdfReader(fpath)
                out.write(f"Total Pages: {len(reader.pages)}\n\n")
                for page_idx, page in enumerate(reader.pages):
                    text = page.extract_text()
                    out.write(f"--- PAGE {page_idx+1} ---\n{text}\n\n")
            except Exception as e:
                out.write(f"Error reading PDF {fname}: {e}\n\n")
        elif fname.lower().endswith('.png'):
            out.write(f"Image File (PNG), Size: {os.path.getsize(fpath)} bytes\n\n")
        out.write("="*80 + "\n\n")

print(f"Successfully extracted all 7 downloaded files into {output_file}")
