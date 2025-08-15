# 🚀 Deployment Instructions - Demo con Supabase Auth

## ✅ Variables de Ambiente para Vercel

Configura estas variables en tu dashboard de Vercel (Settings → Environment Variables):

```bash

```

### ⚠️ Variables críticas para funcionamiento:
- **DATABASE_URL**: Conexión a base de datos PostgreSQL
- **NEXT_PUBLIC_SUPABASE_URL**: URL del proyecto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Clave pública para autenticación

## 🔐 Credenciales Demo

**Email:** `demouser@badezeit.de`  
**Password:** `badezeit00`

## 📋 Pasos para Deploy

1. **Push código a Git**
   ```bash
   git add .
   git commit -m "Implement Supabase auth for demo"
   git push
   ```

2. **Configurar variables en Vercel Dashboard**
   - Ve a tu proyecto en Vercel
   - Settings > Environment Variables
   - Añade las variables listadas arriba

3. **Crear usuario demo en Supabase** (solo primera vez)
   ```bash
   # Configura SUPABASE_SERVICE_ROLE_KEY en tu .env.local
   node create-demo-user.js
   ```

4. **Deploy automático**
   - Vercel detectará los cambios y hará deploy automáticamente
   - El middleware ahora usará Supabase Auth
   - Las APIs están optimizadas para serverless

## ✨ Cambios Implementados

### ✅ **Autenticación Supabase (Siguiendo Documentación Oficial)**
- ❌ Eliminado Clerk completamente
- ✅ Sistema auth con Supabase SSR siguiendo mejores prácticas
- ✅ Middleware oficial con `updateSession` pattern
- ✅ Login/logout funcional con cookies apropiadas
- ✅ Cliente server/browser correctamente configurado

### ✅ **Arquitectura Optimizada**
- ✅ `src/utils/supabase/middleware.ts` - Manejo de sesiones oficial
- ✅ `src/utils/supabase/server.ts` - Cliente server con cookies
- ✅ `src/utils/supabase/client.ts` - Cliente browser optimizado
- ✅ Middleware que sigue exactamente la documentación de Supabase

### ✅ **Optimizaciones Serverless**
- ✅ Queries Prisma simplificados para evitar prepared statement conflicts
- ✅ Connection pooling optimizado para Vercel
- ✅ Logging reducido en producción
- ✅ Error handling robusto

### ✅ **Demo Funcional**
- ✅ Dashboard protegido con credenciales demo
- ✅ APIs funcionando sin errores 500
- ✅ Speisekarte carga consistentemente
- ✅ Sistema profesional listo para cliente

## 🔧 Troubleshooting

Si hay problemas:

1. **Verificar variables de ambiente** en Vercel
2. **Check logs** en Vercel Functions
3. **Recrear usuario demo** si necesario:
   ```bash


## 📱 URLs Importantes

- **Demo Site:** https://badezeit-sylt.vercel.app
- **Login:** https://badezeit-sylt.vercel.app/login
- **Dashboard:** https://badezeit-sylt.vercel.app/dashboard
