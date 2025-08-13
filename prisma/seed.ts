import { PrismaClient, UserRole, TableLocation, TableShape, ReservationStatus, ReservationSource, Language, GalleryCategory, AnalyticsEventType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌊 Seeding Badezeit Sylt database...')

  // Create system admin user
  const adminUser = await prisma.user.create({
    data: {
      clerkId: 'admin_badezeit_sylt',
      email: 'admin@badezeit-sylt.de',
      firstName: 'Hans',
      lastName: 'Müller',
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  // Create staff users
  const managerUser = await prisma.user.create({
    data: {
      clerkId: 'manager_badezeit_sylt',
      email: 'manager@badezeit-sylt.de', 
      firstName: 'Anna',
      lastName: 'Schmidt',
      role: UserRole.MANAGER,
      isActive: true,
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      clerkId: 'staff_badezeit_sylt',
      email: 'service@badezeit-sylt.de',
      firstName: 'Klaus',
      lastName: 'Weber',
      role: UserRole.STAFF,
      isActive: true,
    },
  })

  const kitchenUser = await prisma.user.create({
    data: {
      clerkId: 'kitchen_badezeit_sylt',
      email: 'kueche@badezeit-sylt.de',
      firstName: 'Maria',
      lastName: 'Fischer',
      role: UserRole.KITCHEN,
      isActive: true,
    },
  })

  console.log('✅ Users created')

  // Create tables with German restaurant layout
  const tables = []
  
  // Terrace tables with sea view (premium)
  for (let i = 1; i <= 8; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        capacity: i <= 4 ? 2 : 4,
        location: TableLocation.TERRACE_SEA_VIEW,
        isActive: true,
        description: `Terrassen-Tisch mit direktem Meerblick`,
        xPosition: 50 + (i % 4) * 100,
        yPosition: 50,
        shape: i % 3 === 0 ? TableShape.ROUND : TableShape.RECTANGLE,
      },
    })
    tables.push(table)
  }

  // Standard terrace tables
  for (let i = 9; i <= 16; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        capacity: i <= 12 ? 4 : 6,
        location: TableLocation.TERRACE_STANDARD,
        isActive: true,
        description: `Terrassen-Tisch`,
        xPosition: 50 + ((i - 9) % 4) * 100,
        yPosition: 150,
        shape: i % 2 === 0 ? TableShape.ROUND : TableShape.RECTANGLE,
      },
    })
    tables.push(table)
  }

  // Indoor window tables
  for (let i = 17; i <= 24; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        capacity: i <= 20 ? 2 : 4,
        location: TableLocation.INDOOR_WINDOW,
        isActive: true,
        description: `Fenster-Tisch innen`,
        xPosition: 50 + ((i - 17) % 4) * 100,
        yPosition: 250,
        shape: TableShape.RECTANGLE,
      },
    })
    tables.push(table)
  }

  // Indoor standard tables
  for (let i = 25; i <= 35; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        capacity: i <= 30 ? 4 : 6,
        location: TableLocation.INDOOR_STANDARD,
        isActive: true,
        description: `Innentisch`,
        xPosition: 50 + ((i - 25) % 5) * 80,
        yPosition: 350,
        shape: i % 3 === 0 ? TableShape.ROUND : TableShape.RECTANGLE,
      },
    })
    tables.push(table)
  }

  // Bar area tables
  for (let i = 36; i <= 40; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        capacity: 2,
        location: TableLocation.BAR_AREA,
        isActive: true,
        description: `Bar-Tisch`,
        xPosition: 100 + ((i - 36) * 50),
        yPosition: 450,
        shape: TableShape.SQUARE,
      },
    })
    tables.push(table)
  }

  console.log('✅ Tables created')

  // Create menu categories (German cuisine)
  const vorspeisen = await prisma.menuCategory.create({
    data: {
      name: 'Vorspeisen',
      nameEn: 'Appetizers',
      description: 'Feine Vorspeisen aus frischen regionalen Zutaten',
      descriptionEn: 'Fine appetizers from fresh regional ingredients',
      displayOrder: 1,
      isActive: true,
      icon: '🥗',
    },
  })

  const suppen = await prisma.menuCategory.create({
    data: {
      name: 'Suppen',
      nameEn: 'Soups',
      description: 'Hausgemachte Suppen nach traditionellen Rezepten',
      descriptionEn: 'Homemade soups following traditional recipes',
      displayOrder: 2,
      isActive: true,
      icon: '🍲',
    },
  })

  const fischGerichte = await prisma.menuCategory.create({
    data: {
      name: 'Fisch & Meeresfrüchte',
      nameEn: 'Fish & Seafood',
      description: 'Täglich frischer Fisch direkt aus der Nordsee',
      descriptionEn: 'Daily fresh fish directly from the North Sea',
      displayOrder: 3,
      isActive: true,
      icon: '🐟',
    },
  })

  const fleischGerichte = await prisma.menuCategory.create({
    data: {
      name: 'Fleisch & Wild',
      nameEn: 'Meat & Game',
      description: 'Erstklassiges Fleisch und Wild aus der Region',
      descriptionEn: 'Premium meat and game from the region',
      displayOrder: 4,
      isActive: true,
      icon: '🥩',
    },
  })

  const vegetarisch = await prisma.menuCategory.create({
    data: {
      name: 'Vegetarisch',
      nameEn: 'Vegetarian',
      description: 'Kreative vegetarische Gerichte mit saisonalem Gemüse',
      descriptionEn: 'Creative vegetarian dishes with seasonal vegetables',
      displayOrder: 5,
      isActive: true,
      icon: '🥕',
    },
  })

  const desserts = await prisma.menuCategory.create({
    data: {
      name: 'Desserts',
      nameEn: 'Desserts',
      description: 'Süße Verführungen unserer Patisserie',
      descriptionEn: 'Sweet temptations from our patisserie',
      displayOrder: 6,
      isActive: true,
      icon: '🍰',
    },
  })

  const getraenke = await prisma.menuCategory.create({
    data: {
      name: 'Getränke',
      nameEn: 'Beverages',
      description: 'Erlesene Weine und hausgemachte Getränke',
      descriptionEn: 'Exquisite wines and homemade beverages',
      displayOrder: 7,
      isActive: true,
      icon: '🍷',
    },
  })

  console.log('✅ Menu categories created')

  // Create menu items with German dishes
  const menuItems = [
    // Vorspeisen
    {
      categoryId: vorspeisen.id,
      name: 'Sylter Austernplatte',
      nameEn: 'Sylt Oyster Plate',
      description: 'Frische Austern aus der Nordsee mit Schalotten-Vinaigrette und Schwarzbrot',
      descriptionEn: 'Fresh North Sea oysters with shallot vinaigrette and dark bread',
      price: 24.50,
      isSignature: true,
      containsFish: true,
      containsMollusks: true,
      containsGluten: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: vorspeisen.id,
      name: 'Nordfriesischer Matjes',
      nameEn: 'North Frisian Matjes',
      description: 'Hausgebeizt mit Dill, Zwiebeln und neuen Kartoffeln',
      descriptionEn: 'House-cured with dill, onions and new potatoes',
      price: 16.80,
      containsFish: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },
    {
      categoryId: vorspeisen.id,
      name: 'Krabbencocktail Sylt',
      nameEn: 'Sylt Shrimp Cocktail',
      description: 'Nordseekrabben mit Avocado und hausgemachter Cocktailsauce',
      descriptionEn: 'North Sea shrimp with avocado and homemade cocktail sauce',
      price: 19.50,
      containsShellfish: true,
      containsEggs: true,
      images: [],
      displayOrder: 3,
      createdById: adminUser.id,
    },

    // Suppen
    {
      categoryId: suppen.id,
      name: 'Sylter Kartoffelsuppe',
      nameEn: 'Sylt Potato Soup',
      description: 'Mit geräuchertem Aal und Kräutern',
      descriptionEn: 'With smoked eel and herbs',
      price: 12.50,
      isSignature: true,
      containsFish: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: suppen.id,
      name: 'Fischsuppe Badezeit',
      nameEn: 'Badezeit Fish Soup',
      description: 'Kraftvolle Bouillabaisse mit Nordsee-Fischen und Safran',
      descriptionEn: 'Hearty bouillabaisse with North Sea fish and saffron',
      price: 15.90,
      containsFish: true,
      containsShellfish: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },

    // Fisch & Meeresfrüchte
    {
      categoryId: fischGerichte.id,
      name: 'Scholle Finkenwerder Art',
      nameEn: 'Plaice Finkenwerder Style',
      description: 'Gebratene Nordseescholle mit Speck, Krabben und Petersilienkartoffeln',
      descriptionEn: 'Pan-fried North Sea plaice with bacon, shrimp and parsley potatoes',
      price: 28.90,
      isSignature: true,
      containsFish: true,
      containsShellfish: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: fischGerichte.id,
      name: 'Steinbutt vom Grill',
      nameEn: 'Grilled Turbot',
      description: 'Mit Meerfenchel, Zitronen-Thymian-Butter und Gemüse der Saison',
      descriptionEn: 'With sea fennel, lemon thyme butter and seasonal vegetables',
      price: 34.50,
      containsFish: true,
      containsMilk: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },
    {
      categoryId: fischGerichte.id,
      name: 'Hummer thermidor',
      nameEn: 'Lobster Thermidor',
      description: 'Gratiniert mit Cognac-Sauce und französischen Kräutern',
      descriptionEn: 'Gratinated with cognac sauce and French herbs',
      price: 42.00,
      containsShellfish: true,
      containsMilk: true,
      containsEggs: true,
      images: [],
      displayOrder: 3,
      createdById: adminUser.id,
    },

    // Fleisch & Wild
    {
      categoryId: fleischGerichte.id,
      name: 'Lammrücken Sylt',
      nameEn: 'Rack of Lamb Sylt',
      description: 'Mit Rosmarinjus, glasiertem Wurzelgemüse und Kartoffelgratin',
      descriptionEn: 'With rosemary jus, glazed root vegetables and potato gratin',
      price: 36.50,
      containsMilk: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: fleischGerichte.id,
      name: 'Rehrücken mit Wacholder',
      nameEn: 'Venison with Juniper',
      description: 'Sous-vide gegart mit Wacholder-Sauce und Herbstgemüse',
      descriptionEn: 'Sous-vide cooked with juniper sauce and autumn vegetables',
      price: 38.00,
      isSeasonalSpecial: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },

    // Vegetarisch
    {
      categoryId: vegetarisch.id,
      name: 'Gemüse-Tarte mit Ziegenkäse',
      nameEn: 'Vegetable Tart with Goat Cheese',
      description: 'Saisonales Gemüse mit Ziegenkäse und Walnüssen auf Blätterteig',
      descriptionEn: 'Seasonal vegetables with goat cheese and walnuts on puff pastry',
      price: 22.50,
      isVegetarian: true,
      containsMilk: true,
      containsGluten: true,
      containsNuts: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: vegetarisch.id,
      name: 'Vegane Buddha Bowl',
      nameEn: 'Vegan Buddha Bowl',
      description: 'Mit Quinoa, geröstetem Gemüse, Avocado und Tahini-Dressing',
      descriptionEn: 'With quinoa, roasted vegetables, avocado and tahini dressing',
      price: 19.80,
      isVegan: true,
      isVegetarian: true,
      containsSesame: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },

    // Desserts
    {
      categoryId: desserts.id,
      name: 'Rote Grütze mit Vanillesauce',
      nameEn: 'Red Berry Pudding with Vanilla Sauce',
      description: 'Klassische Rote Grütze aus regionalen Beeren mit hausgemachter Vanillesauce',
      descriptionEn: 'Classic red berry pudding from regional berries with homemade vanilla sauce',
      price: 9.50,
      isSignature: true,
      containsMilk: true,
      images: [],
      displayOrder: 1,
      createdById: adminUser.id,
    },
    {
      categoryId: desserts.id,
      name: 'Schokoladen-Tarte',
      nameEn: 'Chocolate Tart',
      description: 'Dunkle Schokoladen-Tarte mit Meersalz und Himbeeren',
      descriptionEn: 'Dark chocolate tart with sea salt and raspberries',
      price: 11.50,
      containsMilk: true,
      containsGluten: true,
      containsEggs: true,
      images: [],
      displayOrder: 2,
      createdById: adminUser.id,
    },
  ]

  // Create all menu items
  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item })
  }

  console.log('✅ Menu items created')

  // Create sample customers (GDPR compliant)
  const customers = [
    {
      firstName: 'Michael',
      lastName: 'Hoffmann',
      email: 'michael.hoffmann@email.de',
      phone: '+49 40 12345678',
      language: Language.DE,
      preferredLocation: TableLocation.TERRACE_SEA_VIEW,
      totalVisits: 5,
      totalSpent: 450.75,
      averagePartySize: 2,
      isVip: true,
      emailConsent: true,
      dataProcessingConsent: true,
      consentDate: new Date(),
    },
    {
      firstName: 'Sarah',
      lastName: 'Zimmermann',
      email: 'sarah.zimmermann@email.de',
      phone: '+49 30 87654321',
      language: Language.DE,
      preferredLocation: TableLocation.INDOOR_WINDOW,
      totalVisits: 3,
      totalSpent: 280.50,
      averagePartySize: 4,
      dietaryRestrictions: ['vegetarisch'],
      emailConsent: true,
      marketingConsent: true,
      dataProcessingConsent: true,
      consentDate: new Date(),
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@email.com',
      phone: '+44 20 12345678',
      language: Language.EN,
      preferredLocation: TableLocation.TERRACE_SEA_VIEW,
      totalVisits: 2,
      totalSpent: 320.00,
      averagePartySize: 2,
      allergies: 'Nüsse',
      emailConsent: false,
      dataProcessingConsent: true,
      consentDate: new Date(),
    },
    {
      firstName: 'Lisa',
      lastName: 'Müller',
      email: 'lisa.mueller@email.de',
      phone: '+49 40 11223344',
      language: Language.DE,
      preferredLocation: TableLocation.INDOOR_STANDARD,
      totalVisits: 8,
      totalSpent: 680.25,
      averagePartySize: 3,
      isVip: true,
      emailConsent: true,
      smsConsent: true,
      marketingConsent: true,
      dataProcessingConsent: true,
      consentDate: new Date(),
    },
  ]

  const createdCustomers = []
  for (const customer of customers) {
    const createdCustomer = await prisma.customer.create({ data: customer })
    createdCustomers.push(createdCustomer)
  }

  console.log('✅ Customers created')

  // Create sample reservations
  const now = new Date()
  const reservations = [
    {
      customerId: createdCustomers[0].id,
      tableId: tables[0].id, // Terrace sea view table
      dateTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
      partySize: 2,
      duration: 120,
      status: ReservationStatus.CONFIRMED,
      source: ReservationSource.WEBSITE,
      occasion: 'Hochzeitstag',
      isConfirmed: true,
      createdById: staffUser.id,
    },
    {
      customerId: createdCustomers[1].id,
      tableId: tables[10].id,
      dateTime: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      partySize: 4,
      duration: 150,
      status: ReservationStatus.PENDING,
      source: ReservationSource.PHONE,
      specialRequests: 'Vegetarische Optionen gewünscht',
      createdById: staffUser.id,
    },
    {
      customerId: createdCustomers[2].id,
      tableId: tables[2].id,
      dateTime: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Next week
      partySize: 2,
      duration: 120,
      status: ReservationStatus.CONFIRMED,
      source: ReservationSource.WEBSITE,
      dietaryNotes: 'Keine Nüsse',
      isConfirmed: true,
      createdById: managerUser.id,
    },
    {
      customerId: createdCustomers[3].id,
      tableId: tables[20].id,
      dateTime: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // Two weeks
      partySize: 3,
      duration: 180,
      status: ReservationStatus.CONFIRMED,
      source: ReservationSource.WEBSITE,
      occasion: 'Geburtstag',
      specialRequests: 'Dessert-Überraschung',
      isConfirmed: true,
      createdById: staffUser.id,
    },
  ]

  for (const reservation of reservations) {
    await prisma.reservation.create({ data: reservation })
  }

  console.log('✅ Reservations created')

  // Create QR codes for tables
  for (const table of tables.slice(0, 10)) { // QR codes for first 10 tables
    await prisma.qRCode.create({
      data: {
        tableId: table.id,
        code: `BADEZEIT_TABLE_${table.number}_${Date.now()}`,
        isActive: true,
      },
    })
  }

  console.log('✅ QR codes created')

  // Create gallery images
  const galleryImages = [
    {
      title: 'Restaurant Terrasse',
      titleEn: 'Restaurant Terrace',
      description: 'Unsere Terrasse mit direktem Meerblick',
      descriptionEn: 'Our terrace with direct ocean view',
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96',
      category: GalleryCategory.RESTAURANT,
      displayOrder: 1,
    },
    {
      title: 'Frischer Nordseefisch',
      titleEn: 'Fresh North Sea Fish',
      description: 'Täglich frischer Fisch aus der Nordsee',
      descriptionEn: 'Daily fresh fish from the North Sea',
      imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5',
      category: GalleryCategory.FOOD,
      displayOrder: 1,
    },
    {
      title: 'Unser Küchenteam',
      titleEn: 'Our Kitchen Team',
      description: 'Leidenschaftliche Köche kreieren kulinarische Meisterwerke',
      descriptionEn: 'Passionate chefs creating culinary masterpieces',
      imageUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c',
      category: GalleryCategory.TEAM,
      displayOrder: 1,
    },
    {
      title: 'Sonnenuntergang über der Nordsee',
      titleEn: 'Sunset over the North Sea',
      description: 'Romantische Abende mit spektakulärem Sonnenuntergang',
      descriptionEn: 'Romantic evenings with spectacular sunset',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
      category: GalleryCategory.AMBIENCE,
      displayOrder: 1,
    },
  ]

  for (const image of galleryImages) {
    await prisma.galleryImage.create({ data: image })
  }

  console.log('✅ Gallery images created')

  // Create system settings
  const systemSettings = [
    { key: 'restaurant_name', value: 'Badezeit Sylt', description: 'Name des Restaurants' },
    { key: 'restaurant_phone', value: '+49 4651 123456', description: 'Telefonnummer des Restaurants' },
    { key: 'restaurant_email', value: 'info@badezeit-sylt.de', description: 'E-Mail-Adresse des Restaurants' },
    { key: 'restaurant_address', value: 'Strandweg 1, 25999 Kampen/Sylt', description: 'Adresse des Restaurants' },
    { key: 'opening_hours_summer', value: 'Mo-So: 12:00-22:00', description: 'Öffnungszeiten Sommer' },
    { key: 'opening_hours_winter', value: 'Do-So: 17:00-21:00', description: 'Öffnungszeiten Winter' },
    { key: 'max_party_size', value: '20', description: 'Maximale Personenanzahl pro Reservierung' },
    { key: 'advance_booking_days', value: '90', description: 'Tage im Voraus buchbar' },
    { key: 'cancellation_hours', value: '24', description: 'Stornierung möglich bis X Stunden vorher' },
  ]

  for (const setting of systemSettings) {
    await prisma.systemSetting.create({ data: setting })
  }

  console.log('✅ System settings created')

  // Create sample analytics events
  const analyticsEvents = [
    {
      eventType: AnalyticsEventType.PAGE_VIEW,
      eventData: { page: '/reservierung', userAgent: 'Mozilla/5.0...' },
      timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      eventType: AnalyticsEventType.RESERVATION_STARTED,
      eventData: { partySize: 2, preferredDate: '2024-03-15' },
      timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
    },
    {
      eventType: AnalyticsEventType.RESERVATION_COMPLETED,
      eventData: { reservationId: 'completed-reservation-id', tableNumber: 1 },
      timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      eventType: AnalyticsEventType.MENU_VIEWED,
      eventData: { category: 'Fisch & Meeresfrüchte', language: 'de' },
      timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
    },
    {
      eventType: AnalyticsEventType.QR_CODE_SCANNED,
      eventData: { tableNumber: 5, timestamp: new Date().toISOString() },
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
    },
  ]

  for (const event of analyticsEvents) {
    await prisma.analyticsEvent.create({ data: event })
  }

  console.log('✅ Analytics events created')

  console.log('🎉 Database seeding completed successfully!')
  console.log('📊 Summary:')
  console.log(`   👥 Users: 4 (1 Admin, 1 Manager, 1 Staff, 1 Kitchen)`)
  console.log(`   🪑 Tables: ${tables.length}`)
  console.log(`   📋 Menu Categories: 7`)
  console.log(`   🍽️ Menu Items: ${menuItems.length}`)
  console.log(`   👤 Customers: ${customers.length}`)
  console.log(`   📅 Reservations: ${reservations.length}`)
  console.log(`   📱 QR Codes: 10`)
  console.log(`   🖼️ Gallery Images: ${galleryImages.length}`)
  console.log(`   ⚙️ System Settings: ${systemSettings.length}`)
  console.log(`   📈 Analytics Events: ${analyticsEvents.length}`)
  console.log('')
  console.log('🌊 Badezeit Sylt is ready to welcome guests!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })