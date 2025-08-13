# Komponenten-Dokumentation - Strandrestaurant Badezeit

Diese Dokumentation beschreibt alle UI-Komponenten und deren Verwendung im Badezeit-System.

## 🧩 Komponentenarchitektur

### Design System Übersicht

Das Badezeit Design System basiert auf **shadcn/ui** und Tailwind CSS und folgt diesen Prinzipien:

- **Konsistenz**: Einheitliche Designsprache
- **Zugänglichkeit**: WCAG 2.1 AA konform
- **Responsive**: Mobile-first Ansatz
- **Themeable**: Unterstützung für Dark/Light Mode
- **Performant**: Optimiert für Core Web Vitals

### Komponentenhierarchie

```
src/components/
├── ui/                  # Basis UI-Komponenten (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/              # Layout-Komponenten
│   ├── header.tsx
│   ├── footer.tsx
│   ├── public-layout.tsx
│   └── dashboard-layout.tsx
└── features/            # Feature-spezifische Komponenten
    ├── reservation/
    ├── menu/
    └── contact/
```

## 🎨 UI-Komponenten (shadcn/ui)

### Button Component

**Datei**: `/src/components/ui/button.tsx`

#### Variants
```typescript
type ButtonVariant = 
  | 'default'      // Primärer Button (blau)
  | 'destructive'  // Gefährliche Aktionen (rot)
  | 'outline'      // Sekundärer Button (Rahmen)
  | 'secondary'    // Tertiärer Button (grau)
  | 'ghost'        // Transparenter Button
  | 'link'         // Link-Style Button

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'
```

#### Beispiele
```tsx
// Primärer Button
<Button>Reservierung bestätigen</Button>

// Outline Button für sekundäre Aktionen
<Button variant="outline">Abbrechen</Button>

// Große Button für Call-to-Actions
<Button size="lg" className="w-full">
  Jetzt reservieren
</Button>

// Icon Button
<Button variant="ghost" size="icon">
  <Menu className="h-4 w-4" />
</Button>

// Link als Button
<Button variant="link" asChild>
  <Link href="/speisekarte">Zur Speisekarte</Link>
</Button>
```

#### Accessibility Features
- Keyboard Navigation (Tab, Enter, Space)
- Screen Reader Support
- Focus Management
- Loading States

### Card Component

**Datei**: `/src/components/ui/card.tsx`

#### Struktur
```tsx
<Card>
  <CardHeader>
    <CardTitle>Titel</CardTitle>
    <CardDescription>Beschreibung</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Hauptinhalt */}
  </CardContent>
  <CardFooter>
    {/* Aktionen */}
  </CardFooter>
</Card>
```

#### Verwendungsbeispiele

**Restaurant Info Card:**
```tsx
<Card>
  <CardContent className="p-6">
    <div className="text-center mb-6">
      <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-4">Adresse</h3>
    </div>
    <div className="space-y-3 text-center">
      <p className="font-semibold text-lg">Strandrestaurant Badezeit</p>
      <p>Dünenstraße 3</p>
      <p>25980 Westerland/Sylt</p>
    </div>
  </CardContent>
</Card>
```

**Team Member Card:**
```tsx
<Card className="text-center">
  <CardContent className="p-6">
    <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
      <img 
        src={member.image} 
        alt={member.name}
        className="w-full h-full object-cover"
      />
    </div>
    <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
    <p className="text-primary text-sm font-medium mb-3">{member.position}</p>
    <p className="text-sm text-muted-foreground">{member.bio}</p>
  </CardContent>
</Card>
```

### Form Components

#### Input Component

**Datei**: `/src/components/ui/input.tsx`

```tsx
// Standard Input
<Input 
  type="email"
  placeholder="ihre.email@beispiel.de"
  required
/>

// Mit Label
<div className="space-y-2">
  <Label htmlFor="email">E-Mail-Adresse</Label>
  <Input 
    id="email"
    name="email"
    type="email"
    placeholder="ihre.email@beispiel.de"
  />
</div>

// Mit Fehlerbehandlung
<Input 
  type="email"
  placeholder="ihre.email@beispiel.de"
  className={errors.email ? 'border-red-500' : ''}
/>
{errors.email && (
  <p className="text-sm text-red-500 flex items-center gap-1">
    <AlertCircle className="h-4 w-4" />
    {errors.email[0]}
  </p>
)}
```

#### Textarea Component

**Datei**: `/src/components/ui/textarea.tsx`

```tsx
<Textarea
  placeholder="Teilen Sie uns Ihre Wünsche mit..."
  rows={5}
  className="resize-none"
/>
```

