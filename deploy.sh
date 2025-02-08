#!/bin/bash

# GitHub'dan güncellemeleri çek
git pull origin main

# Docker Compose ile yeniden başlat
docker-compose down
docker-compose build --no-cache
docker-compose up -d