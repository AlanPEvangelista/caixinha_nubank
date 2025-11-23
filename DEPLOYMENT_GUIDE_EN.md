# Home Server Deployment Guide (192.168.100.117)

This guide provides step-by-step instructions for manually deploying the Nubank Tracker application on your home server at IP address 192.168.100.117 with user alan.

## Prerequisites

1. SSH access to the server (192.168.100.117)
2. User account: alan
3. Internet connection on the server
4. Sudo privileges (if installing system packages)

## Step 1: Connect to the Server

Connect to your home server via SSH:

```bash
ssh alan@192.168.100.117
```

## Step 2: Install System Dependencies

Update package list and install required system packages:

```bash
sudo apt update
sudo apt install -y nodejs npm git
```

Note: If Node.js is not available in default repositories or you need a specific version, you can install it using NodeSource:

```bash
# Optional: Install Node.js via NodeSource for a more recent version
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs
```

## Step 3: Clone or Transfer the Application

Option 1: Clone the repository (if hosted in a Git repository):
```bash
git clone <repository-url> caixinha_nubank
cd caixinha_nubank
```

Option 2: Transfer files from your local machine:
```bash
# Run this command on your local machine, not on the server
scp -r /home/alan/Documentos/projetos/nubank/caixinha_nubank alan@192.168.100.117:/home/alan/
```

Then on the server:
```bash
cd /home/alan/caixinha_nubank
```

## Step 4: Install Application Dependencies

Install all required Node.js dependencies:

```bash
npm install
```

Note: This project now uses npm instead of pnpm. If you prefer to use pnpm, install it with `sudo npm install -g pnpm` and use `pnpm install` instead.

## Step 5: Build the Application

Create a production build of the frontend application:

```bash
npm run build
```

This will generate production files in the `dist` directory.

## Step 6: Configure the Application Service

The application includes an Express.js server to serve the frontend files and provide the backend API. Set it up as a system service:

1. Copy the service file to the systemd directory:
```bash
sudo cp /home/alan/caixinha_nubank/nubank-tracker.service /etc/systemd/system/
```

2. Reload systemd to recognize the new service:
```bash
sudo systemctl daemon-reload
```

3. Enable the service to start on boot:
```bash
sudo systemctl enable nubank-tracker
```

4. Start the service:
```bash
sudo systemctl start nubank-tracker
```

5. Check the service status:
```bash
sudo systemctl status nubank-tracker
```

## Step 7: Configure Firewall (if applicable)

If you have a firewall enabled, allow traffic on port 3002 (default server port):

```bash
sudo ufw allow 3002/tcp
```

## Step 8: Access the Application

Open a web browser and navigate to:

```
http://192.168.100.117:3002
```

## Maintenance

To update the application:

1. Get the latest changes (if using Git):
```bash
cd /home/alan/caixinha_nubank
git pull
```

2. Or transfer new files from your development machine.

3. Reinstall dependencies if needed:
```bash
npm install
```

4. Rebuild the application:
```bash
npm run build
```

5. Restart the service:
```bash
sudo systemctl restart nubank-tracker
```

## Troubleshooting

1. If the application doesn't load:
   - Check service logs: `sudo journalctl -u nubank-tracker -f`
   - Verify the build was successful and files exist in the `dist` directory
   - Check if the service is running: `sudo systemctl status nubank-tracker`

2. If permission issues occur:
   - Check file ownership: `ls -la /home/alan/caixinha_nubank`
   - Ensure alan user can read files: `chmod -R 755 /home/alan/caixinha_nubank`

3. If the database is not working:
   - Check if the `data` directory exists and has correct permissions
   - The SQLite database is stored at `/home/alan/caixinha_nubank/data/nubank_tracker.db`