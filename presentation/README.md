# Teknisk presentation — ROAD2AIR (för Saab)

5-slides teknisk översikt (svenska, Saab-palett) som svarar på Saabs fråga om
plattform, arkitektur och verktyg.

## Filer
- `ROAD2AIR_teknisk_losning.pptx` — **presentationen att skicka.**
- `generate_deck.py` — genererar `.pptx` (redigerbara textrutor).
- `assets/gripen_gold.png` — Gripen-silhuetten omfärgad till Saab-guld (autogenereras).

## Regenerera
```sh
python3 -m venv presentation/.venv
presentation/.venv/bin/pip install python-pptx
presentation/.venv/bin/python presentation/generate_deck.py
```

## Exportera till PDF (kräver LibreOffice)
```sh
libreoffice --headless --convert-to pdf --outdir presentation \
  presentation/ROAD2AIR_teknisk_losning.pptx
```
Annars: öppna `.pptx` i PowerPoint och *Spara som → PDF*.
