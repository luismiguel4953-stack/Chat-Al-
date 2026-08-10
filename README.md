# 🤖 LM Chat AI - Aplicación Móvil Android & Web

LM Chat AI es una aplicación móvil nativa (Android APK) y web progresiva (PWA) impulsada por inteligencia artificial en español, con pantalla de inicio animada, pantalla de carga con logo personalizado, historial local y soporte multimodelo.

---

## 📱 Dónde Descargar e Instalar el Archivo APK en tu Teléfono

Tienes **3 formas sencillas** de obtener e instalar la aplicación en tu teléfono Android:

### 1. 📥 Descarga Directa desde la Aplicación
- Abre la aplicación en tu navegador o dispositivo.
- En la pantalla principal o el encabezado, haz clic en el botón verde **"Descargar APK (.apk)"**.
- El archivo `LM-Chat-AI-v4.2.apk` se descargará directamente en tu carpeta de descargas para ser instalado inmediatamente.

### 2. ⚡ Descarga desde GitHub Actions (Artefacto APK)
Cada vez que el proyecto se actualiza en GitHub, la plataforma compila automáticamente una nueva versión en formato APK:
1. Ve a tu repositorio en GitHub: **`luismiguel4953-stack/LM-Chat-AI`**.
2. Haz clic en la pestaña **Actions** (en el menú superior del repositorio).
3. Selecciona la ejecución más reciente bajo la acción **"Build Android APK"**.
4. En la parte inferior, dentro de la sección **Artifacts**, haz clic en **`LM-Chat-AI-Android-APK`**.
5. Se descargará un archivo `.zip` que contiene el archivo **`.apk`**. Descompáctalo e instálalo en tu teléfono Android.

### 3. 🚀 Compilación Novedosa desde GitHub Releases
- Si creas una etiqueta (tag) como `v4.2.0` en GitHub, la acción de GitHub creará automáticamente una **Release** pública con el archivo `LM-Chat-AI-v4.2.apk` adjunto listo para descarga directa.

---

## 🛠️ Configuración Novedosa del Sistema de Compilación Android (Capacitor + Gradle)

El proyecto incluye la integración nativa de **Capacitor** y el flujo de integración continua **GitHub Actions** (`.github/workflows/build-apk.yml`).

### Archivos de Configuración Clave:
- `capacitor.config.json`: Define el identificador del paquete (`com.lmchatai.app`), el nombre de la app (`LM Chat AI`) y la pantalla de inicio (Splash screen).
- `public/manifest.json`: Manifiesto para PWA y metadatos de instalación.
- `public/logo.jpg`: Logo personalizado de la aplicación generado con IA.
- `src/components/SplashScreen.tsx`: Pantalla de inicio animada de arranque.
- `.github/workflows/build-apk.yml`: Flujo de trabajo para compilar el APK con JDK 17 y Gradle.

---

## 📂 Estructura del Proyecto

```
/
├── .github/workflows/build-apk.yml # Flujo automatizado de GitHub Actions para generar APK
├── capacitor.config.json           # Configuración nativa de Android con Capacitor
├── public/
│   ├── logo.jpg                    # Logo de inicio de LM Chat AI
│   ├── manifest.json               # Manifiesto de aplicación móvil PWA
│   └── LM-Chat-AI.apk              # Paquete ejecutable APK listo para descarga
├── src/
│   ├── components/
│   │   ├── SplashScreen.tsx        # Pantalla de inicio animada
│   │   ├── MobileInstallModal.tsx  # Modal interactivo con instrucciones de instalación
│   │   └── Header.tsx              # Encabezado con acceso a descarga de APK
│   ├── App.tsx                     # Componente principal con banner de descarga
│   └── main.tsx                    # Punto de entrada React
├── server.ts                       # Servidor Express full-stack con endpoint /api/download-apk
├── package.json                    # Dependencias del proyecto
└── README.md                       # Documentación oficial
```

---

## 🚀 Cómo Sincronizar con GitHub desde Google AI Studio

1. En **Google AI Studio**, haz clic en el menú superior derecho -> **Export to GitHub**.
2. Selecciona tu repositorio `luismiguel4953-stack/LM-Chat-AI`.
3. Al sincronizar, GitHub Actions ejecutará automáticamente la tarea **Build Android APK** y generará el archivo ejecutable listo para tu teléfono.


