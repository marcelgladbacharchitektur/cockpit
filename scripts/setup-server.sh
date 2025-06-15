#!/bin/bash
# Server Setup Script für Architekten-Cockpit

set -e

echo "🚀 Starting server setup for Architekten-Cockpit..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install global dependencies
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install PostgreSQL client
echo "📦 Installing PostgreSQL client..."
sudo apt-get install -y postgresql-client

# Install other dependencies
echo "📦 Installing additional tools..."
sudo apt-get install -y git curl wget htop

# Setup application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/cockpit
sudo chown -R $USER:$USER /var/www/cockpit

# Setup firewall
echo "🔒 Configuring firewall..."
sudo apt-get install -y ufw
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Install and configure Caddy
echo "🌐 Installing Caddy..."
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy

# Create backup directories
echo "📁 Creating backup directories..."
sudo mkdir -p /var/backups/cockpit
sudo chown -R $USER:$USER /var/backups/cockpit

# Setup PM2 to start on boot
echo "⚙️ Configuring PM2 startup..."
pm2 startup systemd -u $USER --hp /home/$USER
sudo systemctl enable pm2-$USER

# Enable automatic security updates
echo "🔒 Enabling automatic security updates..."
sudo apt-get install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

echo "✅ Server setup completed!"
echo ""
echo "Next steps:"
echo "1. Configure /var/www/cockpit/.env with your database URL"
echo "2. Configure /etc/caddy/Caddyfile with your domain"
echo "3. Add SSH key to authorized_keys for GitHub Actions"
echo "4. Set up backup scripts in /opt/"
echo "5. Configure GitHub Secrets in your repository"