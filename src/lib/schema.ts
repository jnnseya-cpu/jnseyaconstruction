import { contact, group, groupLegalEntity, office } from "@/content/settings";
import type { Faq, Vacancy } from "@/content/types";
import { closingInstant, siteUrl } from "./cms";

const address = {
  "@type": "PostalAddress",
  streetAddress: office.streetAddress,
  addressLocality: office.locality,
  postalCode: office.postalCode,
  addressCountry: office.country,
};

export function organizationSchema() {
  const url = siteUrl();
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${url}/#organization`,
      name: group.name,
      legalName: groupLegalEntity.legalName,
      url,
      logo: `${url}/icon.svg`,
      identifier: { "@type": "PropertyValue", propertyID: "Companies House company number", value: groupLegalEntity.companyNumber },
      address,
      sameAs: [group.etablixUrl],
      ...(contact.email ? { email: contact.email } : {}),
      ...(contact.phone ? { telephone: contact.phone } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${url}/#birmingham-office`,
      name: `${group.name}, Birmingham`,
      parentOrganization: { "@id": `${url}/#organization` },
      address,
      url,
      ...(contact.phone ? { telephone: contact.phone } : {}),
    },
  ];
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function serviceSchema(name: string, description: string, providerName: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: `${siteUrl()}${path}`,
    areaServed: { "@type": "Country", name: "United Kingdom" },
    provider: { "@type": "Organization", name: providerName, parentOrganization: { "@id": `${siteUrl()}/#organization` } },
  };
}

const employmentType: Record<Vacancy["contractType"], string> = {
  permanent: "FULL_TIME",
  "fixed-term": "TEMPORARY",
  apprenticeship: "FULL_TIME",
  "part-time": "PART_TIME",
};

/** JobPosting for Google Jobs (CR-06). */
export function jobPostingSchema(v: Vacancy, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: v.title,
    description,
    datePosted: v.postedDate,
    validThrough: closingInstant(v.closingDate).toISOString(),
    employmentType: employmentType[v.contractType],
    hiringOrganization: { "@type": "Organization", name: v.employer, sameAs: siteUrl(), logo: `${siteUrl()}/icon.svg` },
    jobLocation: { "@type": "Place", address: { ...address, streetAddress: undefined, addressLocality: v.location } },
    baseSalary: {
      "@type": "MonetaryAmount",
      currency: "GBP",
      value: { "@type": "QuantitativeValue", minValue: v.salary.min, maxValue: v.salary.max, unitText: v.salary.period },
    },
    directApply: true,
    url: `${siteUrl()}/careers/vacancies/${v.slug}`,
  };
}
