# 🔍 Variables Problemáticas - Mapeo de Componentes

## 📋 **Variables Críticas Identificadas y Su Uso**

### **🚨 Alta Prioridad - WCAG AA Failures**

#### **`--muted-foreground` (Ratio: ~2.8:1 vs muted)**
**Componentes afectados:**
- ✅ `Card.tsx` - `CardDescription` (línea 45): `text-muted-foreground`
- ✅ `Input.tsx` - Placeholder (línea 11): `placeholder:text-muted-foreground`  
- ✅ `Select.tsx` - Multiple locations:
  - `SelectTrigger` placeholder (línea 40): `data-[placeholder]:text-muted-foreground`
  - `SelectTrigger` icons (línea 40): `[&_svg:not([class*='text-'])]:text-muted-foreground`
  - `SelectLabel` (línea 95): `text-muted-foreground`
  - `SelectItem` icons (línea 110): `[&_svg:not([class*='text-'])]:text-muted-foreground`

**Impacto:** Texto de descripción, placeholders y iconos con contraste insuficiente

---

#### **`--border` (Ratio: ~1.8:1 vs background)**  
**Componentes afectados:**
- ✅ `Button.tsx` - Variant outline (línea 17): `border`
- ✅ `Input.tsx` - Border (línea 11): `border-input` (usa `--input` que es similar)
- ✅ `Select.tsx` - Multiple locations:
  - `SelectTrigger` (línea 40): `border-input`
  - `SelectSeparator` (línea 132): `bg-border`
- ✅ `Badge.tsx` - Base styles (línea 8): `border`
- ✅ `Card.tsx` - Card border (línea 10): `border`

**Impacto:** Bordes de componentes no visibles o difíciles de distinguir

---

#### **`--input` (Ratio: ~1.5:1 vs background)**
**Componentes afectados:**
- ✅ `Input.tsx` - Background dark mode (línea 11): `dark:bg-input/30`
- ✅ `Select.tsx` - Multiple locations:
  - `SelectTrigger` background (línea 40): `dark:bg-input/30`
  - `SelectTrigger` hover (línea 40): `dark:hover:bg-input/50`

**Impacto:** Campos de entrada con fondo poco contrastante en modo oscuro

---

### **⚠️ Media Prioridad - Límite WCAG AA**

#### **`--secondary-foreground` (Ratio: ~4.0:1 vs secondary)**
**Componentes afectados:**
- ✅ `Button.tsx` - Variant secondary (línea 19): `text-secondary-foreground`
- ✅ `Badge.tsx` - Variant secondary (línea 15): `text-secondary-foreground`

**Impacto:** Botones y badges secundarios en el límite de legibilidad

---

### **🎯 Variables Saludables (No requieren cambio)**

#### **Variables que cumplen WCAG AA:**
- ✅ `--primary` / `--primary-foreground` - Ratio ~8.5:1 ✅
- ✅ `--foreground` / `--background` - Ratio ~13:1 ✅  
- ✅ `--destructive` / `--destructive-foreground` - Ratio ~8:1 ✅
- ✅ `--accent` / `--accent-foreground` - Ratio ~6:1 ✅

---

## 🎨 **Componentes con Estados Específicos a Revisar**

### **Button.tsx - Estados Problemáticos**
- `outline` variant: Border visibility issues
- `ghost` variant hover: `hover:bg-accent` - verificar contraste
- `secondary` variant: Text contrast marginal

### **Card.tsx - Elementos Problemáticos**  
- `CardDescription`: Usa `text-muted-foreground` - contraste insuficiente
- Card border: Puede ser difícil de distinguir del background

### **Form Components (Input, Select) - Problemas Múltiples**
- Placeholder text: `text-muted-foreground` - ilegible
- Borders: `border-input` - invisible
- Dark mode backgrounds: `bg-input/30` - sin contraste
- Icon colors: `text-muted-foreground` - no distinguibles

---

## 📊 **Impacto por Tipo de Componente**

| Tipo | Componentes Afectados | Variables Problemáticas | Severidad |
|------|---------------------|------------------------|-----------|
| **Form Controls** | Input, Select | `muted-foreground`, `border`, `input` | 🚨 Crítica |
| **Content Display** | Card | `muted-foreground`, `border` | 🚨 Alta |  
| **Interactive** | Button | `border`, `secondary-foreground` | ⚠️ Media |
| **Status** | Badge | `secondary-foreground` | ⚠️ Media |

---

## 🔧 **Próximas Acciones Requeridas**

1. **Ajustar `--muted-foreground`** - Afecta 7 ubicaciones en 3 componentes
2. **Mejorar `--border/--input`** - Afecta 6 ubicaciones en 4 componentes  
3. **Optimizar `--secondary-foreground`** - Afecta 2 ubicaciones en 2 componentes
4. **Testing visual completo** de todos los componentes listados

---

*Próximo: Implementar testing visual y comenzar ajustes de valores OKLCH*