#### Select Component

**Datei**: `/src/components/ui/select.tsx`

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Tischpräferenz wählen" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="terrace-sea">Terrasse mit Meerblick</SelectItem>
    <SelectItem value="terrace-standard">Standard Terrasse</SelectItem>
    <SelectItem value="indoor-window">Innenbereich am Fenster</SelectItem>
    <SelectItem value="indoor-standard">Standard Innenbereich</SelectItem>
  </SelectContent>
</Select>
```

#### Checkbox Component

**Datei**: `/src/components/ui/checkbox.tsx`

```tsx
<div className="flex items-start space-x-2">
  <Checkbox 
    id="datenschutz" 
    name="datenschutz" 
    required
  />
  <Label 
    htmlFor="datenschutz" 
    className="text-sm font-normal leading-relaxed cursor-pointer"
  >
    Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
    <Link href="/datenschutz" className="text-primary hover:underline">
      Datenschutzerklärung
    </Link>{' '}
    zu. *
  </Label>
</div>
```

### Dialog Component

**Datei**: `/src/components/ui/dialog.tsx`

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Details anzeigen</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Reservierungsdetails</DialogTitle>
      <DialogDescription>
        Überprüfen Sie Ihre Reservierungsdaten
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      {/* Dialog Content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Abbrechen</Button>
      <Button>Bestätigen</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Badge Component

**Datei**: `/src/components/ui/badge.tsx`

```tsx
// Standard Badge
<Badge>Neu</Badge>

// Variant Badges
<Badge variant="secondary">Vegetarisch</Badge>
<Badge variant="destructive">Ausverkauft</Badge>
<Badge variant="outline">Empfehlung des Chefs</Badge>

// Custom Styling
<Badge className="bg-green-100 text-green-800">
  Verfügbar
</Badge>
```

## 🏗️ Layout-Komponenten

### Header Component

**Datei**: `/src/components/layout/header.tsx`

#### Features
- Responsive Navigation
- Mobile Menu (Hamburger)
- Logo und Branding
- CTA-Button für Reservierungen
- Sprachauswahl (geplant)

#### Struktur
```tsx
export function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-3 items-center h-16 md:h-20">
          {/* Logo */}
          <div className="flex justify-start">
            <Link href="/" className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl hidden sm:block">
                Badezeit
              </span>
            </Link>
          </div>
          
          {/* Navigation - Desktop */}
          <nav className="hidden md:flex justify-center">
            <div className="flex items-center space-x-8">
              <NavigationItems />
            </div>
          </nav>
          
          {/* CTA Button & Mobile Menu */}
          <div className="flex justify-end items-center space-x-4">
            <Button className="hidden md:flex" asChild>
              <Link href="/reservierung">
                <Calendar className="mr-2 h-4 w-4" />
                Reservieren
              </Link>
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <MobileMenu />
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
```

#### Navigation Items
```tsx
const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/ueber-uns', label: 'Über uns' },
  { href: '/speisekarte', label: 'Speisekarte' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/kontakt', label: 'Kontakt' }
]

