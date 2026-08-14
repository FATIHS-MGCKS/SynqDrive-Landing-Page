/**
 * Content model for the public SynqDrive landing page.
 *
 * One shape per locale so landingpage/tools/build-site.mjs renders the German
 * and English page from the same templates. Every capability claim below maps to
 * a module that exists in the product today:
 *
 *   bookings, customers, stations, tasks, fleet          frontend/src/rental
 *   finance (invoices, payments, price tariffs)          backend/src/modules/billing
 *   fleet telemetry and health                           backend/src/modules/vehicle-intelligence
 *   trips from vehicle segments                          backend/src/modules/dimo
 *   AI assistant with sources and freshness              backend/src/modules/ai
 *   workflow automation with approvals                   backend/src/modules/workflow-automation
 *   WhatsApp, notifications, email, voice                backend/src/modules/{whatsapp,notifications,voice}
 *
 * No metric, customer name, logo or testimonial is claimed anywhere, because no
 * verifiable public source exists for them.
 */

/** Reachable destinations only. The public site is a single page per locale. */
const LINKS = {
  app: 'https://app.synqdrive.eu',
  demo: 'mailto:info@synqdrive.eu?subject=SynqDrive%20demo%20request',
  contact: 'mailto:info@synqdrive.eu',
  email: 'info@synqdrive.eu',
};

const SECTION_IDS = {
  useCases: 'use-cases',
  platform: 'platform',
  vehicle: 'vehicle-intelligence',
  ai: 'ai-orchestration',
  workflow: 'workflow-automation',
  communication: 'communication',
  integrations: 'integrations',
  contact: 'contact',
};

/** Flat Platform link list shared by desktop panel helpers and mobile navigation. */
export function flattenPlatformMenu(platformMenu) {
  const links = [{ label: platformMenu.overview.label, href: platformMenu.overview.href }];
  for (const group of platformMenu.groups) {
    for (const item of group.items) {
      links.push({ label: item.label, href: item.href });
    }
  }
  return links;
}

/**
 * Product visuals — manually curated, committed under assets/.
 * Policy: assets/product/README.md and DEC-006 in docs/DECISIONS.md.
 *
 * Each entry references shipped WebP files and intrinsic dimensions used by
 * productFrame() for zero-CLS responsive rendering.
 *
 * Every product visual also carries a `mobile` variant. Below 760px the page
 * switches to it via <picture>: scaling a full desktop panel into a phone column
 * renders its labels at around 5px, which reads as texture rather than product.
 */
const MEDIA = {
  hero: {
    file: 'landing-hero-operations',
    width: 1700,
    height: 1192,
    mobile: { file: 'landing-hero-operations-mobile', width: 968, height: 1104 },
  },
  heroBackground: {
    file: 'landing-hero-fleet-background',
    width: 1536,
    height: 1024,
    mobile: { file: 'landing-hero-fleet-background-mobile', width: 1024, height: 1536 },
  },
  useCases: {
    rental: {
      file: 'landing-industry-rental',
      width: 1536,
      height: 1024,
    },
    fleet: {
      file: 'landing-industry-fleet',
      width: 1536,
      height: 1024,
    },
    taxi: {
      file: 'landing-industry-taxi',
      width: 1536,
      height: 1024,
    },
    passengerTransport: {
      file: 'landing-industry-passenger-transport',
      width: 1536,
      height: 1024,
    },
    deliveryLogistics: {
      file: 'landing-industry-delivery-logistics',
      width: 1536,
      height: 1024,
    },
  },
  unified: {
    file: 'landing-unified-operations',
    width: 1968,
    height: 1458,
    mobile: { file: 'landing-unified-operations-mobile', width: 956, height: 600 },
  },
  vehicle: {
    file: 'landing-connected-vehicle',
    width: 1284,
    height: 992,
    mobile: { file: 'landing-connected-vehicle-mobile', width: 804, height: 1100 },
  },
  ai: {
    file: 'landing-ai-orchestration',
    width: 1368,
    height: 1444,
    mobile: { file: 'landing-ai-orchestration-mobile', width: 632, height: 524 },
  },
  workflow: {
    file: 'landing-workflow-automation',
    width: 1900,
    height: 1205,
    mobile: { file: 'landing-workflow-automation-mobile', width: 904, height: 808 },
  },
  communication: {
    file: 'landing-communications',
    width: 1390,
    height: 1310,
    mobile: { file: 'landing-communications-mobile', width: 780, height: 820 },
  },
};

