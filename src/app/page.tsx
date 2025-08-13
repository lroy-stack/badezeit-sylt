import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PublicLayout } from "@/components/layout/public-layout"
import { Phone, MapPin, Clock, ChefHat, Waves, Camera, Calendar, Star, Award, Users } from "lucide-react"

export default function HomePage() {
  return (
    <PublicLayout headerVariant="transparent">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-black/40 z-10" />
            {/* Hero image */}
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(https://ik.imagekit.io/insomnialz/Badezeit-1170x878.avif)'
              }}
            />
          </div>
          
          <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
            {/* Trust Signals */}
            <div className="flex justify-center items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">4.8/5</span>
                <span className="text-white/80">Google</span>
              </div>
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-white/80">TripAdvisor Zertifikat</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="text-white/80">500+ zufriedene Gäste/Monat</span>
              </div>
            </div>

            <Badge variant="outline" className="mb-6 text-white border-white/30 bg-white/10">
              🌊 #1 Meerblick Restaurant auf Sylt
            </Badge>
            
            <h1 className="hero-title mb-6 text-balance">
              Badezeit Sylt
            </h1>
            
            <p className="body-text mb-6 text-balance text-white/90 max-w-2xl mx-auto">
              Genießen Sie exquisite Küche mit atemberaubendem Meerblick. 
              Frischer Fisch, regionale Spezialitäten und unvergessliche Sonnenuntergänge.
            </p>

            {/* Urgency & Scarcity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-8 max-w-lg mx-auto">
              <p className="text-lg font-semibold mb-2">🔥 Heute nur noch 3 Tische verfügbar!</p>
              <p className="text-sm text-white/80">Reservieren Sie jetzt Ihren Tisch mit Meerblick</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg bg-white text-blue-900 hover:bg-white/90 font-semibold" asChild>
                <Link href="/reservierung">
                  <Calendar className="mr-2 h-5 w-5" />
                  Jetzt reservieren - verfügbare Zeiten
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-blue-900 shadow-lg transition-all duration-200" asChild>
                <Link href="/speisekarte">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Unsere Speisekarte entdecken
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-xs">
                      👤
                    </div>
                  ))}
                </div>
                <span className="text-white/80">23 Personen haben heute reserviert</span>
              </div>
              <div className="text-white/60">|</div>
              <span className="text-white/80">⚡ Durchschnittliche Antwort in 2 Minuten</span>
            </div>
          </div>

          {/* Floating contact info with urgency */}
          <div className="absolute bottom-8 left-8 text-white/80 hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-xs text-white/60 mb-2">SOFORT RESERVIEREN</div>
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                <span className="font-semibold">+49 4651 123456</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Strandweg 1, Kampen/Sylt</span>
              </div>
            </div>
          </div>

          {/* Floating availability notice */}
          <div className="absolute bottom-8 right-8 text-white/80 hidden lg:block">
            <div className="bg-green-600/20 backdrop-blur-sm rounded-lg p-4 border border-green-400/30">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold">Live verfügbar</span>
              </div>
              <div className="text-xs text-white/60 mt-1">Heute 19:30 - 21:00</div>
            </div>
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className="py-16 md:py-20 xl:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-primary text-primary-foreground">
                  ⭐ Seit 2018 #1 auf Sylt
                </Badge>
                
                <h2 className="section-title mb-6">
                  Warum Gäste Badezeit Sylt lieben
                </h2>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Waves className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title mb-2">🌊 Direkter Meerblick</h3>
                      <p className="text-muted-foreground">Genießen Sie Ihr Dinner mit unverbautem Blick auf die Nordsee. Jeder Tisch bietet Panoramablick.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <ChefHat className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title mb-2">👨‍🍳 Täglich frischer Fisch</h3>
                      <p className="text-muted-foreground">Unser Küchenchef wählt jeden Morgen persönlich die frischesten Zutaten von lokalen Fischern aus.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="card-title mb-2">⚡ Sofortige Bestätigung</h3>
                      <p className="text-muted-foreground">Reservieren Sie online und erhalten Sie sofort eine Bestätigung. Keine Wartezeiten.</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">4.8★</div>
                    <div className="text-sm text-muted-foreground">Google Bewertung</div>
                    <div className="text-xs text-green-600">+127 Bewertungen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">95%</div>
                    <div className="text-sm text-muted-foreground">Weiterempfehlung</div>
                    <div className="text-xs text-green-600">2.847 Gäste</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">2 Min</div>
                    <div className="text-sm text-muted-foreground">Antwortzeit</div>
                    <div className="text-xs text-green-600">Durchschnitt</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button className="flex-1" asChild>
                    <Link href="/reservierung">
                      <Calendar className="mr-2 h-4 w-4" />
                      Jetzt Tisch reservieren
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/ueber-uns">
                      Mehr über uns erfahren
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden mb-4">
                  <img 
                    src="https://ik.imagekit.io/insomnialz/badezeit-in.webp"
                    alt="Interior del restaurante Badezeit Sylt"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Customer testimonial */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">vor 2 Tagen</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    "Atemberaubender Meerblick und fantastisches Essen! Der Service war exceptional. 
                    Wir kommen definitiv wieder!"
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-semibold">
                      MK
                    </div>
                    <div>
                      <div className="text-sm font-medium">Maria K.</div>
                      <div className="text-xs text-muted-foreground">Verifizierter Gast</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Highlights */}
        <section className="py-16 md:py-20 xl:py-24 bg-primary">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-background text-primary">
                👨‍🍳 Küchenchef Empfehlungen - Heute verfügbar
              </Badge>
              
              <h2 className="section-title text-white mb-4">
                Unsere gefragtesten Spezialitäten
              </h2>
              
              <p className="body-text text-white/80 max-w-2xl mx-auto">
                Diese Gerichte reservieren 73% unserer Gäste im Voraus. 
                Jetzt probieren und verstehen warum!
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sylter Austernplatte",
                  description: "Frische Austern aus der Nordsee mit Schalotten-Vinaigrette und Schwarzbrot",
                  price: "€24,50",
                  originalPrice: "€28,00",
                  badge: "🌟 Bestseller",
                  popularity: "⚡ Heute 12x bestellt",
                  dietary: "🐟"
                },
                {
                  name: "Scholle Finkenwerder Art",
                  description: "Gebratene Nordseescholle mit Speck, Krabben und Petersilienkartoffeln",
                  price: "€28,90",
                  badge: "👑 Signature",
                  popularity: "🔥 Gäste-Favorit",
                  dietary: "🐟"
                },
                {
                  name: "Lammrücken Sylt",
                  description: "Mit Rosmarinjus, glasiertem Wurzelgemüse und Kartoffelgratin",
                  price: "€36,50",
                  badge: "🏆 Premium",
                  popularity: "⭐ 4.9/5 Sterne",
                  dietary: "🥩"
                }
              ].map((dish, index) => (
                <Card key={index} className="bg-white hover:shadow-xl transition-shadow border-2 hover:border-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className="bg-primary text-primary-foreground">{dish.badge}</Badge>
                      <div className="text-right">
                        <div className="text-xs text-green-600 font-semibold">{dish.popularity}</div>
                      </div>
                    </div>
                    
                    <h3 className="card-title mb-2 flex items-center gap-2">
                      {dish.name}
                      <span className="text-lg">{dish.dietary}</span>
                    </h3>
                    
                    <p className="small-text text-muted-foreground mb-4">
                      {dish.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="menu-price text-xl font-bold">{dish.price}</span>
                        {dish.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">{dish.originalPrice}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ⏱️ 15 Min
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      size="sm"
                      asChild
                    >
                      <Link href="/reservierung">
                        Reservieren & vorbestellen
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Social proof for menu */}
            <div className="text-center mt-8 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                <div className="text-white/90 text-sm">
                  💬 "Die Austernplatte ist ein Traum!" - Sarah M. (vor 1 Stunde)
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12 space-y-4">
              <Button size="lg" variant="outline" asChild>
                <Link href="/speisekarte">
                  <ChefHat className="mr-2 h-5 w-5" />
                  Vollständige Speisekarte ansehen
                </Link>
              </Button>
              
              <div className="text-white/70 text-sm">
                🎯 Über 40 weitere Gerichte verfügbar | ⏰ Küche bis 21:30 geöffnet
              </div>
            </div>
          </div>
        </section>

        {/* Opening Hours & Location */}
        <section className="py-16 md:py-20 xl:py-24">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Clock className="h-6 w-6 text-primary" />
                    <h3 className="subsection-title">Öffnungszeiten</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="font-medium">Montag - Sonntag</span>
                      <span>12:00 - 22:00</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Küche</span>
                      <span>12:00 - 21:30</span>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Reservierungen werden empfohlen, besonders während der Saison 
                        und für Tische mit Meerblick.
                      </p>
                    </div>
                  </div>
                  
                  <Button className="w-full mt-6" asChild>
                    <Link href="/reservierung">
                      <Calendar className="mr-2 h-4 w-4" />
                      Jetzt reservieren
                    </Link>
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h3 className="subsection-title">Anfahrt</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Badezeit Sylt</p>
                      <p className="text-muted-foreground">Strandweg 1</p>
                      <p className="text-muted-foreground">25999 Kampen/Sylt</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">
                        📞 +49 4651 123456<br/>
                        ✉️ info@badezeit-sylt.de
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Kostenlose Parkplätze direkt am Restaurant. 
                        Nur 2 Gehminuten zum Strand.
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-6" asChild>
                    <Link href="/kontakt">
                      <MapPin className="mr-2 h-4 w-4" />
                      Route planen
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 md:py-20 xl:py-24 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="section-title mb-6">
              Bereit für ein unvergessliches Erlebnis?
            </h2>
            
            <p className="body-text mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Reservieren Sie jetzt Ihren Tisch und erleben Sie die perfekte Kombination 
              aus exquisiter Küche und spektakulärem Meerblick.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="outline" className="bg-background text-primary hover:bg-background/90">
                <Link href="/reservierung" className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Online reservieren
                </Link>
              </Button>
              
              <Button variant="outline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                <Link href="tel:+4946511123456" className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  +49 4651 123456
                </Link>
              </Button>
            </div>
          </div>
        </section>

    </PublicLayout>
  )
}