function NavigationItems() {
  const pathname = usePathname()
  
  return (
    <>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href 
              ? "text-primary" 
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </>
  )
}
```

### Footer Component

**Datei**: `/src/components/layout/footer.tsx`

```tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Strandrestaurant Badezeit</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Dünenstraße 3</p>
              <p>25980 Westerland/Sylt</p>
              <p>Deutschland</p>
            </div>
          </div>
          
          {/* Kontakt */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Kontakt</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Tel: +49 4651 834020</p>
              <p>E-Mail: info@badezeit.de</p>
              <p>Web: www.badezeit.de</p>
            </div>
          </div>
          
          {/* Öffnungszeiten */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Öffnungszeiten</h3>
            <div className="text-sm text-gray-300">
              <p>Wiedereröffnung 2025</p>
              <p className="text-yellow-400 font-medium">
                Nach dem Brand arbeiten wir am Wiederaufbau
              </p>
            </div>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Folgen Sie uns</h3>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-300 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-gray-300 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 Strandrestaurant Badezeit. Alle Rechte vorbehalten.</p>
          <div className="mt-2 space-x-4">
            <Link href="/datenschutz" className="hover:text-white">
              Datenschutz
            </Link>
            <Link href="/impressum" className="hover:text-white">
              Impressum
            </Link>
            <Link href="/agb" className="hover:text-white">
              AGB
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
```

### Public Layout

**Datei**: `/src/components/layout/public-layout.tsx`

```tsx
export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
```

## 🎯 Feature-spezifische Komponenten

### Language Toggle Component

```tsx
interface LanguageToggleProps {
  language: 'de' | 'en'
  onLanguageChange: (language: 'de' | 'en') => void
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button 
        variant={language === 'de' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onLanguageChange('de')}
        className={language === 'de' 
          ? 'bg-white text-primary' 
          : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary'
        }
      >
        Deutsch
      </Button>
      <Button 
        variant={language === 'en' ? 'default' : 'outline'} 
        size="sm"
        onClick={() => onLanguageChange('en')}
        className={language === 'en' 
          ? 'bg-white text-primary' 
          : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary'
        }
      >
        English
      </Button>
    </div>
  )
}
```

### Hero Section Component

```tsx
interface HeroSectionProps {
  backgroundImage: string
  badge?: string
  title: string
  subtitle?: string
  children?: React.ReactNode
}

export function HeroSection({
  backgroundImage,
  badge,
  title,
  subtitle,
  children
}: HeroSectionProps) {
  return (
    <section className="relative py-16 md:py-20 xl:py-24 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      </div>
      
      <div className="relative z-20 container mx-auto px-4">
        <div className="text-center mb-12">
          {badge && (
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {badge}
            </Badge>
          )}
          
          <h1 className="hero-title mb-6">{title}</h1>
          
          {subtitle && (
            <p className="body-text text-white/90 max-w-2xl mx-auto mb-8">
              {subtitle}
            </p>
          )}
          
          {children}
        </div>
      </div>
    </section>
  )
}
```

### Contact Form Component

```tsx
interface ContactFormProps {
  language: 'de' | 'en'
}

export function ContactForm({ language }: ContactFormProps) {
  const [state, formAction, pending] = useActionState(sendContactForm, { message: '' })
  
  if (state?.success) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-green-700">
          {language === 'de' ? 'Nachricht gesendet!' : 'Message sent!'}
        </h3>
        <p className="text-muted-foreground mb-6">{state.message}</p>
        <Button onClick={() => window.location.reload()}>
          {language === 'de' ? 'Neue Nachricht senden' : 'Send new message'}
        </Button>
      </div>
    )
  }
  
  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="language" value={language} />
      
      {/* Name and Email Row */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label={language === 'de' ? 'Name' : 'Name'}
          name="name"
          type="text"
          placeholder={language === 'de' ? 'Ihr vollständiger Name' : 'Your full name'}
          required
          error={state?.errors?.name?.[0]}
        />
        
        <FormField
          label={language === 'de' ? 'E-Mail' : 'Email'}
          name="email"
          type="email"
          placeholder={language === 'de' ? 'ihre.email@beispiel.de' : 'your.email@example.com'}
          required
          error={state?.errors?.email?.[0]}
        />
      </div>
      
      {/* Subject and Phone */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label={language === 'de' ? 'Telefon (optional)' : 'Phone (optional)'}
          name="telefon"
          type="tel"
          placeholder="+49 123 456789"
        />
        
        <FormField
          label={language === 'de' ? 'Betreff' : 'Subject'}
          name="betreff"
          type="text"
          placeholder={language === 'de' ? 'Worum geht es?' : 'What is this about?'}
          required
          error={state?.errors?.betreff?.[0]}
        />
      </div>
      
      {/* Message */}
      <FormField
        label={language === 'de' ? 'Nachricht' : 'Message'}
        name="nachricht"
        type="textarea"
        placeholder={language === 'de' 
          ? 'Teilen Sie uns mit, wie wir Ihnen helfen können...'
          : 'Tell us how we can help you...'
        }
        rows={5}
        required
        error={state?.errors?.nachricht?.[0]}
      />
      
      {/* Privacy Checkbox */}
      <PrivacyCheckbox language={language} error={state?.errors?.datenschutz} />
      
      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full" 
        size="lg"
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            {language === 'de' ? 'Nachricht senden' : 'Send Message'}
          </>
        )}
      </Button>
    </form>
  )
}
```

### Form Field Component

```tsx
interface FormFieldProps {
  label: string
  name: string
  type: 'text' | 'email' | 'tel' | 'textarea'
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
}