const en = {
  locale: 'en',
  htmlLang: 'en',
  ogLocale: 'en_GB',
  dir: '/en/',
  meta: {
    title: 'SynqDrive | The operating system for modern mobility operations',
    description:
      'SynqDrive runs rental, fleet, bookings, customers, billing and connected vehicle data in one operational platform for mobility operators.',
    ogTitle: 'SynqDrive | The operating system for modern mobility operations',
    ogDescription:
      'Rental, fleet, bookings, customers, billing and connected vehicle data in one operational platform.',
    skipLink: 'Skip to content',
    localeSwitchLabel: 'Language',
    localeName: 'English',
    otherLocaleName: 'Deutsch',
  },
  nav: {
    home: 'SynqDrive home',
    mainLabel: 'Main navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    platform: 'Platform',
    login: 'Log in',
    demo: 'Book a demo',
    platformMenu: {
      overview: {
        label: 'Platform Overview',
        description: 'One system for the entire operation.',
        href: `#${SECTION_IDS.platform}`,
      },
      groups: [
        {
          title: 'Intelligence',
          items: [
            {
              label: 'Connected Vehicle Intelligence',
              description: 'Vehicle data, condition, trips and operational context.',
              href: `#${SECTION_IDS.vehicle}`,
            },
            {
              label: 'AI Orchestration',
              description: 'Understand context, generate recommendations and coordinate actions.',
              href: `#${SECTION_IDS.ai}`,
            },
          ],
        },
        {
          title: 'Automation',
          items: [
            {
              label: 'Workflow Automation',
              description: 'Connect events, conditions and actions.',
              href: `#${SECTION_IDS.workflow}`,
            },
            {
              label: 'Customer Communication',
              description: 'Communication with customer, booking and vehicle context.',
              href: `#${SECTION_IDS.communication}`,
            },
          ],
        },
        {
          title: 'Platform',
          items: [
            {
              label: 'Integrations & Extension',
              description: 'APIs, webhooks and flexible platform extension.',
              href: `#${SECTION_IDS.integrations}`,
            },
          ],
        },
      ],
      footerLink: {
        label: 'See the platform',
        href: `#${SECTION_IDS.platform}`,
      },
    },
    deferred: {
      solutions: 'Solutions',
      resources: 'Resources',
      pricing: 'Pricing',
    },
    mobileNav: {
      rootTitle: 'Main navigation',
      languageLabel: 'Language',
      back: 'Back',
      inProgress: 'In progress',
      available: 'Available',
      sales: 'Contact sales',
      categories: {
        products: 'Products',
        industries: 'Industries',
        integrations: 'Integrations',
        resources: 'Resources',
        pricing: 'Pricing',
      },
      products: [
        { label: 'Rental Operations', href: LINKS.app },
        { label: 'Fleet Operations', status: 'inProgress' },
        { label: 'Delivery Operations', status: 'inProgress' },
        { label: 'Mobility Operations', status: 'inProgress' },
      ],
      industries: [
        { label: 'Car Rental', status: 'available' },
        { label: 'Fleet Management', status: 'inProgress' },
        { label: 'Taxi', status: 'inProgress' },
        { label: 'School & Passenger Transport', status: 'inProgress' },
        { label: 'Delivery & Logistics', status: 'inProgress' },
      ],
      resources: [
        { label: 'Product Overview', href: `#${SECTION_IDS.platform}` },
        { label: 'Contact', href: LINKS.contact },
        { label: 'Demo', href: LINKS.demo },
      ],
    },
  },
  hero: {
    eyebrow: 'Connected Vehicle Intelligence Platform',
    title: {
      main: 'Everything your fleet needs.',
      emphasis: 'In real time.',
    },
    body:
      'SynqDrive connects vehicles, processes and AI in one platform for automated workflows, greater efficiency, better utilisation and less effort in day-to-day operations.',
    primary: 'Book a demo',
    secondary: 'See the platform',
    background: MEDIA.heroBackground,
    media: MEDIA.hero,
    mediaAlt:
      'SynqDrive operations dashboard showing fleet readiness, today\u2019s rentals, revenue and open receivables for one station group.',
  },
  useCases: {
    id: SECTION_IDS.useCases,
    title: 'One platform for every kind of fleet.',
    body: 'Whether rental, passenger transport or logistics: SynqDrive connects vehicles, teams and workflows on a shared foundation. Tailored to your operating model.',
    items: [
      {
        key: 'rental',
        title: 'Car rental companies',
        body: 'Manage bookings, vehicles, customers and billing in one seamless system.',
        media: MEDIA.useCases.rental,
        mediaAlt: 'Employee checking a modern car rental fleet with a tablet.',
      },
      {
        key: 'fleet',
        title: 'Fleet operators',
        body: 'Centrally coordinate availability, vehicle condition and operational tasks.',
        status: 'In progress',
        media: MEDIA.useCases.fleet,
        mediaAlt: 'Professionally managed corporate fleet at an operations site.',
      },
      {
        key: 'taxi',
        title: 'Taxi fleets',
        body: 'Coordinate vehicles, routes and dispatch intelligently.',
        status: 'In progress',
        media: MEDIA.useCases.taxi,
        mediaAlt: 'Modern taxi fleet in an urban operations setting.',
      },
      {
        key: 'passenger-transport',
        title: 'School & passenger transport',
        body: 'Reliably plan and dispatch recurring journeys.',
        status: 'In progress',
        media: MEDIA.useCases.passengerTransport,
        mediaAlt: 'Minibuses for school and passenger transport at an operations site.',
      },
      {
        key: 'delivery-logistics',
        title: 'Delivery & logistics',
        body: 'Coordinate vehicles, orders and routes throughout daily operations.',
        status: 'In progress',
        media: MEDIA.useCases.deliveryLogistics,
        mediaAlt: 'Delivery vehicles at a modern logistics site.',
      },
    ],
  },
  unified: {
    id: SECTION_IDS.platform,
    eyebrow: null,
    title: 'One system for the entire operation',
    body: 'Rental, fleet, bookings, customers, tasks and billing share one data model. Teams read the same operational state instead of reconciling separate tools.',
    media: MEDIA.unified,
    mediaAlt:
      'SynqDrive booking plan showing every fleet vehicle across one week with active, confirmed and completed rentals.',
    cards: [
      {
        icon: 'database',
        title: 'Shared data model',
        body: 'A booking, its vehicle, its customer and its invoice are the same record in every module.',
      },
      {
        icon: 'git-merge',
        title: 'One operational context',
        body: 'Fleet condition, bookings and open work are read together, not module by module.',
      },
      {
        icon: 'layers',
        title: 'Fewer system breaks',
        body: 'Handover, invoicing and follow-up work continue inside the same platform.',
      },
      {
        icon: 'users',
        title: 'Scoped access',
        body: 'Organisations, users and permissions are separated per tenant across every surface.',
      },
    ],
  },
  vehicle: {
    id: SECTION_IDS.vehicle,
    eyebrow: null,
    title: 'Connected vehicle intelligence',
    body: 'Every vehicle carries its own live state: telemetry, location, condition, service status and the bookings that depend on it. A vehicle is an operational unit, not a static record.',
    media: MEDIA.vehicle,
    mediaAlt:
      'SynqDrive fleet list showing per vehicle status, health state, station, telemetry freshness and mileage.',
    points: [
      {
        title: 'Live and last known state',
        body: 'Telemetry freshness, mileage and station are shown per vehicle, including when a signal has gone stale.',
      },
      {
        title: 'Condition that blocks rentals',
        body: 'Brakes, tyres, battery, error codes and service intervals can take a vehicle out of rental automatically.',
      },
      {
        title: 'Trips from vehicle segments',
        body: 'Trip boundaries come from vehicle segment data and are enriched with route and driving context.',
      },
    ],
  },
  ai: {
    id: SECTION_IDS.ai,
    eyebrow: 'AI orchestration',
    title: 'AI that works with your operational data',
    body: 'The assistant answers from the fleet, booking, finance and task data of your own organisation. Every answer names its sources and how fresh the underlying data is.',
    media: MEDIA.ai,
    mediaAlt:
      'SynqDrive AI assistant answering an operational question with a structured summary, named data sources and a data freshness note.',
    flowLabel: 'How an answer is produced',
    flow: [
      { title: 'Signal', body: 'Telemetry, bookings, finance and task events.' },
      { title: 'Context', body: 'Records are read together across modules.' },
      { title: 'Recommendation', body: 'A grounded answer with sources and open gaps.' },
      { title: 'Approved action', body: 'A person decides before anything is changed.' },
    ],
    governance: [
      {
        title: 'Grounded, not generated',
        body: 'Answers are built from tracked records. Missing data is reported instead of filled in.',
      },
      {
        title: 'People stay in control',
        body: 'Higher risk automations wait for human approval before they run.',
      },
    ],
  },
  workflow: {
    id: SECTION_IDS.workflow,
    eyebrow: null,
    title: 'Workflow automation',
    body: 'Operational events become operational reactions. Every automation is versioned, has a risk class and keeps a run history.',
    media: MEDIA.workflow,
    mediaAlt:
      'SynqDrive workflow overview listing active automations with their trigger, conditions, actions, risk class and last run result.',
    chainLabel: 'How an automation runs',
    chain: [
      {
        title: 'Trigger',
        body: 'A booking is returned, a document expires, an invoice runs overdue, vehicle condition turns critical.',
      },
      {
        title: 'Conditions',
        body: 'Thresholds and scope decide whether this event applies to this vehicle, station or organisation.',
      },
      {
        title: 'Action',
        body: 'Create a task, change vehicle status, raise an alert or notify the responsible team.',
      },
    ],
  },
  communication: {
    id: SECTION_IDS.communication,
    eyebrow: null,
    title: 'Connected customer communication',
    body: 'Messages sit next to the booking, the vehicle, the station and the open payment they belong to. Communication is part of the operation, not a separate inbox.',
    media: MEDIA.communication,
    mediaAlt:
      'SynqDrive customer conversation next to its operational context: booking, vehicle, station, payment status and documents.',
    points: [
      {
        title: 'One conversation layer',
        body: 'WhatsApp, email and in-app notifications share the same customer record. The voice assistant is being rolled out per organisation.',
      },
      {
        title: 'Every message has context',
        body: 'The booking, vehicle, station, payment state and open documents are visible while you reply.',
      },
      {
        title: 'Assisted, not automatic',
        body: 'The assistant can draft and suggest. Your team decides what is sent and when to escalate.',
      },
    ],
  },
  integrations: {
    id: SECTION_IDS.integrations,
    eyebrow: 'Integration and extension',
    title: 'Open where your operation needs it',
    body: 'SynqDrive connects to the systems around your fleet and exposes its own API and webhooks, so capabilities can be enabled per organisation.',
    hubLabel: 'Platform capabilities',
    tiles: [
      { icon: 'car', title: 'Vehicle telemetry', body: 'Connected vehicle data and trip segments.' },
      { icon: 'credit-card', title: 'Payments', body: 'Deposits, payouts and invoice settlement.' },
      { icon: 'user-check', title: 'Identity checks', body: 'Customer and driver verification.' },
      { icon: 'message-circle', title: 'Messaging and voice', body: 'Customer contact across channels.' },
      { icon: 'file-text', title: 'Documents', body: 'Upload, extraction and confirmed apply.' },
      { icon: 'code-xml', title: 'API and webhooks', body: 'Read and react to operational events.' },
    ],
    note: 'Extraction results are never applied to your data before someone confirms them.',
  },
  cta: {
    id: SECTION_IDS.contact,
    title: 'Ready to bring your mobility operations onto one platform?',
    body: 'Tell us how you operate today and we will show SynqDrive against your own workflow.',
    primary: 'Book a demo',
    secondary: 'Log in',
  },
  footer: {
    tagline: 'Operational software for fleet, rental and mobility businesses.',
    columnsLabel: 'Footer',
    platform: 'Platform',
    company: 'Company',
    links: {
      platform: [
        { label: 'Overview', href: `#${SECTION_IDS.platform}` },
        { label: 'Connected vehicle intelligence', href: `#${SECTION_IDS.vehicle}` },
        { label: 'AI and automation', href: `#${SECTION_IDS.ai}` },
        { label: 'Integrations', href: `#${SECTION_IDS.integrations}` },
      ],
      company: [
        { label: 'Contact', href: LINKS.contact },
        { label: 'Log in', href: LINKS.app },
      ],
    },
    rights: 'All rights reserved.',
  },
};

