# Migration Checklist: Altes Portal → Neues Cockpit

## Vorbereitung

- [ ] Vollständiges Backup des Servers erstellen
- [ ] Aktuelle nginx Konfiguration dokumentieren
- [ ] DNS-Einträge prüfen
- [ ] Alle wichtigen Daten aus dem alten Portal exportieren

## Schritt 1: Server vorbereiten

```bash
# SSH Verbindung zum Server
ssh user@your-server-ip

# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 installieren
sudo npm install -g pm2
```

## Schritt 2: Altes Portal sichern

```bash
# Backup der alten Anwendung
sudo tar -czf /backup/old-portal-$(date +%Y%m%d).tar.gz /var/www/html

# nginx Konfiguration sichern
sudo cp -r /etc/nginx /backup/nginx-config-$(date +%Y%m%d)

# Datenbank exportieren (falls vorhanden)
# mysqldump oder pg_dump verwenden
```

## Schritt 3: Migration durchführen

```bash
# Migration Script ausführen
wget https://raw.githubusercontent.com/marcelgladbacharchitektur/cockpit/main/scripts/migrate-from-nginx.sh
chmod +x migrate-from-nginx.sh
sudo ./migrate-from-nginx.sh
```

## Schritt 4: Neue Anwendung deployen

```bash
# Anwendungsverzeichnis erstellen
sudo mkdir -p /var/www/cockpit
sudo chown -R $USER:$USER /var/www/cockpit

# Umgebungsvariablen konfigurieren
cd /var/www/cockpit
nano .env
# DATABASE_URL=...
# NODE_ENV=production

# Erste manuelle Installation
git clone https://github.com/marcelgladbacharchitektur/cockpit.git .
npm install
npx prisma migrate deploy
npm run build

# Mit PM2 starten
pm2 start npm --name "cockpit" -- start
pm2 save
pm2 startup
```

## Schritt 5: GitHub Actions konfigurieren

Im GitHub Repository unter Settings → Secrets:

1. `SERVER_HOST`: Server IP
2. `SERVER_USER`: SSH Benutzer
3. `SERVER_PORT`: 22
4. `SERVER_SSH_KEY`: Privater SSH Key
5. `DATABASE_URL`: Supabase URL

## Schritt 6: Services prüfen

- [ ] Cockpit erreichbar unter https://cockpit.marcelgladbach.at
- [ ] Nextcloud funktioniert unter https://cloud.marcelgladbach.at
- [ ] Umami läuft unter https://analytics.marcelgladbach.at
- [ ] SSL-Zertifikate sind gültig (Caddy macht das automatisch)

## Schritt 7: Aufräumen (nach erfolgreicher Migration)

```bash
# nginx entfernen (nur wenn alles funktioniert!)
sudo apt remove --purge nginx nginx-common

# Alte Dateien löschen
sudo rm -rf /var/www/html/old-portal
```

## Rollback Plan

Falls etwas schief geht:

```bash
# Caddy stoppen
sudo systemctl stop caddy

# nginx wieder aktivieren
sudo systemctl start nginx
sudo systemctl enable nginx

# Backup wiederherstellen
sudo tar -xzf /backup/old-portal-[datum].tar.gz -C /
```

## Wichtige Hinweise

1. **DNS Propagation**: Änderungen an DNS-Einträgen können bis zu 48 Stunden dauern
2. **SSL Zertifikate**: Caddy holt automatisch Let's Encrypt Zertifikate
3. **Firewall**: Ports 80 und 443 müssen offen sein
4. **Monitoring**: Uptime Kuma einrichten für Überwachung