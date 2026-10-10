export type LegalSectionId = 'terms' | 'privacy' | 'disclaimer' | 'report';

export interface LegalClause {
  id: string;
  heading: string;
  body: string[];
}

export interface LegalSection {
  id: LegalSectionId;
  label: string;
  title: string;
  summary: string;
  clauses: LegalClause[];
}

export const LEGAL_CONTACT_EMAIL = 'hello@thakurganj.connect';
export const LEGAL_EFFECTIVE_DATE = '9 October 2026';

export const LEGAL_SECTIONS: LegalSection[] = [
  {
    id: 'terms',
    label: 'Terms & Conditions',
    title: 'Terms & Conditions',
    summary: 'The rules for using Thakurganj Connect and submitting listings.',
    clauses: [
      {
        id: 'purpose',
        heading: 'Purpose of the service',
        body: [
          'Thakurganj Connect provides general information about Thakurganj and nearby areas, including local businesses, services, institutions, public facilities and community resources. The website and any related app are provided for informational and community-discovery purposes.',
        ],
      },
      {
        id: 'accuracy',
        heading: 'No guarantee of accuracy',
        body: [
          'We aim to keep information useful and accurate, but we do not guarantee that listings, addresses, contact details, opening hours, descriptions, photographs, directions or other content are complete, current or error-free. Verify important information with the business, service provider or relevant authority before relying on it.',
        ],
      },
      {
        id: 'third-party',
        heading: 'Third-party information and content',
        body: [
          'Information may come from business submissions, publicly accessible sources, official sources and other third parties. Public availability does not necessarily grant permission to reproduce content. We seek to use content we own, have permission to use, or are otherwise legally entitled to display. If you believe material infringes your rights, contact us using the reporting process.',
        ],
      },
      {
        id: 'submissions',
        heading: 'Business submissions',
        body: [
          'By submitting a listing, you confirm that you are authorized to provide the information, that it is accurate to the best of your knowledge, and that you have the necessary rights to any images or other materials submitted. You grant us permission to display and format that submitted content for the service. Do not submit misleading, unlawful, abusive or infringing content.',
        ],
      },
      {
        id: 'endorsements',
        heading: 'Listings are not endorsements',
        body: [
          'Inclusion in the directory does not mean that we verify, certify, recommend or endorse a business, professional, school, clinic, service or other organization. We are not a party to transactions or arrangements between visitors and listed providers.',
        ],
      },
      {
        id: 'health-safety',
        heading: 'Health, safety and official information',
        body: [
          'Information about clinics, healthcare, transport, public services or emergencies is general information only. It is not professional medical, legal or financial advice, and it should not replace guidance from qualified professionals or official authorities.',
        ],
      },
      {
        id: 'external-links',
        heading: 'External links and maps',
        body: [
          'Our website may link to third-party websites, maps, telephone services and messaging platforms. Those services are operated by others and may have separate terms and privacy practices.',
        ],
      },
      {
        id: 'acceptable-use',
        heading: 'Acceptable use',
        body: [
          "Do not misuse the platform, submit false information, infringe others' rights, attempt unauthorized access, or interfere with its availability or security.",
        ],
      },
      {
        id: 'corrections',
        heading: 'Corrections and removals',
        body: [
          'We may edit, decline, suspend or remove listings or content where appropriate, including when information is inaccurate, outdated, disputed, unlawful or potentially harmful. We will review reports but cannot guarantee a particular response time or outcome.',
        ],
      },
      {
        id: 'liability',
        heading: 'Availability and liability',
        body: [
          'The service is provided on an “as available” basis. To the extent permitted by applicable law, we disclaim warranties and limit responsibility for losses arising from reliance on inaccurate information, third-party services or interruptions to the platform. Nothing here excludes rights or liabilities that cannot lawfully be excluded.',
        ],
      },
      {
        id: 'changes',
        heading: 'Changes',
        body: [
          'We may update these terms as the service changes. The effective date will be updated when material revisions are published.',
        ],
      },
    ],
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    title: 'Privacy Policy',
    summary: 'What information we receive, how we use it and how to ask for changes.',
    clauses: [
      {
        id: 'collect',
        heading: 'Information we collect',
        body: [
          'Depending on how you use the service, we may receive information you voluntarily provide, such as your name, business or professional name, business category, address or locality, phone number, email address, descriptions and content submitted for a listing.',
          'We may also process limited technical information necessary to operate, secure and troubleshoot the website, such as request logs and device or browser information.',
        ],
      },
      {
        id: 'use',
        heading: 'How we use information',
        body: [
          'We use information to publish and maintain listings, help visitors find local services, respond to questions or correction requests, improve site functionality, and prevent misuse.',
        ],
      },
      {
        id: 'public-listings',
        heading: 'Public listings',
        body: [
          'Details submitted for a public business or professional listing may be visible to anyone and may be indexed by search engines. Only submit contact information you are authorized and willing to make public. Avoid entering private home addresses or personal phone numbers unless you intend them to be public.',
        ],
      },
      {
        id: 'sharing',
        heading: 'Sharing',
        body: [
          'We do not sell personal information. We may use hosting, infrastructure or other service providers to operate the platform, and may disclose information when legally required.',
        ],
      },
      {
        id: 'cookies',
        heading: 'Cookies, analytics and third parties',
        body: [
          'The site may use necessary browser storage and third-party infrastructure. If analytics, advertising, embedded maps, tracking cookies or other services are enabled, this policy will identify them and explain any required choices or consent.',
        ],
      },
      {
        id: 'retention',
        heading: 'Data retention and security',
        body: [
          'We retain information for as long as reasonably needed for the purposes described, subject to legal obligations and operational requirements. We take reasonable security precautions, but no internet service can guarantee absolute security.',
        ],
      },
      {
        id: 'removal',
        heading: 'Corrections and removal requests',
        body: [
          "To request correction or removal of a listing or personal contact information, email us with the listing link, the requested change and enough information for us to assess your request. We may need to verify authorization before changing another person's or business's details.",
        ],
      },
      {
        id: 'children',
        heading: "Children's information",
        body: [
          "Do not submit children's personal contact details or other sensitive information through public listing forms. If you believe such information has been published, please report it promptly.",
        ],
      },
      {
        id: 'updates',
        heading: 'Updates',
        body: ['We may revise this policy and update its effective date.'],
      },
    ],
  },
  {
    id: 'disclaimer',
    label: 'Disclaimer',
    title: 'Information & Copyright Disclaimer',
    summary: 'Thakurganj Connect is an independent community service, not an official website.',
    clauses: [
      {
        id: 'independent',
        heading: 'Independent, not official',
        body: [
          'Thakurganj Connect is an independent local information platform and is not an official government website. Content is provided to help people discover local businesses, places and services.',
        ],
      },
      {
        id: 'sources',
        heading: 'Where information comes from',
        body: [
          'Some information is submitted by third parties or gathered from publicly accessible online sources. Despite reasonable efforts, content may contain mistakes, omissions or outdated details.',
        ],
      },
      {
        id: 'copyright',
        heading: 'Copyright and ownership',
        body: [
          'Photographs, names, logos and other materials may belong to their respective owners. Display of such material does not imply ownership, affiliation or endorsement.',
          'If you own rights to material displayed here and believe its use is unauthorized, please report it. We will review the concern and take appropriate action, which may include correction, attribution or removal.',
        ],
      },
      {
        id: 'verify',
        heading: 'Verify before you rely',
        body: [
          'Always confirm opening hours, phone numbers, directions, qualifications, availability, prices and other important details directly with the relevant provider.',
        ],
      },
    ],
  },
  {
    id: 'report',
    label: 'Report an Issue',
    title: 'Report an Issue or Request Removal',
    summary:
      'Found incorrect information, a closed business, a wrong phone number, an image concern or a privacy issue? Tell us so we can review it.',
    clauses: [],
  },
];

export const REPORT_GUIDELINES = [
  'Include the link to the listing or page.',
  'Describe what is incorrect or why you are requesting removal.',
  'If relevant, say whether you are the business owner, person concerned or copyright holder.',
  'Include supporting information if available, but do not send identification documents unless we ask through a secure process.',
];

export const REPORT_ISSUE_TYPES = [
  'Incorrect information',
  'Business has closed',
  'Wrong phone number or address',
  'Image or copyright concern',
  'Privacy or removal request',
  'Something else',
];
