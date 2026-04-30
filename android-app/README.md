# Garimpo Nautico Android

Aplicativo Android nativo que carrega o site oficial do Garimpo Nautico em WebView.

## APK publicado

O APK release assinado para publicar no site fica em:

`app/build/outputs/apk/release/app-release.apk`

A copia hospedada pelo site fica em:

`../downloads/nosso-app.apk`

## Build local

Use Gradle com Android SDK instalado:

```powershell
gradle assembleRelease
```

As credenciais de assinatura ficam apenas em `local.properties`, que e ignorado pelo Git.
