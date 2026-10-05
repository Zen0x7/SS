# SS · Certificados

> AGPL-3.0-only. Todo el código de este repositorio está bajo esa licencia.

PWA para generar tu propio certificado (RSA-2048 + X.509 autofirmado), guardar los certificados públicos de tus
contactos en el navegador y enviarle mensajes cifrados que solo ellos pueden leer.

Todo con Web Crypto en el navegador: **nada sale del dispositivo**.

## Flujo

1. **Mi certificado** → generas el par. Te deja descargar `nombre.crt`, `nombre.pub.pem` y `nombre.key`.
2. Pasas el `.crt` (o el `.pub`) a tu amigo.
3. Él entra a la app → **Contactos** → pega tu `.crt` → queda guardado en `localStorage` (ya está cargado la próxima vez).
4. Escribes el mensaje en **Cifrar** → te sale un sobre (AES-256-GCM + RSA-OAEP-2048) para copiar o descargar (`.sslm`).
5. Tu amigo lo pega en **Descifrar** y sube **su** clave privada (`.key`).

La clave privada **no** se guarda sola: vive en memoria durante la sesión. Si quieres que sobreviva al F5, marca
*Recordar en localStorage* (eso sí queda en el dispositivo).

## Comandos

```bash
yarn install
yarn dev          # http://localhost:3000
yarn build        # .output (sw + manifest)
yarn preview
yarn typecheck
yarn test:e2e     # requiere yarn build antes; usa el Chrome del sistema (CHROME_PATH para override)
```

## Detalles técnicos

- `app/utils/pki.ts`: DER/ASN.1 a mano, certificado X.509 autofirmado (v3, basicConstraints, keyUsage, EKU serverAuth),
  sobre híbrido AES-256-GCM + RSA-OAEP-256. El `.crt` que genera es válido para `openssl verify`.
- Clave privada derivada del PKCS#8 sin `exportKey('spki')` (no existe en todos los motores).
- PWA con `@vite-pwa/nuxt`: `sw.js` con precache del shell (`/` prerenderizado) + NetworkFirst para navegaciones,
  así que abre sin internet.

## Ojo

Autofirmado sirve para cifrar mensajes persona a persona, **no** para TLS en un navegador (ahí necesitas una CA real).