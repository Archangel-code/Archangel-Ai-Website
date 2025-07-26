
import os
import json

# Absoluter Pfad zur Images-Ordnerstruktur
base_path = r'/mnt/data/Gallery_Extracted/Gallery/Images'
output_data = []

# Durchlaufe alle Unterordner rekursiv
for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            relative_path = os.path.relpath(os.path.join(root, file), os.path.dirname(base_path))
            relative_path = relative_path.replace('\\', '/')
            tag = os.path.relpath(root, base_path).split(os.sep)[0]  # z. B. "Star Wars"
            name = os.path.splitext(file)[0].replace('_', ' ').title()
            output_data.append({
                "src": relative_path,
                "tag": tag,
                "name": name
            })

# JSON speichern
with open(r"/mnt/data/Gallery_Extracted/Gallery/gallery.json", "w", encoding="utf-8") as f:
    json.dump(output_data, f, indent=2)

print("gallery.json erfolgreich erstellt!")
