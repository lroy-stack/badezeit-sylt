'use client'

import { useState } from 'react'
import Head from 'next/head'
import { PublicLayout } from '@/components/layout/public-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Waves, 
  Heart,
  Award,
  Users,
  Clock,
  MapPin,
  Flame,
  Sparkles,
  ChefHat,
  Star
} from 'lucide-react'

export default function UeberUnsPage() {
  const [language, setLanguage] = useState<'de' | 'en'>('de')

  const content = {
    de: {
      title: "Über Strandrestaurant Badezeit",
      subtitle: "Direkt am Westerland Beach mit Blick auf die Nordsee - authentische maritime Küche seit Jahren",
      badge: "🌊 Wiedereröffnung 2025",
      historyTitle: "Unsere Geschichte",
      philosophyTitle: "Unsere Küche", 
      teamTitle: "Unser Team",
      valuesTitle: "Was uns ausmacht",
      awardsTitle: "Bewertungen & Auszeichnungen",
      ctaTitle: "Besuchen Sie uns bald wieder",
      ctaText: "Nach dem Brand arbeiten wir an der Wiedereröffnung 2025 - bleiben Sie auf dem Laufenden"
    },
    en: {
      title: "About Strandrestaurant Badezeit",
      subtitle: "Directly at Westerland Beach with North Sea views - authentic maritime cuisine for years",
      badge: "🌊 Reopening 2025",
      historyTitle: "Our Story",
      philosophyTitle: "Our Cuisine",
      teamTitle: "Our Team", 
      valuesTitle: "What defines us",
      awardsTitle: "Reviews & Recognition",
      ctaTitle: "Visit us again soon",
      ctaText: "After the fire we're working on reopening in 2025 - stay tuned"
    }
  }

  const geschichte = {
    de: {
      title: "Ein traditionsreiches Strandrestaurant",
      text: `Strandrestaurant Badezeit liegt direkt am Westerland Beach an der Dünenstraße 3 und ist seit Jahren ein beliebter Anlaufpunkt für Einheimische und Touristen. Unser Restaurant bietet authentische maritime Küche mit direktem Blick auf die Nordsee.

      Unter der Leitung von Norbert Mangelsen haben wir uns als Strandrestaurant mit mediterraner Küche etabliert. Wir servieren frischen Fisch, Fleischgerichte, Pasta, Salate und bieten auch Frühstück direkt am Strand an.
      
      Aufgrund eines Brandes ist das Restaurant derzeit geschlossen und befindet sich im Wiederaufbau. Die Wiedereröffnung ist für 2025 geplant. Wir freuen uns darauf, unsere Gäste bald wieder in gewohnter Qualität begrüßen zu dürfen.`,
      
      timeline: [
        { year: "Seit Jahren", event: "Etabliertes Strandrestaurant in Westerland" },
        { year: "Heute", event: "Geschlossen aufgrund von Brand" },
        { year: "2025", event: "Geplante Wiedereröffnung" },
        { year: "Zukunft", event: "Weiterhin beste maritime Küche auf Sylt" }
      ]
    },
    en: {
      title: "A Traditional Beach Restaurant", 
      text: `Strandrestaurant Badezeit is located directly at Westerland Beach on Dünenstraße 3 and has been a popular destination for locals and tourists for years. Our restaurant offers authentic maritime cuisine with direct views of the North Sea.

      Under the leadership of Norbert Mangelsen, we have established ourselves as a beach restaurant with Mediterranean cuisine. We serve fresh fish, meat dishes, pasta, salads and also offer breakfast directly on the beach.
      
      Due to a fire, the restaurant is currently closed and under reconstruction. Reopening is planned for 2025. We look forward to welcoming our guests again soon with our usual quality.`,
      
      timeline: [
        { year: "For years", event: "Established beach restaurant in Westerland" },
        { year: "Currently", event: "Closed due to fire" },
        { year: "2025", event: "Planned reopening" },
        { year: "Future", event: "Continuing best maritime cuisine on Sylt" }
      ]
    }
  }

  const philosophie = {
    de: {
      title: "Frische trifft Tradition",
      text: `Unsere Küche ist eine Hommage an die Nordsee und die reichen kulinarischen Traditionen Sylts. Wir arbeiten ausschließlich mit frischen, regionalen Zutaten – Fisch direkt von den Kuttern, Meeresfrüchte aus den sauberen Gewässern um Sylt und saisonales Gemüse von lokalen Bauernhöfen.

      Nachhaltigkeit ist nicht nur ein Wort für uns, sondern gelebte Praxis. Wir unterstützen lokale Fischer und Produzenten und achten darauf, dass unsere Speisekarte die Jahreszeiten und die natürlichen Zyklen der Nordsee widerspiegelt.`
    },
    en: {
      title: "Freshness Meets Tradition",
      text: `Our cuisine is a tribute to the North Sea and the rich culinary traditions of Sylt. We work exclusively with fresh, regional ingredients – fish directly from the cutters, seafood from the clean waters around Sylt and seasonal vegetables from local farms.

      Sustainability is not just a word for us, but lived practice. We support local fishermen and producers and ensure that our menu reflects the seasons and natural cycles of the North Sea.`
    }
  }

  const team = [
    {
      name: "Norbert Mangelsen",
      position: language === 'de' ? "Geschäftsführer & Inhaber" : "Managing Director & Owner",
      bio: language === 'de' 
        ? "Als Inhaber und Geschäftsführer leitet Norbert Mangelsen das Strandrestaurant Badezeit mit Leidenschaft und Expertise. Seine Vision: Authentische maritime Küche direkt am Westerland Beach."
        : "As owner and managing director, Norbert Mangelsen leads Strandrestaurant Badezeit with passion and expertise. His vision: authentic maritime cuisine directly at Westerland Beach.",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Unser Küchenteam", 
      position: language === 'de' ? "Kulinarische Experten" : "Culinary Experts",
      bio: language === 'de'
        ? "Unser erfahrenes Küchenteam bereitet täglich frische Gerichte mit Blick auf die Nordsee zu. Spezialisiert auf Fisch, mediterrane Küche und Strandrestaurant-Klassiker."
        : "Our experienced kitchen team prepares fresh dishes daily with views of the North Sea. Specialized in fish, Mediterranean cuisine and beach restaurant classics.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center"
    },
    {
      name: "Service Team",
      position: language === 'de' ? "Herzlicher Service" : "Warm Service", 
      bio: language === 'de'
        ? "Unser Serviceteam sorgt dafür, dass sich jeder Gast bei uns wohlfühlt. Mit lokaler Kenntnis und freundlicher Art machen wir jeden Besuch zu einem besonderen Erlebnis."
        : "Our service team ensures that every guest feels comfortable with us. With local knowledge and friendly manner, we make every visit a special experience.",
      image: "https://images.unsplash.com/photo-1554774853-b415df9eeb92?w=400&h=400&fit=crop&crop=center"
    },
    {
      name: "Wiedereröffnung 2025",
      position: language === 'de' ? "Wir kommen zurück" : "We're coming back",
      bio: language === 'de'
        ? "Nach dem Brand arbeiten wir intensiv am Wiederaufbau. 2025 werden wir stärker denn je zurückkehren - mit gewohnter Qualität und neuen Ideen für unsere Gäste."
        : "After the fire, we are working intensively on reconstruction. In 2025 we will return stronger than ever - with usual quality and new ideas for our guests.",
      image: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=400&h=400&fit=crop&crop=center"
    }
  ]

  const werte = {
    de: [
      {
        icon: Heart,
        title: "Leidenschaft",
        text: "Jedes Gericht wird mit Liebe und Hingabe zubereitet"
      },
      {
        icon: Waves,
        title: "Regionalität", 
        text: "Frische Zutaten direkt von Sylt und der Nordsee"
      },
      {
        icon: Users,
        title: "Gastfreundschaft",
        text: "Herzlicher Service und unvergessliche Erlebnisse"
      },
      {
        icon: Award,
        title: "Exzellenz",
        text: "Höchste Qualitätsstandards in Küche und Service"
      }
    ],
    en: [
      {
        icon: Heart,
        title: "Passion",
        text: "Every dish is prepared with love and dedication"
      },
      {
        icon: Waves,
        title: "Regional",
        text: "Fresh ingredients directly from Sylt and the North Sea"
      },
      {
        icon: Users,
        title: "Hospitality", 
        text: "Warm service and unforgettable experiences"
      },
      {
        icon: Award,
        title: "Excellence",
        text: "Highest quality standards in kitchen and service"
      }
    ]
  }

  const auszeichnungen = {
    de: [
      "⭐ TripAdvisor: 4 von 5 Sternen (394 Bewertungen)",
      "📍 Yelp: Beliebtes Strandrestaurant in Westerland", 
      "🏖️ Direkt am Westerland Beach - Traumlage",
      "🐟 Spezialisiert auf frischen Fisch und mediterrane Küche",
      "☕ Frühstück, Lunch und Dinner direkt am Strand",
      "🌊 Blick auf die Nordsee von jedem Tisch"
    ],
    en: [
      "⭐ TripAdvisor: 4 out of 5 stars (394 reviews)",
      "📍 Yelp: Popular beach restaurant in Westerland",
      "🏖️ Directly at Westerland Beach - Dream location", 
      "🐟 Specialized in fresh fish and Mediterranean cuisine",
      "☕ Breakfast, lunch and dinner directly on the beach",
      "🌊 North Sea view from every table"
    ]
  }

  return (
    <>
      <Head>
        <title>Über Uns - Strandrestaurant Badezeit | Westerland Beach Sylt</title>
        <meta name="description" content="Strandrestaurant Badezeit an der Dünenstraße 3 in Westerland - Authentische maritime Küche direkt am Strand. Wiedereröffnung 2025 nach Brand." />
        <meta name="keywords" content="Strandrestaurant Badezeit, Westerland Beach, Sylt Restaurant, Norbert Mangelsen, maritime Küche, Wiedereröffnung 2025" />
        <meta property="og:title" content="Über Uns - Strandrestaurant Badezeit" />
        <meta property="og:description" content="Traditionsreiches Strandrestaurant in Westerland mit Nordseeblick - Wiedereröffnung 2025" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="de_DE" />
      </Head>
      <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 xl:py-24 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/badezeit-in.webp)'
            }}
          />
        </div>
        
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {content[language].badge}
            </Badge>
            
            <h1 className="hero-title mb-6">
              {content[language].title}
            </h1>
            
            <p className="body-text text-white/90 max-w-2xl mx-auto mb-8">
              {content[language].subtitle}
            </p>

            {/* Language Toggle */}
            <div className="flex justify-center gap-2">
              <Button 
                variant={language === 'de' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('de')}
                className={language === 'de' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                Deutsch
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Geschichte Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Flame className="h-8 w-8 text-orange-500" />
                <h2 className="text-3xl font-bold">{content[language].historyTitle}</h2>
                <Sparkles className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <Card className="mb-12">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6 text-center">
                  {geschichte[language].title}
                </h3>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                  {geschichte[language].text}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {geschichte[language].timeline.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="text-2xl font-bold text-primary mb-2">{item.year}</div>
                    <p className="text-sm text-muted-foreground">{item.event}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Philosophie Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">{content[language].philosophyTitle}</h2>
            
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold mb-6">{philosophie[language].title}</h3>
                <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed">
                  {philosophie[language].text}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content[language].teamTitle}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lernen Sie die Menschen kennen, die Badezeit Sylt zu etwas Besonderem machen'
                : 'Meet the people who make Badezeit Sylt special'
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center">
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
                  <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Werte Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content[language].valuesTitle}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {werte[language].map((wert, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <wert.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">{wert.title}</h3>
                  <p className="text-sm text-muted-foreground">{wert.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Auszeichnungen Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content[language].awardsTitle}</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {auszeichnungen[language].map((award, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                      <span className="font-medium">{award}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">{content[language].ctaTitle}</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {content[language].ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <a href="/reservierung">
                <Clock className="mr-2 h-5 w-5" />
                {language === 'de' ? 'Tisch reservieren' : 'Make Reservation'}
              </a>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200" asChild>
              <a href="/speisekarte">
                <ChefHat className="mr-2 h-5 w-5" />
                {language === 'de' ? 'Speisekarte ansehen' : 'View Menu'}
              </a>
            </Button>
          </div>
        </div>
      </section>
      </PublicLayout>
    </>
  )
}