3# GitHub Actions CI/CD

Este proyecto utiliza GitHub Actions para automatizar el proceso de CI/CD.

## Workflows Disponibles

### 1. CI/CD Pipeline (`ci.yml`)
**Trigger:** Push o Pull Request a `main` o `develop`

**Trabajos:**
- ✅ **build-and-test**: Compila el proyecto y ejecuta todos los tests
- ✅ **code-quality**: Valida la calidad del código
- ✅ **docker-build**: Construye imagen Docker (solo en push a main)
- ✅ **notify**: Notifica el estado final del build

**Características:**
- Servicio MySQL integrado para tests
- Cache de Gradle para builds más rápidos
- Reportes de tests automáticos
- Artifacts de JARs generados
- Retención de artifacts por 7 días

### 2. Release Pipeline (`release.yml`)
**Trigger:** Push de tags con formato `v*.*.*` (ejemplo: v1.0.0)

**Trabajos:**
- 📦 **create-release**: Crea un release en GitHub con el JAR
- 🐳 **docker-release**: Publica imagen Docker en Docker Hub

## Configuración

### Secretos Requeridos

Para que los workflows funcionen completamente, configura estos secretos en tu repositorio:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Descripción | Requerido |
|--------|-------------|-----------|
| `DOCKER_USERNAME` | Usuario de Docker Hub | Opcional* |
| `DOCKER_PASSWORD` | Token/Password de Docker Hub | Opcional* |
| `GITHUB_TOKEN` | Token automático de GitHub | ✅ Auto-generado |

*Solo necesarios si quieres publicar en Docker Hub

### Badges para README

Agrega estos badges a tu README.md:

```markdown
![CI/CD](https://github.com/catikate/Local407/actions/workflows/ci.yml/badge.svg)
![Release](https://github.com/catikate/Local407/actions/workflows/release.yml/badge.svg)
```

## Uso

### CI Automático
El workflow de CI se ejecuta automáticamente en:
- Cada push a `main` o `develop`
- Cada pull request hacia `main` o `develop`

### Crear un Release

1. **Crear y pushear un tag:**
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

2. El workflow:
   - Compila el proyecto
   - Crea un release en GitHub
   - Sube el JAR como artifact
   - Construye y publica imagen Docker

### Build Local del Docker

```bash
# Construir imagen
docker build -t local407:latest .

# Ejecutar contenedor
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/mydatabase \
  -e SPRING_DATASOURCE_USERNAME=myuser \
  -e SPRING_DATASOURCE_PASSWORD=secret \
  -e JWT_SECRET=your-secret-key \
  local407:latest
```

## Visualizar Resultados

### En GitHub:
1. Ve a la pestaña **Actions** de tu repositorio
2. Selecciona un workflow run
3. Descarga artifacts (JAR, test reports)

### Test Reports:
Los reportes de tests se publican automáticamente como artifacts y son visibles en cada workflow run.

## Troubleshooting

### Fallo: "Test X failed"
- Revisa los logs del job `build-and-test`
- Descarga el artifact `test-reports` para ver detalles
- Ejecuta `./gradlew test` localmente para reproducir

### Fallo: "Docker build failed"
- Verifica que el Dockerfile esté correcto
- Asegúrate de que el JAR se construyó correctamente en el step anterior

### Fallo: "Docker push failed"
- Verifica que los secretos `DOCKER_USERNAME` y `DOCKER_PASSWORD` estén configurados
- Asegúrate de que tu token de Docker Hub tenga permisos de escritura

## Optimizaciones

El workflow incluye varias optimizaciones:
- ⚡ **Gradle Cache**: Reduce tiempo de build en ~60%
- ⚡ **Docker Cache**: Usa GitHub Actions cache para layers
- ⚡ **Parallel Jobs**: code-quality corre en paralelo con docker-build
- ⚡ **Conditional Jobs**: Docker solo se construye en push a main

## Próximos Pasos

Posibles mejoras futuras:
- [ ] Integrar SonarQube para análisis de código
- [ ] Deploy automático a Cloud (AWS, Azure, GCP)
- [ ] Notificaciones a Slack/Discord
- [ ] Tests de integración E2E
- [ ] Security scanning con Snyk/Trivy
- [ ] Performance testing