function FormField({ 
  label, 
  name, 
  type, 
  placeholder, 
  required, 
  error,
  rows 
}: FormFieldProps) {
  const inputId = `field-${name}`
  
  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label} {required && '*'}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={error ? 'border-red-500' : ''}
        />
      ) : (
        <Input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={error ? 'border-red-500' : ''}
        />
      )}
      
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  )
}
```

## 🎨 Design Tokens

### Colors

```css
/* Tailwind CSS Custom Colors */
:root {
  --primary: 210 100% 50%;        /* Badezeit Blau */
  --primary-foreground: 0 0% 100%; /* Weiß */
  
  --secondary: 210 40% 96%;        /* Helles Grau */
  --secondary-foreground: 210 40% 8%; /* Dunkles Grau */
  
  --muted: 210 40% 96%;            /* Gedämpft */
  --muted-foreground: 210 6% 46%;  /* Gedämpfter Text */
  
  --destructive: 0 84% 60%;        /* Rot für Fehler */
  --destructive-foreground: 0 0% 100%; /* Weiß */
  
  --border: 210 20% 90%;           /* Rahmenfarbe */
  --ring: 210 100% 50%;            /* Focus Ring */
}

.dark {
  --primary: 210 100% 60%;
  --primary-foreground: 210 20% 14%;
  /* ... Dark Mode Varianten */
}
```

### Typography

```css
/* Custom Typography Classes */
.hero-title {
  @apply text-4xl md:text-5xl lg:text-6xl font-bold leading-tight;
}

.section-title {
  @apply text-2xl md:text-3xl font-bold mb-4;
}

.body-text {
  @apply text-lg leading-relaxed;
}

.small-text {
  @apply text-sm text-muted-foreground;
}
```

### Spacing & Layout

```css
/* Container */
.container {
  @apply mx-auto px-4 max-w-7xl;
}

/* Section Spacing */
.section-spacing {
  @apply py-16 md:py-20 lg:py-24;
}

/* Card Spacing */
.card-padding {
  @apply p-6 lg:p-8;
}
```

## 📱 Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile Landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large Desktop
  '2xl': '1536px' // Extra Large
}
```

### Component Responsive Patterns

```tsx
// Grid responsive pattern
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Typography responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
  Responsive Heading
</h1>

// Spacing responsive
<section className="py-8 md:py-12 lg:py-16">
  Content
</section>

// Hide/Show responsive
<div className="hidden md:block">Desktop only content</div>
<div className="block md:hidden">Mobile only content</div>
```

## ♿ Accessibility

### ARIA Labels

```tsx
// Button mit ARIA
<Button
  aria-label="Menü öffnen"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
>
  <Menu className="h-6 w-6" />
</Button>

// Form mit ARIA
<input
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
  {...register("email")}
/>
{errors.email && (
  <p id="email-error" role="alert" className="text-red-500">
    {errors.email.message}
  </p>
)}
```

### Keyboard Navigation

```tsx
// Custom Keyboard Handler
function useKeyboardNavigation() {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal()
      }
      if (event.key === 'Tab') {
        // Focus Management
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
}
```

### Screen Reader Support

```tsx
// Live Region für Announcements
<div 
  aria-live="polite" 
  aria-atomic="true"
  className="sr-only"
>
  {statusMessage}
</div>

// Skip Links
<a 
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-white p-2 z-50"
>
  Zum Hauptinhalt springen
</a>
```

## 🧪 Testing Guidelines

### Component Testing

```tsx
// Button Component Test
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })
  
  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
  
  it('applies correct variant styles', () => {
    render(<Button variant="destructive">Delete</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })
})
```

### Visual Regression Testing

```bash
# Storybook für Visual Testing
npm run storybook

# Chromatic für Visual Regression
npm run chromatic
```

## 📚 Verwendungsrichtlinien

### Do's ✅

- **Konsistente Spacing**: Immer Tailwind Spacing-Klassen verwenden
- **Semantic HTML**: Korrekte HTML-Elemente für Semantik
- **Accessibility**: ARIA-Labels und Keyboard Navigation
- **Mobile First**: Responsive Design von klein zu groß
- **Type Safety**: Immer TypeScript Interfaces definieren

### Don'ts ❌

- **Inline Styles**: Keine style-Props verwenden
- **CSS-in-JS**: Keine styled-components o.ä.
- **Magic Numbers**: Keine harten Pixel-Werte
- **Vendor Prefixes**: Tailwind übernimmt das
- **!important**: Vermeiden durch bessere Spezifität

### Best Practices

1. **Component Composition über Inheritance**
2. **Props Interface für jede Komponente**
3. **Dokumentation mit Storybook**
4. **Accessibility Testing**
5. **Performance Monitoring**

---

Diese Komponenten-Dokumentation sollte regelmäßig aktualisiert werden, wenn neue Komponenten hinzugefügt oder bestehende geändert werden.