# Archicad Integration für Cockpit

Diese Integration ermöglicht es, QR-Codes für die Plan-Verifizierung direkt aus Archicad heraus zu generieren.

## Installation

### 1. Python-Abhängigkeiten installieren

Das Script benötigt zwei Python-Bibliotheken:

```bash
pip install requests
pip install qrcode[pil]
```

### 2. Script-Konfiguration

Öffnen Sie `cockpit_qr_generator.py` und passen Sie bei Bedarf die URL an:

```python
COCKPIT_BASE_URL = "https://portal.marcelgladbach.at"
```

## Verwendung

### Standalone-Ausführung (zum Testen)

```bash
python cockpit_qr_generator.py
```

Das Script fragt nach:
- Projektnummer (z.B. "25-001")
- Plantitel (z.B. "Grundriss Erdgeschoss")

### Integration in Archicad

1. **Script in Archicad verfügbar machen:**
   - Kopieren Sie `cockpit_qr_generator.py` in Ihren Archicad Python-Scripts Ordner
   - Oder referenzieren Sie es über den vollständigen Pfad

2. **Aus Archicad ausführen:**
   - Öffnen Sie die Python-Konsole in Archicad
   - Führen Sie das Script aus:
   ```python
   exec(open('/pfad/zu/cockpit_qr_generator.py').read())
   ```

3. **QR-Code platzieren:**
   - Das Script generiert eine PNG-Datei mit dem QR-Code
   - Diese kann als Drawing-Element auf dem Layout platziert werden

## Workflow

1. **Plan-Version im Cockpit erstellen:**
   - Loggen Sie sich ins Cockpit ein
   - Navigieren Sie zum Projekt
   - Erstellen Sie einen neuen Plantyp oder laden Sie eine neue Version hoch

2. **QR-Code in Archicad generieren:**
   - Führen Sie das Python-Script aus
   - Geben Sie Projektnummer und Plantitel exakt wie im Cockpit ein
   - Das Script holt automatisch die neueste Version

3. **QR-Code auf Plan platzieren:**
   - Der generierte QR-Code wird im Temp-Verzeichnis gespeichert
   - Platzieren Sie ihn als External Drawing im Plankopf
   - Empfohlene Größe: 2-3 cm

## Archicad API Integration (Fortgeschritten)

Für eine vollständige Integration können die TODO-Kommentare im Script durch Archicad-API-Aufrufe ersetzt werden:

### Benutzereingabe über Archicad-Dialog:
```python
from archicad import ACConnection
conn = ACConnection.connect()
values = conn.Commands.GetValues([
    conn.Commands.CreateInputValue("Projektnummer", "25-001"),
    conn.Commands.CreateInputValue("Plantitel", "Grundriss Erdgeschoss")
])
```

### Automatische Platzierung:
```python
drawing_element = conn.Commands.CreateDrawing(
    layoutId=current_layout.layoutId,
    filePath=qr_image_path,
    anchorPoint={"x": 0.27, "y": 0.02},
    rotationAngle=0,
    scale=1.0
)
```

## Fehlerbehebung

### "Plan nicht gefunden"
- Überprüfen Sie, ob Projektnummer und Plantitel exakt mit den Einträgen im Cockpit übereinstimmen
- Groß-/Kleinschreibung beachten!

### Netzwerkfehler
- Stellen Sie sicher, dass Sie Internetzugang haben
- Prüfen Sie, ob das Cockpit erreichbar ist

### QR-Code wird nicht angezeigt
- Überprüfen Sie, ob die PNG-Datei korrekt generiert wurde
- Schauen Sie im Temp-Verzeichnis nach der Datei

## Support

Bei Fragen oder Problemen wenden Sie sich an:
- Marcel Gladbach Architekturbüro
- support@marcelgladbach.at