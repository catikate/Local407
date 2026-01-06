#!/bin/bash
# Script para ejecutar la aplicación con variables de entorno

set -a
source .env
set +a

./gradlew bootRun