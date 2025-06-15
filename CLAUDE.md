# Cockpit - Architekturbüro Management System

## Projektübersicht

**Tech Stack:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Prisma ORM
- Zod (Validierung)
- lucide-react (Icons)

**Architektur:**
- Frontend: React Server/Client Components
- API: Next.js Route Handlers
- Datenbank: Supabase PostgreSQL
- Authentifizierung: (noch nicht implementiert)

## Aktueller Implementierungsstand

### ✅ Globales Layout & Navigation
- Persistente Sidebar mit Navigation
- Responsive Layout
- Dark Mode Support vorbereitet
- Einheitliches Design-System

### ✅ Projekte (CRUD vollständig)
**Create:** `/cockpit/projects/new`
- Automatische Projektnummer-Generierung (YY-NNN Format)
- Validierung mit Zod
- Felder: Name, Status, Budget, Projekttyp, Sektor, Grundstücksdaten

**Read:** `/cockpit/projects` und `/cockpit/projects/[id]`
- Übersichtsliste mit Status-Anzeige
- Detailansicht mit allen verknüpften Daten
- Verknüpfte Kontakte, Notizen, Dokumente

**Update:** `/cockpit/projects/[id]/edit`
- Vollständiges Bearbeitungsformular
- Validierung und Fehlerbehandlung

**Delete:** Implementiert mit Bestätigungsdialog
- Sicheres Löschen mit Modal
- Cascading Delete für verknüpfte Daten

### ✅ Kontakte (CRU implementiert, D fehlt)
**Create:** `/cockpit/contacts/new`
- ContactGroup mit Kategorie (Auftraggeber, Planer, etc.)
- Mehrere Personen pro Gruppe
- Adressen, E-Mails, Telefonnummern
- Transaktionale Speicherung

**Read:** `/cockpit/contacts` und `/cockpit/contacts/[id]`
- Karten-Layout mit Kategorie-Badges
- Icons für visuelle Unterscheidung
- Detailansicht zeigt verknüpfte Projekte

**Update:** `/cockpit/contacts/[id]/edit`
- Dynamische Felder (Personen/Adressen hinzufügen/entfernen)
- Komplexe Transaktion für sichere Updates
- Soft-Delete Implementierung

**Delete:** ❌ Noch nicht implementiert

### 📁 Datenbank-Schema (Prisma)

**Hauptmodelle:**
- `Project` - Projekte mit Status, Budget, Grundstücksdaten
- `ContactGroup` - Firmen/Organisationen mit Kategorie
- `Person` - Einzelpersonen mit Kontaktdaten
- `ProjectAssignment` - Verknüpfung Projekt ↔ Kontakt

**Hilfsmodelle:**
- `Address`, `EmailAddress`, `PhoneNumber`
- `ProjectNote`, `ProjectDocument`, `TimeEntry`
- `ProjectMetadata`, `ContactGroupMetadata`

**Enums:**
- `ProjectStatus`: AKQUISE, IN_BEARBEITUNG, PAUSE, etc.
- `ProjectType`: NEUBAU, UMBAU, ZUBAU, etc.
- `ProjectSector`: OEFFENTLICH, PRIVAT, GEWERBLICH, etc.
- `ContactCategory`: AUFTRAGGEBER, PLANER, BEHOERDE, etc.

## API-Endpunkte

### Projekte
- `GET /api/projects` - Liste aller Projekte
- `POST /api/projects` - Neues Projekt erstellen
- `GET /api/projects/[id]` - Einzelnes Projekt
- `PATCH /api/projects/[id]` - Projekt aktualisieren
- `DELETE /api/projects/[id]` - Projekt löschen

### Kontakte
- `GET /api/contacts` - Liste aller Kontakte
- `POST /api/contacts` - Neuen Kontakt erstellen
- `GET /api/contacts/[id]` - Einzelner Kontakt
- `PATCH /api/contacts/[id]` - Kontakt aktualisieren
- `DELETE /api/contacts/[id]` - ❌ Noch nicht implementiert

## Wichtige Implementierungsdetails

### Validierung
- Alle API-Routes verwenden Zod-Schemas
- Frontend- und Backend-Validierung
- Detaillierte Fehlermeldungen

### Datenbank-Transaktionen
- Prisma `$transaction` für atomare Operationen
- Besonders wichtig bei Kontakt-Updates
- Cascading Deletes über Prisma-Relations

### UX-Patterns
- Bestätigungsdialoge für destruktive Aktionen
- Ladezustände und Fehlerbehandlung
- Empty States mit hilfreichen Aktionen
- Konsistente Navigation und Breadcrumbs

## Nächste Schritte (Priorität)

1. **Kontakte löschen** - Delete-Funktion analog zu Projekten
2. **Dashboard** - Widgets, Statistiken, letzte Aktivitäten
3. **Projekt-Kontakt-Verknüpfung** - UI für ProjectAssignment
4. **Such- und Filterfunktionen** - Für beide Listen
5. **Zeiterfassung** - TimeEntry CRUD implementieren
6. **Notizen & Dokumente** - UI für ProjectNote/ProjectDocument
7. **Authentifizierung** - Supabase Auth Integration
8. **Berechtigungen** - Role-based Access Control

## Entwicklungshinweise

### Lokale Entwicklung
```bash
npm run dev
```

### Datenbank-Migrationen
```bash
npx prisma migrate dev
```

### Umgebungsvariablen
- `DATABASE_URL` - Supabase PostgreSQL Connection String (Session Pooler)

### Git-Workflow
- Hauptbranch: `main`
- Commit-Messages: Detailliert mit Claude Code Co-Authorship
- Regelmäßige Pushes zu GitHub

## Bekannte Limitierungen

1. Keine Authentifizierung implementiert
2. Keine Datei-Uploads für Dokumente
3. Keine Export-Funktionen
4. Keine Mehrsprachigkeit
5. Keine PWA-Features

## Performance-Überlegungen

- Lazy Loading für große Listen noch nicht implementiert
- Keine Pagination in Listen
- Bildoptimierung fehlt noch
- Caching-Strategie noch zu definieren