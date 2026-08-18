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
    width: 1672,
    height: 941,
    mobile: { file: 'landing-hero-fleet-background-mobile', width: 1049, height: 1499 },
  },
  useCases: {
    rental: {
      file: 'landing-industry-rental',
      width: 1672,
      height: 941,
    },
    fleet: {
      file: 'landing-industry-fleet',
      width: 1672,
      height: 941,
    },
    taxi: {
      file: 'landing-industry-taxi',
      width: 1672,
      height: 941,
    },
    passengerTransport: {
      file: 'landing-industry-passenger-transport',
      width: 1672,
      height: 941,
    },
    deliveryLogistics: {
      file: 'landing-industry-delivery-logistics',
      width: 1672,
      height: 941,
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
    body: 'Every fleet operation works differently. SynqDrive connects vehicles, teams and processes on one shared platform - tailored to the workflows and requirements of your business. Automate recurring work, identify the need for action earlier and replace fragmented tools with connected processes.',
    items: [
      {
        key: 'rental',
        title: 'Car rental companies',
        body: 'SynqDrive connects bookings, customers, vehicles and handovers in one continuous workflow - and automates the work in between.',
        media: MEDIA.useCases.rental,
        mediaAlt: 'Employee checking a modern car rental fleet with a tablet.',
        features: [
          {
            title: 'Automate workflows',
            body: 'Bookings, checks, documents, payments and internal tasks work together instead of being passed manually between separate systems.',
          },
          {
            title: 'Keep vehicles ready',
            body: 'Vehicle condition, warnings, maintenance and wear are considered together, helping teams identify the need for action before it affects the next rental.',
          },
          {
            title: 'Understand vehicle use',
            body: 'Analyse driving behaviour, events and vehicle data in the context of a rental and identify unusual or particularly demanding use faster.',
          },
          {
            title: 'Manage fewer tools',
            body: 'Bookings, customer management, vehicle data, handovers, tasks, documents and communication come together on one shared platform.',
          },
        ],
      },
      {
        key: 'fleet',
        title: 'Fleet operators',
        body: 'SynqDrive connects vehicle data, maintenance, drivers and operational workflows - helping teams manage the fleet more proactively.',
        status: 'In progress',
        media: MEDIA.useCases.fleet,
        mediaAlt: 'Professionally managed corporate fleet at an operations site.',
        features: [
          {
            title: 'Automate operations',
            body: 'Recurring tasks, checks, notifications and internal workflows can be triggered automatically by rules and vehicle events, reducing manual monitoring and coordination.',
          },
          {
            title: 'Identify wear earlier',
            body: 'SynqDrive connects live vehicle data with maintenance, warnings and usage. Changes and potential action points become visible earlier, before they develop into unplanned downtime.',
          },
          {
            title: 'Improve driving behaviour',
            body: 'Analyse braking, acceleration, speed and other driving events in the context of a driver, vehicle and time period. Repeated patterns create a traceable basis for targeted driver coaching and internal action.',
          },
          {
            title: 'Bring systems together',
            body: 'Vehicle data, maintenance, driver information, tasks, documentation and communication come together on one platform instead of remaining spread across telematics portals, spreadsheets and separate tools.',
          },
        ],
      },
      {
        key: 'taxi',
        title: 'Taxi fleets',
        body: 'SynqDrive connects vehicle condition, driving behaviour and operational workflows - improving fleet readiness while reducing manual coordination in day-to-day operations.',
        status: 'In progress',
        media: MEDIA.useCases.taxi,
        mediaAlt: 'Modern taxi fleet in an urban operations setting.',
        features: [
          {
            title: 'Automate operations',
            body: 'Recurring checks, tasks, notifications and internal workflows can be triggered automatically when defined events or conditions occur, reducing the amount of work teams need to track manually.',
          },
          {
            title: 'Keep vehicles available',
            body: 'High mileage and intensive use increase wear. SynqDrive connects vehicle condition, warnings, maintenance requirements and usage so the need for action becomes visible earlier.',
          },
          {
            title: 'Understand driving behaviour',
            body: 'Braking, acceleration, speed and other driving events can be evaluated in the context of a driver, vehicle and time period. Repeated patterns create a traceable basis for targeted driver coaching and internal measures.',
          },
          {
            title: 'Connect daily workflows',
            body: 'Vehicle data, driver information, tasks, documentation and communication come together on one shared platform instead of remaining spread across portals, spreadsheets, messaging tools and separate applications.',
          },
        ],
      },
      {
        key: 'passenger-transport',
        title: 'School & passenger transport',
        body: 'SynqDrive connects vehicles, drivers and operational workflows so action points become visible earlier, measures remain traceable and recurring work can be carried out more reliably.',
        status: 'In progress',
        media: MEDIA.useCases.passengerTransport,
        mediaAlt: 'Minibuses for school and passenger transport at an operations site.',
        features: [
          {
            title: 'Automate operational checks',
            body: 'Recurring checks, tasks, notifications and internal controls can be triggered automatically, making important steps less dependent on manual reminders, individual employees or scattered lists.',
          },
          {
            title: 'Keep vehicles ready for service',
            body: 'SynqDrive connects vehicle condition, warnings, maintenance requirements and wear. Changes become visible earlier so necessary checks and measures can be planned in time.',
          },
          {
            title: 'Understand and improve driving behaviour',
            body: 'Braking, acceleration, speed and other driving events can be assigned to drivers, vehicles and time periods. Repeated patterns provide a traceable basis for targeted driver coaching and internal measures.',
          },
          {
            title: 'Document checks and actions',
            body: 'Driver information, vehicle condition, tasks, events and completed measures are brought together on one shared foundation instead of being distributed across paper, spreadsheets, messaging tools and separate applications.',
          },
        ],
      },
      {
        key: 'delivery-logistics',
        title: 'Delivery & logistics',
        body: 'SynqDrive connects vehicles, drivers and operational workflows - helping keep the fleet available and making action points visible before day-to-day operations are already affected.',
        status: 'In progress',
        media: MEDIA.useCases.deliveryLogistics,
        mediaAlt: 'Delivery vehicles at a modern logistics site.',
        features: [
          {
            title: 'Trigger workflows automatically',
            body: 'Vehicle events, warnings and defined conditions can automatically trigger tasks, notifications and follow-up processes, turning information directly into the next operational step.',
          },
          {
            title: 'Identify action points earlier',
            body: 'High mileage and intensive use place delivery vehicles under constant load. SynqDrive connects vehicle condition, maintenance requirements, warnings and wear so changes become visible earlier.',
          },
          {
            title: 'Analyse driving behaviour',
            body: 'Braking, acceleration, speed and other driving events can be evaluated in the context of a driver, vehicle and time period. Repeated patterns can be investigated and used for driver coaching or internal measures.',
          },
          {
            title: 'Connect fleet and operations',
            body: 'Vehicle data, driver information, maintenance, tasks, documentation and communication come together on one shared platform instead of remaining spread across telematics portals, spreadsheets, messaging tools and separate systems.',
          },
        ],
      },
    ],
  },
  unified: {
    id: SECTION_IDS.platform,
    eyebrow: 'FULLY CONNECTED MOBILITY OPERATIONS',
    title: 'Everything your operation needs. Fully connected.',
    body: 'SynqDrive connects vehicles, customers, bookings, teams, documents, communication and billing in one intelligent platform. Live vehicle data makes condition, usage and driving behaviour visible. Automated workflows handle recurring work and respond to operational events. AI agents support customers, drivers and employees across connected communication channels.',
    media: MEDIA.unified,
    mediaAlt:
      'SynqDrive booking plan showing every fleet vehicle across one week with active, confirmed and completed rentals.',
    cards: [
      {
        icon: 'layers',
        title: 'One platform for the entire operation',
        body: 'Vehicles, customers, bookings, tasks, teams, documents, communication and billing work together on one shared data foundation.',
      },
      {
        icon: 'car',
        title: 'Understand vehicles. Act earlier.',
        body: 'Live data, driving behaviour, warnings and maintenance requirements show what is happening across the fleet and where action is needed.',
      },
      {
        icon: 'git-merge',
        title: 'Run workflows automatically',
        body: 'Events trigger the right processes automatically - from tasks and notifications to checks and further operational steps.',
      },
      {
        icon: 'message-circle',
        title: 'AI that works inside your operation',
        body: 'AI agents use operational context, support communication with customers, drivers and employees, and help with questions, decisions and next steps.',
      },
    ],
  },
  vehicle: {
    id: SECTION_IDS.vehicle,
    eyebrow: 'CONNECTED VEHICLE INTELLIGENCE',
    title: 'Know what is happening across your fleet. And where action is needed.',
    body: 'SynqDrive connects live vehicle data, condition, driving behaviour and maintenance information with the operational context of your business. You see more than a vehicle\'s location or mileage. You understand which vehicles are ready, where action is developing and which operational workflows may be affected.',
    media: MEDIA.vehicle,
    mediaAlt:
      'SynqDrive fleet list showing per vehicle status, health state, station, telemetry freshness and mileage.',
    points: [
      {
        title: 'Understand vehicle condition',
        body: 'Location, mileage, telemetry, warnings, battery, tyres, brakes and service status come together to form a clear picture of each vehicle\'s actual condition - current and traceable.',
      },
      {
        title: 'Identify maintenance needs earlier',
        body: 'Changes, warnings and wear are considered together, helping teams plan inspections and maintenance earlier before they affect day-to-day operations.',
      },
      {
        title: 'Analyse driving behaviour in context',
        body: 'Trips and relevant driving events are connected with the vehicle, driver, time and usage context. Patterns become visible and can be reviewed, documented or used for further action.',
      },
    ],
    closing: 'Don\'t just see vehicle data. Understand what it means for your operation.',
  },
  ai: {
    id: SECTION_IDS.ai,
    eyebrow: 'AI ORCHESTRATION',
    title: 'Ask your operation. SynqDrive knows the context.',
    body: 'Instead of gathering information from vehicles, bookings, finance and tasks yourself, ask SynqDrive directly. The AI reads relevant operational data together, connects the context and delivers traceable answers and recommendations - with sources, data freshness and human approval where required.',
    media: MEDIA.ai,
    mediaAlt:
      'SynqDrive AI assistant answering an operational question with a structured summary, named data sources and a data freshness note.',
    flowLabel: 'How data becomes a decision',
    flow: [
      {
        title: 'What is happening',
        body: 'Vehicle data, bookings, finance and open tasks provide the relevant signals from across your operation.',
      },
      {
        title: 'Understand the context',
        body: 'SynqDrive does not read information in isolation. It connects records across vehicles, bookings and operational processes.',
      },
      {
        title: 'Recommend clearly',
        body: 'The AI summarises the situation, highlights where action is needed and suggests concrete next steps.',
      },
      {
        title: 'Act with control',
        body: 'Where an action can be triggered, approvals and risk rules remain part of the process. Your team stays in control.',
      },
    ],
    governance: [
      {
        title: 'Answers grounded in your data',
        body: 'SynqDrive shows which data an answer is based on and how current it is. Missing information is identified instead of being replaced with assumptions.',
      },
      {
        title: 'Your team decides',
        body: 'AI supports analysis, prioritisation and next steps. Higher-risk decisions follow the required approval process before changes are executed.',
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
    eyebrow: 'CONNECTED CUSTOMER COMMUNICATION',
    title: 'Every message. With the right context.',
    body: 'SynqDrive connects WhatsApp, email, notifications and voice with the operational information behind them. Booking, vehicle, payment status and documents are available where communication happens, helping your team respond faster without gathering information across separate systems.',
    media: MEDIA.communication,
    mediaAlt:
      'SynqDrive customer conversation next to its operational context: booking, vehicle, station, payment status and documents.',
    points: [
      {
        title: 'Every message in the right context',
        body: 'Customer conversations are directly connected with the booking, vehicle, location, payment status and open documents. Your team can immediately see what the conversation is about and which information matters for the response.',
      },
      {
        title: 'Bring communication together',
        body: 'WhatsApp, email and notifications work with the same customer and operational context. Voice can be connected to the same operational workflow where it is enabled for the organisation.',
      },
      {
        title: 'AI supports the next step',
        body: 'SynqDrive interprets information from the operational record, supports responses and helps with the next steps. Your team remains in control of sending and escalation.',
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
    body: 'Jeder Flottenbetrieb funktioniert anders. SynqDrive verbindet Fahrzeuge, Teams und Prozesse auf einer gemeinsamen Plattform - zugeschnitten auf die Abläufe und Anforderungen Ihres Unternehmens. So automatisieren Sie wiederkehrende Arbeit, erkennen Handlungsbedarf früher und ersetzen Insellösungen durch durchgängige Prozesse.',
    items: [
      {
        key: 'rental',
        title: 'Autovermietungen',
        body: 'SynqDrive verbindet Buchungen, Kunden, Fahrzeuge und Übergaben in einem durchgängigen Ablauf - und automatisiert die Arbeit dazwischen.',
        media: MEDIA.useCases.rental,
        mediaAlt: 'Mitarbeiter betrachtet eine moderne Mietwagenflotte mit einem Tablet.',
        features: [
          {
            title: 'Abläufe automatisieren',
            body: 'Buchungen, Prüfungen, Dokumente, Zahlungen und interne Aufgaben greifen ineinander, statt manuell zwischen einzelnen Systemen weitergegeben zu werden.',
          },
          {
            title: 'Fahrzeuge einsatzbereit halten',
            body: 'Fahrzeugzustand, Warnmeldungen, Wartung und Verschleiß werden kontinuierlich berücksichtigt - damit Handlungsbedarf möglichst erkannt wird, bevor er die nächste Vermietung beeinträchtigt.',
          },
          {
            title: 'Nutzung verstehen',
            body: 'Analysieren Sie Fahrverhalten, Ereignisse und Fahrzeugdaten im Kontext einer Vermietung und erkennen Sie ungewöhnliche oder besonders belastende Nutzung schneller.',
          },
          {
            title: 'Weniger Tools verwalten',
            body: 'Buchung, Kundenverwaltung, Fahrzeugdaten, Übergaben, Aufgaben, Dokumente und Kommunikation laufen auf einer gemeinsamen Plattform zusammen.',
          },
        ],
      },
      {
        key: 'fleet',
        title: 'Flottenbetriebe',
        body: 'SynqDrive verbindet Fahrzeugdaten, Wartung, Fahrer und operative Abläufe - damit Ihr Fuhrpark vorausschauender gesteuert werden kann.',
        status: 'In Arbeit',
        media: MEDIA.useCases.fleet,
        mediaAlt: 'Professionell verwaltete Unternehmensflotte an einem Betriebsstandort.',
        features: [
          {
            title: 'Betrieb automatisieren',
            body: 'Wiederkehrende Aufgaben, Prüfungen, Benachrichtigungen und interne Abläufe werden durch Regeln und Fahrzeugereignisse automatisch angestoßen. So muss Ihr Team weniger überwachen, nachhalten und manuell koordinieren.',
          },
          {
            title: 'Verschleiß früher erkennen',
            body: 'SynqDrive verbindet laufende Fahrzeugdaten mit Wartung, Warnmeldungen und Nutzung. Auffälligkeiten und möglicher Handlungsbedarf werden früher sichtbar - bevor daraus ungeplante Ausfälle entstehen.',
          },
          {
            title: 'Fahrverhalten gezielt verbessern',
            body: 'Analysieren Sie Brems-, Beschleunigungs-, Geschwindigkeits- und weitere Fahrereignisse im Kontext von Fahrer, Fahrzeug und Zeitraum. Wiederkehrende Auffälligkeiten schaffen eine nachvollziehbare Grundlage für gezielte Nachbelehrungen und interne Maßnahmen.',
          },
          {
            title: 'Systeme zusammenführen',
            body: 'Fahrzeugdaten, Wartung, Fahrerinformationen, Aufgaben, Dokumentation und Kommunikation laufen auf einer gemeinsamen Plattform zusammen - statt über Telematik-Portale, Tabellen und einzelne Tools verteilt zu bleiben.',
          },
        ],
      },
      {
        key: 'taxi',
        title: 'Taxiflotten',
        body: 'SynqDrive verbindet Fahrzeugzustand, Fahrverhalten und operative Abläufe - für mehr Einsatzbereitschaft und weniger manuelle Koordination im täglichen Betrieb.',
        status: 'In Arbeit',
        media: MEDIA.useCases.taxi,
        mediaAlt: 'Moderne Taxiflotte in einem urbanen Betriebskontext.',
        features: [
          {
            title: 'Betrieb automatisieren',
            body: 'Wiederkehrende Prüfungen, Aufgaben, Benachrichtigungen und interne Abläufe werden automatisch angestoßen, sobald definierte Ereignisse oder Zustände eintreten. So muss Ihr Team weniger manuell nachhalten und koordinieren.',
          },
          {
            title: 'Fahrzeuge verfügbar halten',
            body: 'Hohe Laufleistungen und intensive Nutzung erhöhen den Verschleiß. SynqDrive verbindet Fahrzeugzustand, Warnmeldungen, Wartungsbedarf und Nutzung, damit Handlungsbedarf frühzeitig sichtbar wird.',
          },
          {
            title: 'Fahrverhalten nachvollziehen',
            body: 'Brems-, Beschleunigungs-, Geschwindigkeits- und weitere Fahrereignisse lassen sich im Kontext von Fahrer, Fahrzeug und Zeitraum auswerten. Wiederkehrende Auffälligkeiten schaffen eine nachvollziehbare Grundlage für gezielte Nachbelehrungen und interne Maßnahmen.',
          },
          {
            title: 'Abläufe zusammenführen',
            body: 'Fahrzeugdaten, Fahrerinformationen, Aufgaben, Dokumentation und Kommunikation laufen auf einer gemeinsamen Plattform zusammen - statt über mehrere Portale, Tabellen, Messenger und einzelne Anwendungen verteilt zu bleiben.',
          },
        ],
      },
      {
        key: 'passenger-transport',
        title: 'Schüler- & Personenbeförderung',
        body: 'SynqDrive verbindet Fahrzeuge, Fahrer und betriebliche Abläufe - damit Handlungsbedarf früher sichtbar, Maßnahmen nachvollziehbar dokumentiert und wiederkehrende Aufgaben zuverlässig ausgeführt werden.',
        status: 'In Arbeit',
        media: MEDIA.useCases.passengerTransport,
        mediaAlt: 'Kleinbusse für Schüler- und Personenbeförderung an einem Betriebsstandort.',
        features: [
          {
            title: 'Betriebliche Kontrollen automatisieren',
            body: 'Wiederkehrende Prüfungen, Aufgaben, Benachrichtigungen und interne Kontrollen können automatisch angestoßen werden. So werden wichtige Schritte weniger abhängig von manuellen Erinnerungen, einzelnen Mitarbeitern oder verstreuten Listen.',
          },
          {
            title: 'Fahrzeuge zuverlässig einsatzbereit halten',
            body: 'SynqDrive verbindet Fahrzeugzustand, Warnmeldungen, Wartungsbedarf und Verschleiß. Auffälligkeiten werden früh sichtbar, damit notwendige Prüfungen und Maßnahmen rechtzeitig eingeplant werden können.',
          },
          {
            title: 'Fahrverhalten nachvollziehen und verbessern',
            body: 'Brems-, Beschleunigungs-, Geschwindigkeits- und weitere Fahrereignisse lassen sich Fahrern, Fahrzeugen und Zeiträumen zuordnen. Wiederkehrende Auffälligkeiten schaffen eine nachvollziehbare Grundlage für gezielte Nachbelehrungen und interne Maßnahmen.',
          },
          {
            title: 'Kontrollen und Maßnahmen dokumentieren',
            body: 'Fahrerinformationen, Fahrzeugzustand, Aufgaben, Auffälligkeiten und durchgeführte Maßnahmen werden auf einer gemeinsamen Grundlage zusammengeführt - statt über Papier, Tabellen, Messenger und einzelne Anwendungen verteilt zu bleiben.',
          },
        ],
      },
      {
        key: 'delivery-logistics',
        title: 'Lieferung & Logistik',
        body: 'SynqDrive verbindet Fahrzeuge, Fahrer und operative Abläufe - damit Ihre Flotte verfügbar bleibt und Handlungsbedarf nicht erst auffällt, wenn der laufende Betrieb bereits betroffen ist.',
        status: 'In Arbeit',
        media: MEDIA.useCases.deliveryLogistics,
        mediaAlt: 'Lieferfahrzeuge an einem modernen Logistikstandort.',
        features: [
          {
            title: 'Abläufe automatisch anstoßen',
            body: 'Fahrzeugereignisse, Warnmeldungen und definierte Zustände können automatisch Aufgaben, Benachrichtigungen und weitere Prozesse auslösen. So wird aus einer Information direkt der nächste operative Schritt.',
          },
          {
            title: 'Handlungsbedarf früher erkennen',
            body: 'Hohe Laufleistungen und intensive Nutzung belasten Lieferfahrzeuge täglich. SynqDrive verbindet Fahrzeugzustand, Wartungsbedarf, Warnmeldungen und Verschleiß, damit Auffälligkeiten früh sichtbar werden.',
          },
          {
            title: 'Fahrverhalten analysieren',
            body: 'Brems-, Beschleunigungs-, Geschwindigkeits- und weitere Fahrereignisse lassen sich im Kontext von Fahrer, Fahrzeug und Zeitraum auswerten. Wiederkehrende Auffälligkeiten können gezielt untersucht und für Nachbelehrungen oder interne Maßnahmen genutzt werden.',
          },
          {
            title: 'Flotte und Betrieb zusammenführen',
            body: 'Fahrzeugdaten, Fahrerinformationen, Wartung, Aufgaben, Dokumentation und Kommunikation laufen auf einer gemeinsamen Plattform zusammen - statt über Telematik-Portale, Tabellen, Messenger und einzelne Systeme verteilt zu bleiben.',
          },
        ],
      },
    ],
  },
  unified: {
    id: SECTION_IDS.platform,
    eyebrow: 'VOLLSTÄNDIG VERNETZTE MOBILITY OPERATIONS',
    title: 'Alles, was Ihr Betrieb braucht. Vollständig vernetzt.',
    body: 'SynqDrive verbindet Fahrzeuge, Kunden, Buchungen, Teams, Dokumente, Kommunikation und Abrechnung in einer intelligenten Plattform. Live-Fahrzeugdaten machen Zustand, Nutzung und Fahrverhalten transparent. Automatisierte Workflows übernehmen wiederkehrende Aufgaben und reagieren auf operative Ereignisse. KI-Agenten unterstützen Kunden, Fahrer und Mitarbeiter über die verbundenen Kommunikationskanäle.',
    media: MEDIA.unified,
    mediaAlt:
      'SynqDrive Buchungsplan mit allen Flottenfahrzeugen über eine Woche und laufenden, bestätigten sowie abgeschlossenen Vermietungen.',
    cards: [
      {
        icon: 'layers',
        title: 'Eine Plattform für den gesamten Betrieb',
        body: 'Fahrzeuge, Kunden, Buchungen, Aufgaben, Teams, Dokumente, Kommunikation und Abrechnung arbeiten auf einer gemeinsamen Datenbasis zusammen.',
      },
      {
        icon: 'car',
        title: 'Fahrzeuge verstehen. Früher handeln.',
        body: 'Live-Daten, Fahrverhalten, Warnmeldungen und Wartungsbedarf zeigen, was mit Ihrer Flotte passiert und wo Handlungsbedarf entsteht.',
      },
      {
        icon: 'git-merge',
        title: 'Abläufe automatisch ausführen',
        body: 'Ereignisse lösen automatisch die passenden Prozesse aus - von Aufgaben und Benachrichtigungen bis zu Prüfungen und weiteren operativen Schritten.',
      },
      {
        icon: 'message-circle',
        title: 'KI, die im Betrieb mitarbeitet',
        body: 'KI-Agenten greifen auf operativen Kontext zu, unterstützen die Kommunikation mit Kunden, Fahrern und Mitarbeitern und helfen bei Fragen, Entscheidungen und nächsten Schritten.',
      },
    ],
  },
  vehicle: {
    id: SECTION_IDS.vehicle,
    eyebrow: 'VERNETZTE FAHRZEUGINTELLIGENZ',
    title: 'Wissen, was mit Ihrer Flotte passiert. Und wo Sie handeln sollten.',
    body: 'SynqDrive verbindet Live-Fahrzeugdaten, Zustand, Fahrverhalten und Wartungsinformationen mit dem operativen Kontext Ihres Betriebs. So sehen Sie nicht nur, wo ein Fahrzeug steht oder welchen Kilometerstand es hat. Sie erkennen, welche Fahrzeuge einsatzbereit sind, wo sich Handlungsbedarf entwickelt und welche betrieblichen Abläufe davon betroffen sind.',
    media: MEDIA.vehicle,
    mediaAlt:
      'SynqDrive Fahrzeugliste mit Status, Zustand, Station, Aktualität der Telemetrie und Laufleistung pro Fahrzeug.',
    points: [
      {
        title: 'Fahrzeugzustand wirklich verstehen',
        body: 'Standort, Laufleistung, Telemetrie, Warnmeldungen, Batterie, Reifen, Bremsen und Servicestatus ergeben ein gemeinsames Bild des tatsächlichen Fahrzeugzustands - aktuell und nachvollziehbar.',
      },
      {
        title: 'Wartungsbedarf früher erkennen',
        body: 'Veränderungen, Warnmeldungen und Verschleiß werden im Zusammenhang betrachtet. So können notwendige Prüfungen und Wartungen früher eingeplant werden, bevor sie den laufenden Betrieb beeinträchtigen.',
      },
      {
        title: 'Fahrverhalten im Kontext analysieren',
        body: 'Fahrten und relevante Fahrereignisse werden mit Fahrzeug, Fahrer, Zeitpunkt und Nutzung verknüpft. So werden Auffälligkeiten sichtbar und können gezielt geprüft, dokumentiert oder für weitere Maßnahmen genutzt werden.',
      },
    ],
    closing: 'Nicht nur Fahrzeugdaten sehen. Verstehen, was sie für Ihren Betrieb bedeuten.',
  },
  ai: {
    id: SECTION_IDS.ai,
    eyebrow: 'KI-Orchestrierung',
    title: 'Fragen Sie Ihren Betrieb. SynqDrive kennt den Kontext.',
    body: 'Statt Informationen aus Fahrzeugen, Buchungen, Finanzen und Aufgaben selbst zusammenzusuchen, fragen Sie SynqDrive direkt. Die KI liest relevante operative Daten gemeinsam, erkennt Zusammenhänge und liefert nachvollziehbare Antworten und Empfehlungen - mit Quellen, Datenaktualität und menschlicher Freigabe dort, wo sie erforderlich ist.',
    media: MEDIA.ai,
    mediaAlt:
      'SynqDrive KI-Assistent mit strukturierter Antwort auf eine operative Frage, genannten Datenquellen und Hinweis zur Datenaktualität.',
    flowLabel: 'So wird aus Daten eine Entscheidung',
    flow: [
      {
        title: 'Was gerade passiert',
        body: 'Fahrzeugdaten, Buchungen, Finanzen und offene Aufgaben liefern die relevanten Signale aus Ihrem Betrieb.',
      },
      {
        title: 'Zusammenhänge verstehen',
        body: 'SynqDrive betrachtet Informationen nicht isoliert, sondern verbindet sie über Fahrzeuge, Buchungen und operative Prozesse hinweg.',
      },
      {
        title: 'Klar empfehlen',
        body: 'Die KI fasst die Situation verständlich zusammen, zeigt Handlungsbedarf und schlägt konkrete nächste Schritte vor.',
      },
      {
        title: 'Kontrolliert handeln',
        body: 'Wo eine Aktion ausgelöst werden kann, bleiben Freigaben und Risikoregeln Teil des Prozesses. Ihr Team behält die Kontrolle.',
      },
    ],
    governance: [
      {
        title: 'Antworten, die auf Ihren Daten beruhen',
        body: 'SynqDrive zeigt, welche Daten einer Antwort zugrunde liegen und wie aktuell sie sind. Fehlende Informationen werden kenntlich gemacht, statt durch Annahmen ersetzt zu werden.',
      },
      {
        title: 'Ihr Team entscheidet',
        body: 'KI unterstützt bei Analyse, Priorisierung und nächsten Schritten. Entscheidungen mit höherem Risiko folgen den vorgesehenen Freigaben, bevor Änderungen ausgeführt werden.',
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
    eyebrow: 'VERNETZTE KUNDENKOMMUNIKATION',
    title: 'Jede Nachricht. Direkt mit dem richtigen Kontext.',
    body: 'SynqDrive verbindet WhatsApp, E-Mail, Benachrichtigungen und Sprache mit den operativen Informationen dahinter. Buchung, Fahrzeug, Zahlungsstatus und Dokumente stehen dort bereit, wo Kommunikation entsteht. So kann Ihr Team schneller reagieren, ohne Informationen aus verschiedenen Systemen zusammensuchen zu müssen.',
    media: MEDIA.communication,
    mediaAlt:
      'SynqDrive Kundenkonversation neben ihrem operativen Kontext: Buchung, Fahrzeug, Station, Zahlungsstatus und Dokumente.',
    points: [
      {
        title: 'Jede Nachricht im richtigen Kontext',
        body: 'Kundenanfragen stehen direkt im Zusammenhang mit Buchung, Fahrzeug, Station, Zahlungsstatus und offenen Dokumenten. Ihr Team sieht sofort, worum es geht und welche Informationen für die Antwort relevant sind.',
      },
      {
        title: 'Kommunikation zusammenführen',
        body: 'WhatsApp, E-Mail und Benachrichtigungen arbeiten mit demselben Kunden- und Vorgangskontext. Sprache kann in denselben operativen Ablauf eingebunden werden, sofern sie für die Organisation aktiviert ist.',
      },
      {
        title: 'KI unterstützt beim nächsten Schritt',
        body: 'SynqDrive ordnet Informationen aus dem Vorgang ein, unterstützt bei Antworten und hilft bei den nächsten Schritten. Ihr Team behält die Kontrolle über Versand und Eskalation.',
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
