# Garimpo Nautico Android

Aplicativo Android nativo que carrega o site oficial do Garimpo Nautico em WebView.

## APK de teste

O APK debug gerado fica em:

`app/build/outputs/apk/debug/app-debug.apk`

## Build local

Use Gradle com Android SDK instalado:

```powershell
gradle assembleDebug
```

O app usa `http://garimponautico.tech/` enquanto o certificado HTTPS do GitHub Pages ainda esta em emissao.
