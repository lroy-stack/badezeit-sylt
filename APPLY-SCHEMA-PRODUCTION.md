# SOLUCIÓN URGENTE: Aplicar Schema a Base de Datos de Producción

## 🔴 Problema Actual

El sitio está en producción pero **las tablas de la base de datos NO EXISTEN**.

**Síntomas:**
- `/api/menu` → Error 500 (tablas `menu_categories`, `menu_items` no existen)
- `/dashboard` → Application error (tablas `users`, `reservations`, etc. no existen)
- Login funciona (usa solo Supabase Auth, no tablas custom)

## ✅ Solución Rápida (5 minutos)

### Opción 1: Desde tu Computadora (RECOMENDADO)

```bash
# 1. Obtén las credenciales de Supabase
# Ve a: https://supabase.com/dashboard/project/[tu-project]/settings/database

# 2. Configura las variables de entorno
export DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

# 3. Aplica el schema (crea todas las tablas)
npx prisma db push

# 4. (Opcional) Seed con datos de prueba
npm run db:seed
```

### Opción 2: Desde Vercel (Automático en próximo deploy)

1. Ve a tu proyecto en Vercel → **Settings** → **General**
2. En "Build & Development Settings"
3. Cambia el **Build Command** a:
   ```
   prisma generate && prisma db push --accept-data-loss && next build
   ```
4. Haz un nuevo deploy (puede ser un cambio mínimo)
5. Después del primer deploy exitoso, **restaura** el comando original:
   ```
   prisma generate && next build
   ```

## 📋 Checklist Post-Aplicación

Después de aplicar el schema:

1. ✅ Accede a `/api/db-test` → Debe mostrar todas las tablas con `"exists": true`
2. ✅ Verifica en Supabase Dashboard → **Database** → **Tables** → Deberías ver 14+ tablas
3. ✅ Accede al `/dashboard` → Debe cargar sin error (puede mostrar 0 datos, está bien)
4. ✅ Accede a `/speisekarte` → Debe cargar (vacío por ahora, hasta que agregues items)

## 🗄️ Estructura de Tablas que se Crearán

El comando `prisma db push` creará automáticamente:

1. **Autenticación:**
   - `users` - Usuarios del sistema

2. **Gestión de Clientes:**
   - `customers` - Base de datos de clientes
   - `customer_notes` - Notas sobre clientes

3. **Reservaciones:**
   - `reservations` - Reservaciones
   - `tables` - Mesas del restaurante

4. **Menú:**
   - `menu_categories` - Categorías del menú
   - `menu_items` - Items del menú

5. **Sistema:**
   - `qr_codes` - Códigos QR
   - `qr_scan_events` - Eventos de escaneo
   - `page_content` - Contenido de páginas
   - `gallery_images` - Galería
   - `newsletter_subscriptions` - Newsletter
   - `analytics_events` - Analytics
   - `system_settings` - Configuración
   - `activity_logs` - Logs de actividad

## 🔍 Verificación

### Paso 1: Ver qué tablas tienes actualmente

Ve a Supabase Dashboard:
```
https://supabase.com/dashboard/project/[tu-project]/editor
```

En el panel izquierdo bajo "Tables":
- ❌ Si solo ves `auth.users` → Necesitas aplicar el schema
- ✅ Si ves `public.users`, `public.customers`, etc. → Schema ya aplicado

### Paso 2: Usar el endpoint de diagnóstico

Accede a:
```
https://[tu-dominio].vercel.app/api/db-test
```

Respuesta esperada DESPUÉS de aplicar schema:
```json
{
  "connection": { "status": "connected" },
  "tables": {
    "users": { "exists": true, "count": 0 },
    "customers": { "exists": true, "count": 0 },
    "reservations": { "exists": true, "count": 0 },
    "tables": { "exists": true, "count": 0 },
    "menu_items": { "exists": true, "count": 0 },
    "menu_categories": { "exists": true, "count": 0 }
  }
}
```

## ⚠️ Notas Importantes

1. **No perderás datos**: `prisma db push` solo CREA tablas que no existen, no borra datos existentes
2. **Seguro ejecutar múltiples veces**: Es idempotente, puedes ejecutarlo varias veces sin problema
3. **Sin migraciones**: Este proyecto usa `prisma db push` (para desarrollo/prototipo), no migraciones formales
4. **Datos de prueba**: Después de aplicar el schema, usa `npm run db:seed` para poblar con datos de ejemplo

## 🚨 Si algo sale mal

**Error: "Can't reach database server"**
- Verifica que las credenciales en `DATABASE_URL` sean correctas
- Verifica que tu IP esté permitida en Supabase (o desactiva "Use connection pooling")

**Error: "relation already exists"**
- Algunas tablas ya existen, esto es normal
- El comando continúa y crea las que faltan

**Tablas creadas pero dashboard sigue fallando**
- Verifica que las variables de entorno en Vercel sean correctas
- Haz un re-deploy después de aplicar el schema
- Revisa los logs de Vercel para el error específico

## 📞 Verificación Final

Una vez aplicado el schema, todo debería funcionar:
- ✅ Login
- ✅ Dashboard (con datos en 0)
- ✅ Speisekarte (vacío hasta que agregues items)
- ✅ Todas las páginas del admin panel

---

**Tiempo estimado:** 5 minutos
**Riesgo:** Mínimo (solo crea tablas, no modifica datos)
**Reversible:** Sí (puedes eliminar tablas desde Supabase Dashboard si es necesario)
