#!/bin/bash
# Migration Script: nginx to Caddy + New Cockpit

set -e

echo "🔄 Starting migration from old portal to new Cockpit..."

# 1. Backup current nginx configuration
echo "📦 Backing up current nginx configuration..."
sudo cp -r /etc/nginx /etc/nginx.backup.$(date +%Y%m%d_%H%M%S)

# 2. Stop and disable nginx
echo "⏹️ Stopping nginx..."
sudo systemctl stop nginx
sudo systemctl disable nginx

# 3. Install Caddy
echo "📦 Installing Caddy..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# 4. Configure Caddy
echo "⚙️ Configuring Caddy..."
sudo tee /etc/caddy/Caddyfile > /dev/null <<EOF
# New Cockpit Application
cockpit.marcelgladbach.at {
    reverse_proxy localhost:3000
}

# Existing Nextcloud
cloud.marcelgladbach.at {
    reverse_proxy localhost:8080
}

# Umami Analytics
analytics.marcelgladbach.at {
    reverse_proxy localhost:3001
}
EOF

# 5. Test Caddy configuration
echo "🧪 Testing Caddy configuration..."
sudo caddy validate --config /etc/caddy/Caddyfile

# 6. Start Caddy
echo "▶️ Starting Caddy..."
sudo systemctl start caddy
sudo systemctl enable caddy

# 7. Remove nginx (optional - only after confirming everything works)
echo ""
echo "⚠️ nginx has been stopped but NOT removed."
echo "After confirming everything works, you can remove it with:"
echo "sudo apt remove --purge nginx nginx-common"

echo "✅ Migration completed!"
echo ""
echo "Next steps:"
echo "1. Deploy the Cockpit application to /var/www/cockpit"
echo "2. Configure GitHub Secrets for automated deployment"
echo "3. Test all services"
echo "4. Remove nginx after confirming everything works"