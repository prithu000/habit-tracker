#!/bin/bash
set -e

echo "Installing YOU VS YOU Celery services..."

# Ensure we are in the deploy directory
cd "$(dirname "$0")"

# Copy service files to systemd
sudo cp celery.service /etc/systemd/system/
sudo cp celerybeat.service /etc/systemd/system/

# Set proper permissions
sudo chmod 644 /etc/systemd/system/celery.service
sudo chmod 644 /etc/systemd/system/celerybeat.service

# Reload systemd
echo "Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable services to start on boot
echo "Enabling services..."
sudo systemctl enable celery
sudo systemctl enable celerybeat

# Start services
echo "Starting services..."
sudo systemctl restart celery
sudo systemctl restart celerybeat

echo "Done! Verify status with:"
echo "sudo systemctl status celery"
echo "sudo systemctl status celerybeat"
