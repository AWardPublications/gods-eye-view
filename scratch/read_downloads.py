import os
import glob
import pypdf

downloads_dir = r"C:\Users\David\Downloads"
files = sorted(glob.glob(os.path.join(downloads_dir, "*")), key=os.path.getmtime, reverse=True)[:7]

print("================================================================================")
print("READING RECENT 7 DOWNLOADED FILES")
print("================================================================================\n")

for i, fpath in enumerate(files, 1):
    fname = os.path.basename(fpath)
    print(f"--- FILE {i}: {fname} ---")
    if fname.lower().endswith('.pdf'):
        try:
            reader = pypdf.PdfReader(fpath)
            print(f"Total Pages: {len(reader.pages)}")
            full_text = []
            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text()
                full_text.append(f"--- PAGE {page_idx+1} ---\n{text}")
            print("\n".join(full_text[:5])) # Print first 5 pages
            if len(full_text) > 5:
                print(f"\n[... {len(full_text) - 5} more pages truncated ...]")
        except Exception as e:
            print(f"Error reading PDF {fname}: {e}")
    elif fname.lower().endswith('.png'):
        print(f"Image File (PNG), Size: {os.path.getsize(fpath)} bytes")
    print("\n" + "="*80 + "\n")