const de = {
  locale: 'de',
  htmlLang: 'de',
  ogLocale: 'de_DE',
  dir: '/',
  meta: {
    title: 'SynqDrive | Das Betriebssystem für den modernen Mobilitätsbetrieb',
    description:
      'SynqDrive führt Vermietung, Flotte, Buchungen, Kunden, Abrechnung und vernetzte Fahrzeugdaten in einer operativen Plattform für Mobilitätsbetriebe zusammen.',
    ogTitle: 'SynqDrive | Das Betriebssystem für den modernen Mobilitätsbetrieb',
    ogDescription:
      'Vermietung, Flotte, Buchungen, Kunden, Abrechnung und vernetzte Fahrzeugdaten in einer operativen Plattform.',
    skipLink: 'Zum Inhalt',
    localeSwitchLabel: 'Sprache',
    localeName: 'Deutsch',
    otherLocaleName: 'English',
  },
  nav: {
    home: 'SynqDrive Startseite',
    mainLabel: 'Hauptnavigation',
    openMenu: 'Menü öffnen',
    closeMenu: 'Menü schließen',
    platform: 'Plattform',
    login: 'Anmelden',
    demo: 'Demo anfragen',
    platformMenu: {
      overview: {
        label: 'Plattform-Überblick',
        description: 'Ein System für den gesamten Betrieb.',
        href: `#${SECTION_IDS.platform}`,
      },
      groups: [
        {
          title: 'Intelligenz',
          items: [
            {
              label: 'Vernetzte Fahrzeugintelligenz',
              description: 'Fahrzeugdaten, Zustand, Fahrten und operativer Kontext.',
              href: `#${SECTION_IDS.vehicle}`,
            },
            {
              label: 'KI-Orchestrierung',
              description: 'Kontext verstehen, Empfehlungen erzeugen und Aktionen koordinieren.',
              href: `#${SECTION_IDS.ai}`,
            },
          ],
        },
        {
          title: 'Automatisierung',
          items: [
            {
              label: 'Workflow-Automatisierung',
              description: 'Ereignisse, Bedingungen und Aktionen miteinander verbinden.',
              href: `#${SECTION_IDS.workflow}`,
            },
            {
              label: 'Kundenkommunikation',
              description: 'Kommunikation mit Kunden-, Buchungs- und Fahrzeugkontext.',
              href: `#${SECTION_IDS.communication}`,
            },
          ],
        },
        {
          title: 'Plattform',
          items: [
            {
              label: 'Integrationen & Erweiterung',
              description: 'APIs, Webhooks und flexible Plattform-Erweiterung.',
              href: `#${SECTION_IDS.integrations}`,
            },
          ],
        },
      ],
      footerLink: {
        label: 'Plattform entdecken',
        href: `#${SECTION_IDS.platform}`,
      },
    },
    deferred: {
      solutions: 'Lösungen',
      resources: 'Ressourcen',
      pricing: 'Preise',
    },
    mobileNav: {
      rootTitle: 'Hauptnavigation',
      languageLabel: 'Sprache',
      back: 'Zurück',
      inProgress: 'In Arbeit',
      available: 'Verfügbar',
      sales: 'Vertrieb kontaktieren',
      categories: {
        products: 'Produkte',
        industries: 'Branchen',
        integrations: 'Integrationen',
        resources: 'Ressourcen',
        pricing: 'Preise',
      },
      products: [
        { label: 'Rental Operations', href: LINKS.app },
        { label: 'Fleet Operations', status: 'inProgress' },
        { label: 'Delivery Operations', status: 'inProgress' },
        { label: 'Mobility Operations', status: 'inProgress' },
      ],
      industries: [
        { label: 'Autovermietung', status: 'available' },
        { label: 'Flottenmanagement', status: 'inProgress' },
        { label: 'Taxi', status: 'inProgress' },
        { label: 'Schüler- & Personenbeförderung', status: 'inProgress' },
        { label: 'Lieferung & Logistik', status: 'inProgress' },
      ],
      resources: [
        { label: 'Produktüberblick', href: `#${SECTION_IDS.platform}` },
        { label: 'Kontakt', href: LINKS.contact },
        { label: 'Demo', href: LINKS.demo },
      ],
    },
  },
  hero: {
    eyebrow: 'Connected Vehicle Intelligence Plattform',
    title: {
      main: 'Alles, was Ihre Flotte braucht.',
      emphasis: 'In Echtzeit.',
    },
    body:
      'SynqDrive verbindet Fahrzeuge, Prozesse und KI in einer Plattform für automatisierte Abläufe, Effizienzsteigerung, bessere Auslastung und weniger Aufwand im Tagesgeschäft.',
    primary: 'Demo anfragen',
    secondary: 'Plattform entdecken',
    background: MEDIA.heroBackground,
    media: MEDIA.hero,
    mediaAlt:
      'SynqDrive Betriebsübersicht mit Fahrzeugverfügbarkeit, laufenden Vermietungen, Umsatz und offenen Forderungen für eine Stationsgruppe.',
  },
  useCases: {
    id: SECTION_IDS.useCases,
    title: 'Eine Plattform für jede Art von Flotte.',
    body: 'Ob Vermietung, Beförderung oder Logistik: SynqDrive verbindet Fahrzeuge, Teams und Abläufe auf einer gemeinsamen Grundlage. Abgestimmt auf Ihr Betriebsmodell.',
    items: [
      {
        key: 'rental',
        title: 'Autovermietungen',
        body: 'Buchungen, Fahrzeuge, Kunden und Abrechnung in einem durchgängigen System verwalten.',
        media: MEDIA.useCases.rental,
        mediaAlt: 'Mitarbeiter betrachtet eine moderne Mietwagenflotte mit einem Tablet.',
      },
      {
        key: 'fleet',
        title: 'Flottenbetriebe',
        body: 'Verfügbarkeit, Fahrzeugzustand und operative Aufgaben zentral koordinieren.',
        status: 'In Arbeit',
        media: MEDIA.useCases.fleet,
        mediaAlt: 'Professionell verwaltete Unternehmensflotte an einem Betriebsstandort.',
      },
      {
        key: 'taxi',
        title: 'Taxiflotten',
        body: 'Fahrzeuge, Touren und Dispatching intelligent koordinieren.',
        status: 'In Arbeit',
        media: MEDIA.useCases.taxi,
        mediaAlt: 'Moderne Taxiflotte in einem urbanen Betriebskontext.',
      },
      {
        key: 'passenger-transport',
        title: 'Schüler- & Personenbeförderung',
        body: 'Wiederkehrende Fahrten zuverlässig planen und disponieren.',
        status: 'In Arbeit',
        media: MEDIA.useCases.passengerTransport,
        mediaAlt: 'Kleinbusse für Schüler- und Personenbeförderung an einem Betriebsstandort.',
      },
      {
        key: 'delivery-logistics',
        title: 'Lieferung & Logistik',
        body: 'Fahrzeuge, Aufträge und Touren im laufenden Betrieb koordinieren.',
        status: 'In Arbeit',
        media: MEDIA.useCases.deliveryLogistics,
        mediaAlt: 'Lieferfahrzeuge an einem modernen Logistikstandort.',
      },
    ],
  },
  unified: {
    id: SECTION_IDS.platform,
    eyebrow: null,
    title: 'Ein System für den gesamten Betrieb',
    body: 'Vermietung, Flotte, Buchungen, Kunden, Aufgaben und Abrechnung teilen ein Datenmodell. Alle Teams lesen denselben operativen Stand, statt getrennte Tools abzugleichen.',
    media: MEDIA.unified,
    mediaAlt:
      'SynqDrive Buchungsplan mit allen Flottenfahrzeugen über eine Woche und laufenden, bestätigten sowie abgeschlossenen Vermietungen.',
    cards: [
      {
        icon: 'database',
        title: 'Gemeinsame Datenbasis',
        body: 'Buchung, Fahrzeug, Kunde und Rechnung sind in jedem Modul derselbe Datensatz.',
      },
      {
        icon: 'git-merge',
        title: 'Ein operativer Kontext',
        body: 'Flottenzustand, Buchungen und offene Arbeit werden gemeinsam gelesen, nicht Modul für Modul.',
      },
      {
        icon: 'layers',
        title: 'Weniger Systembrüche',
        body: 'Übergabe, Abrechnung und Folgearbeit laufen in derselben Plattform weiter.',
      },
      {
        icon: 'users',
        title: 'Abgegrenzter Zugriff',
        body: 'Organisationen, Nutzer und Berechtigungen sind pro Mandant getrennt.',
      },
    ],
  },
  vehicle: {
    id: SECTION_IDS.vehicle,
    eyebrow: null,
    title: 'Vernetzte Fahrzeugintelligenz',
    body: 'Jedes Fahrzeug trägt seinen eigenen Live-Zustand: Telemetrie, Standort, Zustand, Servicestatus und die Buchungen, die davon abhängen. Ein Fahrzeug ist eine operative Einheit, kein statischer Datensatz.',
    media: MEDIA.vehicle,
    mediaAlt:
      'SynqDrive Fahrzeugliste mit Status, Zustand, Station, Aktualität der Telemetrie und Laufleistung pro Fahrzeug.',
    points: [
      {
        title: 'Live und letzter bekannter Stand',
        body: 'Aktualität der Telemetrie, Laufleistung und Station je Fahrzeug, auch wenn ein Signal veraltet ist.',
      },
      {
        title: 'Zustand, der Vermietung blockiert',
        body: 'Bremsen, Reifen, Batterie, Fehlercodes und Serviceintervalle können ein Fahrzeug automatisch aus der Vermietung nehmen.',
      },
      {
        title: 'Fahrten aus Fahrzeugsegmenten',
        body: 'Fahrtgrenzen stammen aus Fahrzeug-Segmentdaten und werden um Route und Fahrkontext ergänzt.',
      },
    ],
  },
  ai: {
    id: SECTION_IDS.ai,
    eyebrow: 'KI-Orchestrierung',
    title: 'KI, die mit Ihren operativen Daten arbeitet',
    body: 'Der Assistent antwortet aus den Flotten-, Buchungs-, Finanz- und Aufgabendaten Ihrer eigenen Organisation. Jede Antwort nennt ihre Quellen und die Aktualität der Daten.',
    media: MEDIA.ai,
    mediaAlt:
      'SynqDrive KI-Assistent mit strukturierter Antwort auf eine operative Frage, genannten Datenquellen und Hinweis zur Datenaktualität.',
    flowLabel: 'So entsteht eine Antwort',
    flow: [
      { title: 'Signal', body: 'Telemetrie, Buchungen, Finanzen und Aufgaben.' },
      { title: 'Kontext', body: 'Datensätze werden modulübergreifend gemeinsam gelesen.' },
      { title: 'Empfehlung', body: 'Eine belegte Antwort mit Quellen und offenen Lücken.' },
      { title: 'Freigegebene Aktion', body: 'Ein Mensch entscheidet, bevor etwas verändert wird.' },
    ],
    governance: [
      {
        title: 'Belegt statt erfunden',
        body: 'Antworten entstehen aus erfassten Datensätzen. Fehlende Daten werden benannt, nicht ergänzt.',
      },
      {
        title: 'Menschen behalten die Kontrolle',
        body: 'Automatisierungen mit höherem Risiko warten auf eine Freigabe, bevor sie laufen.',
      },
    ],
  },
  workflow: {
    id: SECTION_IDS.workflow,
    eyebrow: null,
    title: 'Workflow-Automatisierung',
    body: 'Operative Ereignisse werden zu operativen Reaktionen. Jede Automatisierung ist versioniert, hat eine Risikoklasse und führt eine Laufhistorie.',
    media: MEDIA.workflow,
    mediaAlt:
      'SynqDrive Workflow-Übersicht mit aktiven Automatisierungen, ihren Auslösern, Bedingungen, Aktionen, Risikoklassen und letzten Läufen.',
    chainLabel: 'So läuft eine Automatisierung',
    chain: [
      {
        title: 'Auslöser',
        body: 'Eine Buchung wird zurückgegeben, ein Dokument läuft ab, eine Rechnung wird überfällig, ein Fahrzeugzustand wird kritisch.',
      },
      {
        title: 'Bedingungen',
        body: 'Schwellenwerte und Geltungsbereich entscheiden, ob das Ereignis für dieses Fahrzeug, diese Station oder diese Organisation gilt.',
      },
      {
        title: 'Aktion',
        body: 'Aufgabe anlegen, Fahrzeugstatus ändern, Warnung auslösen oder das zuständige Team informieren.',
      },
    ],
  },
  communication: {
    id: SECTION_IDS.communication,
    eyebrow: null,
    title: 'Vernetzte Kundenkommunikation',
    body: 'Nachrichten stehen neben der Buchung, dem Fahrzeug, der Station und der offenen Zahlung, zu denen sie gehören. Kommunikation ist Teil des Betriebs, nicht eine getrennte Inbox.',
    media: MEDIA.communication,
    mediaAlt:
      'SynqDrive Kundenkonversation neben ihrem operativen Kontext: Buchung, Fahrzeug, Station, Zahlungsstatus und Dokumente.',
    points: [
      {
        title: 'Eine Kommunikationsebene',
        body: 'WhatsApp, E-Mail und Benachrichtigungen nutzen denselben Kundendatensatz. Der Sprachassistent wird organisationsweise ausgerollt.',
      },
      {
        title: 'Jede Nachricht hat Kontext',
        body: 'Buchung, Fahrzeug, Station, Zahlungsstand und offene Dokumente sind beim Antworten sichtbar.',
      },
      {
        title: 'Unterstützt, nicht automatisch',
        body: 'Der Assistent kann formulieren und vorschlagen. Ihr Team entscheidet, was gesendet und wann eskaliert wird.',
      },
    ],
  },
  integrations: {
    id: SECTION_IDS.integrations,
    eyebrow: 'Integration und Erweiterung',
    title: 'Offen, wo Ihr Betrieb es braucht',
    body: 'SynqDrive verbindet sich mit den Systemen rund um Ihre Flotte und stellt eine eigene API sowie Webhooks bereit, sodass Funktionen pro Organisation aktiviert werden können.',
    hubLabel: 'Plattformfunktionen',
    tiles: [
      { icon: 'car', title: 'Fahrzeugtelemetrie', body: 'Vernetzte Fahrzeugdaten und Fahrtsegmente.' },
      { icon: 'credit-card', title: 'Zahlungen', body: 'Kautionen, Auszahlungen und Rechnungsausgleich.' },
      { icon: 'user-check', title: 'Identitätsprüfung', body: 'Prüfung von Kunden und Fahrern.' },
      { icon: 'message-circle', title: 'Nachrichten und Sprache', body: 'Kundenkontakt über mehrere Kanäle.' },
      { icon: 'file-text', title: 'Dokumente', body: 'Upload, Auslesen und bestätigte Übernahme.' },
      { icon: 'code-xml', title: 'API und Webhooks', body: 'Operative Ereignisse lesen und beantworten.' },
    ],
    note: 'Ausgelesene Ergebnisse werden erst nach einer Bestätigung in Ihre Daten übernommen.',
  },
  cta: {
    id: SECTION_IDS.contact,
    title: 'Bereit, Ihren Mobilitätsbetrieb auf eine Plattform zu bringen?',
    body: 'Sagen Sie uns, wie Sie heute arbeiten, und wir zeigen SynqDrive an Ihrem eigenen Ablauf.',
    primary: 'Demo anfragen',
    secondary: 'Anmelden',
  },
  footer: {
    tagline: 'Operative Software für Flotten-, Vermiet- und Mobilitätsbetriebe.',
    columnsLabel: 'Fußbereich',
    platform: 'Plattform',
    company: 'Unternehmen',
    links: {
      platform: [
        { label: 'Überblick', href: `#${SECTION_IDS.platform}` },
        { label: 'Vernetzte Fahrzeugintelligenz', href: `#${SECTION_IDS.vehicle}` },
        { label: 'KI und Automatisierung', href: `#${SECTION_IDS.ai}` },
        { label: 'Integrationen', href: `#${SECTION_IDS.integrations}` },
      ],
      company: [
        { label: 'Kontakt', href: LINKS.contact },
        { label: 'Anmelden', href: LINKS.app },
      ],
    },
    rights: 'Alle Rechte vorbehalten.',
  },
};

export const SITE = {
  origin: 'https://synqdrive.eu',
  brand: 'SynqDrive',
  year: 2026,
  links: LINKS,
  sectionIds: SECTION_IDS,
};

/** German stays the root locale, matching the current public site. */
export const locales = [de, en];
export const defaultLocale = de;
