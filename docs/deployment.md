# Deployment Guide für Architekten-Cockpit

## Voraussetzungen auf dem Hetzner Server

### 1. Server-Grundkonfiguration

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20.x installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 global installieren
sudo npm install -g pm2

# PostgreSQL Client für Prisma
sudo apt-get install -y postgresql-client

# Git für Deployments
sudo apt-get install -y git
```

### 2. Anwendungsverzeichnis einrichten

```bash
# Verzeichnis erstellen
sudo mkdir -p /var/www/cockpit
sudo chown -R $USER:$USER /var/www/cockpit

# Umgebungsvariablen
sudo nano /var/www/cockpit/.env
```

Inhalt der `.env`:
```
DATABASE_URL="postgresql://user:password@db.supabase.co:5432/postgres?pgbouncer=true"
NODE_ENV=production
```

### 3. Firewall konfigurieren

```bash
# UFW installieren und konfigurieren
sudo apt-get install -y ufw

# Grundlegende Ports öffnen
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS

# Firewall aktivieren
sudo ufw --force enable
```

### 4. Caddy Reverse Proxy einrichten

```bash
# Caddy installieren
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Caddyfile konfigurieren
sudo nano /etc/caddy/Caddyfile
```

Caddyfile Inhalt:
```
cockpit.marcelgladbach.at {
    reverse_proxy localhost:3000
}

cloud.marcelgladbach.at {
    reverse_proxy localhost:8080
}

analytics.marcelgladbach.at {
    reverse_proxy localhost:3001
}
```

```bash
# Caddy neu starten
sudo systemctl reload caddy
```

## GitHub Secrets einrichten

Im GitHub Repository unter Settings → Secrets and variables → Actions:

1. `SERVER_HOST`: IP-Adresse des Hetzner Servers
2. `SERVER_USER`: SSH-Benutzer (meist `root` oder eigener User)
3. `SERVER_PORT`: SSH-Port (Standard: 22)
4. `SERVER_SSH_KEY`: Privater SSH-Schlüssel (siehe unten)
5. `DATABASE_URL`: Supabase Connection String

### SSH-Schlüssel generieren (lokal):

```bash
# Neuen SSH-Schlüssel generieren
ssh-keygen -t ed25519 -C "github-actions@cockpit" -f ~/.ssh/cockpit_deploy

# Öffentlichen Schlüssel auf Server kopieren
ssh-copy-id -i ~/.ssh/cockpit_deploy.pub user@server-ip

# Privaten Schlüssel als GitHub Secret hinzufügen
cat ~/.ssh/cockpit_deploy
```

## Backup-Strategie

### 1. Datenbank-Backup (Cronjob)

```bash
# Backup-Skript erstellen
sudo nano /opt/backup-supabase.sh
```

Inhalt:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/cockpit"
mkdir -p $BACKUP_DIR

# Datenbank dumpen
pg_dump "$DATABASE_URL" > "$BACKUP_DIR/cockpit_db_$DATE.sql"

# Alte Backups löschen (älter als 30 Tage)
find $BACKUP_DIR -name "cockpit_db_*.sql" -mtime +30 -delete
```

```bash
# Ausführbar machen
sudo chmod +x /opt/backup-supabase.sh

# Cronjob einrichten (täglich um 3 Uhr)
sudo crontab -e
# Hinzufügen: 0 3 * * * /opt/backup-supabase.sh
```

### 2. Nextcloud-Backup auf Hetzner Storage Box

```bash
# Backup-Skript für Nextcloud
sudo nano /opt/backup-nextcloud.sh
```

Inhalt:
```bash
#!/bin/bash
# Nextcloud-Daten auf Storage Box sichern
rsync -avz --delete \
  /var/lib/docker/volumes/nextcloud_data/_data/ \
  u123456@u123456.your-storagebox.de:/backup/nextcloud/
```

### 3. Monitoring mit Uptime Kuma

```bash
# Uptime Kuma Docker Container
docker run -d \
  --restart=always \
  -p 3002:3001 \
  -v uptime-kuma:/app/data \
  --name uptime-kuma \
  louislam/uptime-kuma:1
```

## Sicherheits-Checkliste

- [ ] SSH nur mit Key-Authentication
- [ ] Firewall (UFW) aktiviert
- [ ] Automatische Sicherheitsupdates aktiviert
- [ ] Fail2ban installiert
- [ ] SSL-Zertifikate via Caddy (Let's Encrypt)
- [ ] Regelmäßige Backups eingerichtet
- [ ] Monitoring aktiv

## Troubleshooting

### PM2 Logs anzeigen
```bash
pm2 logs cockpit
```

### Anwendung manuell neu starten
```bash
cd /var/www/cockpit
pm2 restart cockpit
```

### Caddy Status prüfen
```bash
sudo systemctl status caddy
```