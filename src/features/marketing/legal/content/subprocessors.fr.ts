import type { PolicyEdition } from '../policyContent'

export default {
  "title": "Liste des sous-traitants",
  "lastUpdated": "15 juillet 2026",
  "effectiveDate": "1 juin 2026",
  "callout": [
    "Dutiva Canada Inc. (« Dutiva ») fait appel à des fournisseurs de services tiers (« sous-traitants ») pour exploiter et améliorer la plateforme. Cette page répertorie les sous-traitants que nous utilisons actuellement, leur rôle, l'emplacement de leurs opérations de traitement des données et les catégories de données auxquelles ils peuvent avoir accès. Cette liste est mise à jour lorsque nous ajoutons ou modifions des sous-traitants."
  ],
  "sections": [
    {
      "title": "1. Infrastructure et hébergement",
      "blocks": [
        {
          "type": "p",
          "text": "Supabase Inc. — Rôle : base de données, authentification, stockage de fichiers et infrastructure API. Données traitées : données de compte, données d'espace de travail, documents générés, journaux d'utilisation. Lieu de traitement : États-Unis (infrastructure AWS ; région Canada disponible et utilisée lorsqu'elle est configurée)."
        },
        {
          "type": "p",
          "text": "Vercel Inc. — Rôle : hébergement frontend, livraison par réseau périphérique et infrastructure de déploiement. Données traitées : trafic web, métadonnées de requêtes, actifs statiques. Lieu de traitement : États-Unis et nœuds périphériques CDN mondiaux."
        }
      ]
    },
    {
      "title": "2. Services d'IA et de modèles de langage",
      "blocks": [
        {
          "type": "p",
          "text": "DigitalOcean Gradient AI — Rôle : services d'acheminement et d'inférence de modèles d'IA alimentant les réponses du Conseiller Dutiva et la génération de documents. Données traitées : texte des messages du Conseiller, contexte de juridiction, saisies de modèles sélectionnés, contexte d'orientation récupéré. Lieu de traitement : Toronto, Canada. Les données soumises pour inférence sont assujetties aux conditions de traitement des données du fournisseur et ne sont pas utilisées pour entraîner des modèles de fondation de tiers dans le cadre de l'entente de Dutiva."
        }
      ]
    },
    {
      "title": "3. Traitement des paiements",
      "blocks": [
        {
          "type": "p",
          "text": "Stripe, Inc. — Rôle : traitement des paiements, gestion des abonnements et portail de facturation. Données traitées : données de carte de paiement (stockées et traitées par Stripe ; Dutiva ne stocke pas les numéros de carte complets), adresse de facturation, relevés de transactions, statut de l'abonnement. Lieu de traitement : États-Unis."
        }
      ]
    },
    {
      "title": "4. Communication par courriel et communication transactionnelle",
      "blocks": [
        {
          "type": "p",
          "text": "Resend Inc. (ou fournisseur équivalent de courriels transactionnels) — Rôle : livraison de courriels transactionnels, notamment la vérification de compte, la réinitialisation de mot de passe, les notifications de documents, les reçus de facturation et les communications d'assistance. Données traitées : adresse courriel, contenu des messages, métadonnées de livraison. Lieu de traitement : États-Unis."
        }
      ]
    },
    {
      "title": "5. Surveillance et suivi des erreurs",
      "blocks": [
        {
          "type": "p",
          "text": "Sentry (Functional Software, Inc.) — Rôle : suivi des erreurs d'application, surveillance des performances et réponse aux incidents. Données traitées : journaux d'erreurs, traces de pile, métadonnées de requêtes, identifiants de session. Les données sont expurgées pour minimiser les données personnelles avant soumission. Lieu de traitement : États-Unis."
        }
      ]
    },
    {
      "title": "6. Analytique",
      "blocks": [
        {
          "type": "p",
          "text": "Dutiva peut utiliser des outils d'analytique respectueux de la vie privée pour comprendre les tendances d'utilisation globales, l'adoption des fonctionnalités et les performances du produit. Lorsque des outils d'analytique sont utilisés, nous sélectionnons des fournisseurs qui soutiennent la minimisation des données, l'anonymisation et la conformité aux normes canadiennes en matière de protection de la vie privée."
        }
      ]
    },
    {
      "title": "7. Transferts de données transfrontaliers",
      "blocks": [
        {
          "type": "p",
          "text": "La plupart des sous-traitants de Dutiva sont établis aux États-Unis. Les données personnelles transférées vers des sous-traitants américains sont soumises à la législation américaine. Nous sélectionnons des sous-traitants qui maintiennent des garanties techniques et contractuelles appropriées, notamment des accords de traitement des données conformes aux exigences de la LPRPDE."
        },
        {
          "type": "p",
          "text": "Pour les résidents du Québec : les transferts transfrontaliers de renseignements personnels sont soumis aux exigences de la Loi 25 du Québec. Nous effectuons des évaluations des facteurs relatifs à la vie privée pour les transferts transfrontaliers lorsque requis et maintenons une documentation des garanties de transfert."
        }
      ]
    },
    {
      "title": "8. Modifications de la liste des sous-traitants",
      "blocks": [
        {
          "type": "p",
          "text": "Dutiva mettra à jour cette liste lorsque des sous-traitants seront ajoutés, modifiés ou supprimés. Les clients d'entreprise disposant d'accords de traitement des données peuvent bénéficier de délais de préavis spécifiques tels qu'énoncés dans leur accord."
        },
        {
          "type": "p",
          "text": "Pour toute question concernant les sous-traitants ou les transferts de données, contactez privacy@dutiva.ca."
        }
      ]
    }
  ]
} satisfies PolicyEdition
