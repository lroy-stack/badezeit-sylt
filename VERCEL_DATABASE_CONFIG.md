# ⚠️ CONFIGURACIÓN CRÍTICA: Base de Datos en Vercel

## Problema Actual

**Error:** "Application error: a server-side exception has occurred" (Digest: 3976441136)

**Causa Raíz:** La aplicación se desconecta de la base de datos después del login porque está usando una conexión directa a PostgreSQL en lugar del Connection Pooler de Supabase.

## Solución Inmediata

### 1. Obtener la URL del Connection Pooler

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a: **Settings** → **Database** → **Connection Pooling**
3. Copia la **Transaction Mode Connection String** (puerto 6543)
4. La URL debe verse así:
   ```
   postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### 2. Configurar en Vercel

1. Ve a tu proyecto en Vercel Dashboard
2. Navega a: **Settings** → **Environment Variables**
3. Actualiza o crea la variable `DATABASE_URL` con el siguiente formato:

   ```bash
   DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
   ```

   **Parámetros importantes:**
   - `puerto 6543` (NO 5432) ← Connection Pooler
   - `?pgbouncer=true` ← Habilita el pooling
   - `&connection_limit=1` ← Limita conexiones por función serverless

4. Aplica a **Production**, **Preview**, y **Development**
5. Click en **Save**

### 3. Redeploy

1. Ve a: **Deployments**
2. Click en el deployment más reciente
3. Click en los tres puntos (⋯)
4. Click en **Redeploy**
5. Selecciona **Use existing Build Cache**
6. Click en **Redeploy**

---

## ¿Por qué es necesario?

### Problema con Conexión Directa (puerto 5432)

En Vercel (serverless), cada función crea una instancia separada:
- ❌ Cada instancia intenta abrir conexión a PostgreSQL
- ❌ Supabase tiene límite de ~60 conexiones concurrentes
- ❌ Se excede el límite rápidamente → **Application error**
- ❌ La aplicación se desconecta de la DB

### Solución con Connection Pooler (puerto 6543)

El Connection Pooler de Supabase usa PgBouncer:
- ✅ Reutiliza conexiones existentes
- ✅ Reduce el número de conexiones activas
- ✅ Optimizado para serverless/funciones
- ✅ Soporta miles de conexiones simultáneas
- ✅ La aplicación mantiene la conexión estable

---

## Variables de Entorno Completas

Configura estas variables en Vercel:

```bash
# Base de Datos (CRÍTICO)
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase Auth (ya deberías tenerlas)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."

# Opcional: Para migraciones (NO usar en producción)
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

---

## Verificación Post-Deploy

1. **Espera 1-2 minutos** después del redeploy
2. Ve a tu sitio: `https://badezeit-sylt.vercel.app`
3. Intenta iniciar sesión con las credenciales demo:
   - Email: `demouser@badezeit.de`
   - Password: `badezeit00`
4. Si funciona, deberías ver el dashboard sin el error "Application error"

---

## Logs de Vercel (para debugging)

Si el problema persiste:

1. Ve a Vercel Dashboard → **Logs**
2. Filtra por **Runtime Logs**
3. Busca errores relacionados con:
   - `Prisma Client`
   - `Connection timeout`
   - `ECONNREFUSED`
   - `too many clients`

Copia y pega los logs para análisis adicional.

---

## Diferencia Entre URLs

| Tipo | Puerto | Cuándo Usar | Para Qué |
|------|--------|-------------|----------|
| **Connection Pooler** | 6543 | Producción/Vercel | Queries en runtime |
| **Direct Connection** | 5432 | Local/Migraciones | `prisma migrate` |

⚠️ **NUNCA uses puerto 5432 (directa) en Vercel/producción**

---

## Próximos Pasos (después de resolver)

Una vez que el dashboard funcione:

1. ✅ Verificar todas las funcionalidades (reservaciones, menú, clientes)
2. ✅ Monitorear Vercel Logs por 24 horas
3. ✅ Verificar límites de conexión en Supabase Dashboard
4. ✅ Implementar monitoreo de errores (Sentry)
5. ✅ Documentar credenciales de producción en lugar seguro

---

## Contacto de Soporte

Si después de seguir estos pasos el problema persiste:

1. **Verifica que la password en DATABASE_URL sea correcta**
2. **Asegúrate de usar la región correcta** (aws-0-eu-central-1 es solo un ejemplo)
3. **Revisa que el proyecto de Supabase esté activo** (no pausado)
4. **Confirma que Supabase permita conexiones desde Vercel** (debería ser automático)

**Logs útiles para debugging:**
```bash
# En Vercel Runtime Logs, busca:
Error: Can't reach database server
ECONNREFUSED
Connection timeout
too many clients already
```

---

Generado: 2025-11-05
Versión: 1.0
