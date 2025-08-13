import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ContrastTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🎨 Prueba de Contraste WCAG</h1>
          <p className="text-muted-foreground text-lg">
            Testing visual de componentes con problemas de contraste identificados
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="destructive">Variables Problemáticas</Badge>
            <Badge variant="secondary">Contraste Límite</Badge>
            <Badge>Contraste OK</Badge>
          </div>
        </div>

        {/* Cards Testing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">📄 Card Components</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Título de Card Normal</CardTitle>
                <CardDescription>
                  Esta descripción usa text-muted-foreground con ratio ~2.8:1 - FALLA WCAG AA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contenido principal con foreground normal - contraste OK</p>
              </CardContent>
            </Card>
            
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Card con Border Enfatizado</CardTitle>
                <CardDescription>
                  Descripción con texto muted. ¿Se puede leer claramente?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Párrafo completo con muted-foreground</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Button Testing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">🔘 Button Components</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="destructive">Destructive Button</Button>
            <Button disabled>Disabled Button</Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium mb-3">En Fondo Muted:</h3>
              <div className="space-x-2">
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-3">Badges en Muted:</h3>
              <div className="space-x-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Form Components Testing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">📝 Form Components</h2>
          <div className="grid md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <h3 className="font-medium">Input Fields</h3>
              <div className="space-y-3">
                <div>
                  <Label>Label Normal</Label>
                  <Input placeholder="Placeholder con muted-foreground" />
                </div>
                <div>
                  <Label>Input con Valor</Label>
                  <Input value="Texto ingresado por usuario" />
                </div>
                <div>
                  <Label>Input Disabled</Label>
                  <Input disabled placeholder="Campo deshabilitado" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Select Components</h3>
              <div className="space-y-3">
                <div>
                  <Label>Select Normal</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una opción" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Opción 1</SelectItem>
                      <SelectItem value="2">Opción 2</SelectItem>
                      <SelectItem value="3">Opción 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Select con Valor</Label>
                  <Select defaultValue="selected">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selected">Opción Seleccionada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Color Swatches for Reference */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">🎨 Variables de Color Actuales</h2>
          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="space-y-3">
              <h3 className="font-medium">Principales</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background border-2 rounded"></div>
                  <span>background</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-foreground border-2 rounded"></div>
                  <span>foreground</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary border-2 rounded"></div>
                  <span>primary</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-destructive">Problemáticos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted border-2 rounded"></div>
                  <span>muted</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 rounded" style={{backgroundColor: 'var(--muted-foreground)'}}></div>
                  <span className="text-muted-foreground">muted-foreground (este texto)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border-2 border-border rounded bg-transparent"></div>
                  <span>border</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Secundarios</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-secondary border-2 rounded"></div>
                  <span>secondary</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent border-2 rounded"></div>
                  <span>accent</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive border-2 rounded"></div>
                  <span>destructive</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Instructions */}
        <section className="bg-muted p-6 rounded-lg">
          <h3 className="font-medium mb-3">📋 Instrucciones de Testing Visual</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Observa qué elementos son difíciles de leer o distinguir</li>
            <li>• Presta especial atención a placeholders, descripciones y bordes</li>
            <li>• Prueba tanto en modo claro como oscuro</li>
            <li>• Los elementos problemáticos deberían mejorar tras aplicar los ajustes OKLCH</li>
          </ul>
        </section>

      </div>
    </div>
  )
}