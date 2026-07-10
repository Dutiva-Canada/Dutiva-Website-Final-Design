import type { PolicyEdition } from '../policyContent'

export default {
  "title": "Subprocessor List",
  "lastUpdated": "June 1, 2026",
  "effectiveDate": "June 1, 2026",
  "callout": [
    "Dutiva Canada Inc. (\"Dutiva\") uses third-party service providers (\"subprocessors\") to operate and improve the platform. This page lists the subprocessors we currently use, their purpose, the location of their data processing operations, and the categories of data they may access. This list is updated when we add or change subprocessors."
  ],
  "sections": [
    {
      "title": "1. Infrastructure and Hosting",
      "blocks": [
        {
          "type": "p",
          "text": "Supabase Inc. — Purpose: Database, authentication, file storage, and backend API infrastructure. Data processed: Account data, workspace data, generated documents, usage logs. Processing location: United States (AWS infrastructure; Canada region available and used where configured)."
        },
        {
          "type": "p",
          "text": "Vercel Inc. — Purpose: Frontend hosting, edge network delivery, and deployment infrastructure. Data processed: Web traffic, request metadata, static assets. Processing location: United States and global CDN edge nodes."
        }
      ]
    },
    {
      "title": "2. AI and Language Model Services",
      "blocks": [
        {
          "type": "p",
          "text": "Hugging Face — Purpose: AI model routing and inference services powering Dutiva Advisor responses and document generation. Data processed: Advisor message text, jurisdiction context, selected template inputs, retrieved guidance context. Processing location: United States. Data submitted for inference is subject to the provider's data processing terms and is not used to train third-party foundation models under Dutiva's arrangement."
        }
      ]
    },
    {
      "title": "3. Payment Processing",
      "blocks": [
        {
          "type": "p",
          "text": "Stripe, Inc. — Purpose: Payment processing, subscription management, and billing portal. Data processed: Payment card data (stored and processed by Stripe; Dutiva does not store full card numbers), billing address, transaction records, subscription status. Processing location: United States."
        }
      ]
    },
    {
      "title": "4. Email and Transactional Communication",
      "blocks": [
        {
          "type": "p",
          "text": "Resend Inc. (or equivalent transactional email provider) — Purpose: Transactional email delivery including account verification, password reset, document notifications, billing receipts, and support communications. Data processed: Email address, message content, delivery metadata. Processing location: United States."
        }
      ]
    },
    {
      "title": "5. Monitoring and Error Tracking",
      "blocks": [
        {
          "type": "p",
          "text": "Sentry (Functional Software, Inc.) — Purpose: Application error tracking, performance monitoring, and incident response. Data processed: Error logs, stack traces, request metadata, session identifiers. Data is scrubbed to minimize personal data before submission. Processing location: United States."
        }
      ]
    },
    {
      "title": "6. Analytics",
      "blocks": [
        {
          "type": "p",
          "text": "Dutiva may use privacy-preserving analytics tools to understand aggregate usage patterns, feature adoption, and product performance. Where analytics tools are used, we select providers that support data minimization, anonymization, and compliance with Canadian privacy standards. Specific providers will be listed here as they are added."
        }
      ]
    },
    {
      "title": "7. Cross-Border Data Transfers",
      "blocks": [
        {
          "type": "p",
          "text": "Most of Dutiva's subprocessors are based in the United States. Personal data transferred to U.S.-based subprocessors is subject to U.S. law, including potential access by U.S. government authorities under applicable surveillance laws. We select subprocessors that maintain appropriate technical and contractual safeguards, including data processing agreements aligned with PIPEDA requirements."
        },
        {
          "type": "p",
          "text": "For Quebec residents: cross-border transfers of personal information are subject to requirements under Quebec Law 25 (Act Respecting the Protection of Personal Information in the Private Sector). We conduct privacy impact assessments for cross-border transfers where required and maintain documentation of transfer safeguards."
        }
      ]
    },
    {
      "title": "8. Subprocessor Changes",
      "blocks": [
        {
          "type": "p",
          "text": "Dutiva will update this list when subprocessors are added, changed, or removed. We aim to provide reasonable notice of material changes to our subprocessor list. Enterprise customers with data processing agreements may be entitled to specific notice periods as set out in their agreement."
        },
        {
          "type": "p",
          "text": "For questions about subprocessors or data transfers, contact privacy@dutiva.ca."
        }
      ]
    }
  ]
} satisfies PolicyEdition
