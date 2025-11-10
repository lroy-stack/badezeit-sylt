# Database Connection Diagnosis

## Error Actual
```
Application error: a server-side exception has occurred
Digest: 3976441136
```

**Síntomas:**
- ✅ Login funciona correctamente
- ✅ `/speisekarte` carga sin problemas (página pública)
- ❌ `/dashboard` falla con error de servidor

**Diagnóstico:** Las tablas de la base de datos probablemente no existen en producción.

## Verificación de Base de Datos

### 1. Usar el endpoint de diagnóstico

Accede a esta URL en tu deployment de Vercel:
```
https://[tu-dominio].vercel.app/api/db-test
```

Este endpoint verificará:
- ✅ Conexión a la base de datos
- ✅ Existencia de todas las tablas
- ✅ Conteo de registros en cada tabla
- ✅ Variables de entorno configuradas

### 2. Revisar los resultados

**Si ves `exists: false` en alguna tabla**, necesitas aplicar el schema.

**Ejemplo de respuesta esperada:**
```json
{
  "connection": { "status": "connected" },
  "tables": {
    "users": { "exists": true, "count": 1 },
    "customers": { "exists": true, "count": 0 },
    "reservations": { "exists": true, "count": 0 }
  }
}
```

## Soluciones

### Opción 1: Aplicar Schema desde Vercel Dashboard

1. Ve a tu proyecto en Vercel
2. Settings → General → Build & Development Settings
3. Agrega un comando de build override:
   ```bash
   prisma generate && prisma db push && next build
   ```
4. Re-deploy

### Opción 2: Aplicar Schema localmente

```bash
# Asegúrate de tener las credenciales correctas en .env.local
export DATABASE_URL="postgresql://..."

# Aplica el schema
npx prisma db push

# Opcional: Seed con datos iniciales
npm run db:seed
```

### Opción 3: Usar el script automatizado

```bash
# Aplicar schema solamente
./scripts/setup-db.sh

# Aplicar schema + seed datos
./scripts/setup-db.sh --seed
```

## Verificación de Variables de Entorno en Vercel

**Requeridas:**
```env
DATABASE_URL=postgresql://user:password@host:5432/database
DIRECT_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

**Verificar en:**
Vercel Dashboard → [Proyecto] → Settings → Environment Variables

## Notas de Supabase

Si estás usando Supabase, asegúrate de:

1. **Connection Pooler URL** vs **Direct URL**:
   - `DATABASE_URL`: Usa la "Connection pooling" URL (puerto 6543)
   - `DIRECT_URL`: Usa la "Direct connection" URL (puerto 5432)

2. **Formato correcto:**
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

3. **Permisos:**
   - El usuario `postgres` debe tener permisos para crear tablas
   - Verifica en Supabase Dashboard → Database → Roles

## Logs de Diagnóstico

Con el nuevo error handling, ahora verás logs detallados en Vercel:

```
[Dashboard] Fetching metrics...
[Dashboard] Database connection OK
[Dashboard] Fetching today reservations...
```

Si falla, verás exactamente dónde:
```
[Dashboard] Database connection failed: relation "users" does not exist
```

## Checklist de Verificación

- [ ] `/api/db-test` retorna 200 OK
- [ ] Todas las tablas muestran `exists: true`
- [ ] `DATABASE_URL` y `DIRECT_URL` están configuradas en Vercel
- [ ] Supabase Dashboard muestra las tablas creadas
- [ ] Prisma Client está generado (`prisma generate`)
- [ ] Schema está aplicado (`prisma db push`)

## Siguientes Pasos

1. **Accede a `/api/db-test`** en tu preview deployment
2. **Revisa los logs de Vercel** para ver el error exacto
3. **Aplica el schema** si las tablas no existen
4. **Re-deploy** y verifica que el dashboard cargue

---

**Última actualización:** 2025-11-10
**Commit relacionado:** 20eb488 (Error handling fixes)
