#!/usr/bin/env python3
"""
Cockpit QR Code Generator für Archicad
=====================================

Dieses Script generiert QR-Codes für Baupläne, die mit dem Cockpit-System verwaltet werden.
Es ruft die neueste Version eines Plans ab und erstellt einen QR-Code zur Verifizierung.

Abhängigkeiten:
- pip install requests
- pip install qrcode[pil]

Autor: Marcel Gladbach Architekturbüro
Version: 1.0
"""

import os
import sys
import json
import tempfile
from datetime import datetime
import requests
import qrcode
from PIL import Image

# Konfiguration
COCKPIT_BASE_URL = "https://portal.marcelgladbach.at"
API_ENDPOINT = "/api/public/get-latest-plan-version-id"
VERIFICATION_BASE_URL = f"{COCKPIT_BASE_URL}/verify"

# Temporärer Ordner für QR-Codes
TEMP_DIR = tempfile.gettempdir()


def get_user_input():
    """
    Holt die Benutzereingaben für Projektnummer und Plantitel.
    In Archicad sollte dies durch native Dialoge ersetzt werden.
    """
    # TODO: In Archicad ersetzen durch:
    # from archicad import ACConnection
    # conn = ACConnection.connect()
    # values = conn.Commands.GetValues([
    #     conn.Commands.CreateInputValue("Projektnummer", "25-001"),
    #     conn.Commands.CreateInputValue("Plantitel", "Grundriss Erdgeschoss")
    # ])
    # project_number = values[0]
    # plan_title = values[1]
    
    print("=== Cockpit QR-Code Generator ===")
    project_number = input("Projektnummer (z.B. 25-001): ").strip()
    plan_title = input("Plantitel (z.B. Grundriss Erdgeschoss): ").strip()
    
    if not project_number or not plan_title:
        print("Fehler: Beide Felder müssen ausgefüllt werden!")
        sys.exit(1)
    
    return project_number, plan_title


def get_latest_plan_version(project_number, plan_title):
    """
    Ruft die neueste Version eines Plans vom Cockpit ab.
    """
    try:
        # API-Aufruf
        url = f"{COCKPIT_BASE_URL}{API_ENDPOINT}"
        params = {
            "projectNumber": project_number,
            "planTitle": plan_title
        }
        
        print(f"Rufe Plandaten ab von: {url}")
        response = requests.get(url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            return data['versionId'], data['versionNumber']
        elif response.status_code == 404:
            error_data = response.json()
            print(f"Fehler: {error_data.get('error', 'Plan nicht gefunden')}")
            return None, None
        else:
            print(f"Fehler: HTTP {response.status_code}")
            return None, None
            
    except requests.RequestException as e:
        print(f"Netzwerkfehler: {e}")
        return None, None
    except Exception as e:
        print(f"Unerwarteter Fehler: {e}")
        return None, None


def generate_qr_code(version_id, project_number, plan_title, version_number):
    """
    Generiert einen QR-Code für die Verifizierungs-URL.
    """
    # Verifizierungs-URL erstellen
    verification_url = f"{VERIFICATION_BASE_URL}/{version_id}"
    
    # QR-Code erstellen
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Hohe Fehlerkorrektur
        box_size=10,
        border=4,
    )
    
    qr.add_data(verification_url)
    qr.make(fit=True)
    
    # Bild erstellen
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Dateiname generieren
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_title = "".join(c if c.isalnum() or c in "-_" else "_" for c in plan_title)
    filename = f"QR_{project_number}_{safe_title}_V{version_number}_{timestamp}.png"
    filepath = os.path.join(TEMP_DIR, filename)
    
    # Bild speichern
    img.save(filepath)
    
    print(f"\nQR-Code erfolgreich erstellt:")
    print(f"Datei: {filepath}")
    print(f"URL: {verification_url}")
    print(f"Version: {version_number}")
    
    return filepath, verification_url


def place_qr_in_archicad(qr_image_path):
    """
    Platziert das QR-Code-Bild in Archicad.
    Diese Funktion muss für die Archicad-Python-API angepasst werden.
    """
    # TODO: Archicad-spezifische Implementierung
    # Beispiel-Code für Archicad API:
    """
    from archicad import ACConnection
    
    # Verbindung zu Archicad herstellen
    conn = ACConnection.connect()
    
    # Aktuelles Layout abrufen
    current_layout = conn.Commands.GetCurrentLayout()
    
    # QR-Code als Drawing-Element platzieren
    # Die genaue Position muss angepasst werden (z.B. untere rechte Ecke)
    drawing_element = conn.Commands.CreateDrawing(
        layoutId=current_layout.layoutId,
        filePath=qr_image_path,
        anchorPoint={"x": 0.27, "y": 0.02},  # Position in Metern vom Ursprung
        rotationAngle=0,
        scale=1.0
    )
    
    print(f"QR-Code wurde auf Layout '{current_layout.name}' platziert.")
    """
    
    print("\n--- Archicad-Integration ---")
    print("Der QR-Code wurde erstellt und kann nun in Archicad platziert werden.")
    print("In Archicad:")
    print("1. Öffnen Sie das gewünschte Layout")
    print("2. Verwenden Sie 'Ablage > Externe Inhalte > Drawing platzieren'")
    print(f"3. Wählen Sie die Datei: {qr_image_path}")
    print("4. Platzieren Sie den QR-Code im Plankopf")


def main():
    """
    Hauptfunktion des Scripts.
    """
    try:
        # Benutzereingaben holen
        project_number, plan_title = get_user_input()
        
        # Neueste Planversion abrufen
        print(f"\nSuche nach Plan '{plan_title}' in Projekt {project_number}...")
        version_id, version_number = get_latest_plan_version(project_number, plan_title)
        
        if not version_id:
            print("Plan konnte nicht gefunden werden. Bitte überprüfen Sie die Eingaben.")
            sys.exit(1)
        
        # QR-Code generieren
        print(f"Gefunden: Version {version_number}")
        qr_path, verification_url = generate_qr_code(
            version_id, 
            project_number, 
            plan_title, 
            version_number
        )
        
        # In Archicad platzieren
        place_qr_in_archicad(qr_path)
        
        print("\n=== Fertig ===")
        print("Der QR-Code wurde erfolgreich erstellt.")
        
    except KeyboardInterrupt:
        print("\nVorgang abgebrochen.")
        sys.exit(0)
    except Exception as e:
        print(f"\nFehler: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()