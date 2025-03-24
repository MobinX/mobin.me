import Script from "next/script";
import { FAQPage, WithContext ,  Person} from "schema-dts";
const FaqjsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Why should my password be unique?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "If you use the same password for both your email account and your bank account login, an attacker only needs to steal one password to get access to both accounts, doubling your exposure. If you've used that same password for 14 different accounts, you're making the attacker's job very, very easy. You can protect yourself by using a our Secret Password Generator to create unique passwords.",
        },
      }
    ],
    headline: "Strong Random Secrets and Password Generator",
    description:
      "Free online tool to generate random strings and passwords in various formats.",
    author: {
      "@type": "Person",
      name: "Luca Restagno",
      url: "<https://lucarestagno.com>",
    },
    image: "",
    datePublished: "2023-12-10",
    dateModified: "2023-12-28",
  };

const MyselfjsonLd: WithContext<Person> = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Md. Mobin Chowdhury",
  description: "A highly motivated and aspiring AI researcher with a strong background in deep learning, quantum computing, and web development. Currently an undergraduate physics student at the University of Dhaka.",
  jobTitle: "Undergraduate Student",
  image: "https://mobinx.vercel.app/images/profile.png",
  gender: "Male",
  alternateName: "Mobin Chowdhury",
  callSign: "Mobin",
  additionalName: "Md. Mobin",
  familyName: "Chowdhury",
  givenName: "Mobin",
  height: "1.75m",
  homeLocation: {
    "@type": "Place",
    name: "Teghoria, Rajanagar, Munshiganj, Dhaka, Bangladesh",
    address: {
      "@type": "PostalAddress", 
      addressLocality: "Munshiganj",
      addressRegion: "Dhaka",
      addressCountry: "Bangladesh",
      postalCode: "1219"
    }
  },
  birthPlace: {
    "@type": "Place",
    name: "Dhaka, Bangladesh"
  },
  nationality: {
    "@type": "Country",
    name: "Bangladesh"
  },
  email: "mobin0219@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Khilgaon",
    addressRegion: "Dhaka",
    addressCountry: "Bangladesh",
    postalCode: "1219"
  },
  affiliation: {
    "@type": "Organization",
    name: "Department of Physics, University of Dhaka",
    url: "https://www.du.ac.bd/body/PHY"
  },
  alumniOf: [
    {
      "@type": "EducationalOrganization",
      name: "National Ideal College",
      url: "https://deb132078.dhakaeducationboard.gov.bd/"
    },
    {
      "@type": "EducationalOrganization",
      name: "National Ideal School",
      url: "https://deb132078.dhakaeducationboard.gov.bd/"
    }
  ],
  worksFor: {
    "@type": "Organization",
    name: "Department of Physics, University of Dhaka",
    url: "https://www.du.ac.bd/body/PHY"
  },
  knowsAbout: [
    "Artificial Intelligence",
    "Deep Learning",
    "Quantum Computing",
    "Quantum AI",
    "Web Development",
    "PyTorch",
    "Large Language Models"
  ],
  skills: [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "PyTorch",
    "TensorFlow",
    "Quantum Computing",
    "Next.js",
    "Mathematics",
    "Physics",
    "Research",
    "Data Analysis"
  ],
  sameAs: [
    "https://scholar.google.com/citations?user=-ODlgXgAAAAJ",
    "https://github.com/MobinX",
    "https://www.linkedin.com/in/mobinx/",
    "https://x.com/mobincx"
  ],
  url: "https://mobinx.vercel.app",
  
  knowsLanguage: [
    {
      "@type": "Language",
      name: "English"
    },
    {
      "@type": "Language",
      name: "Bengali"
    }
  ],
};

export const FaqScript = () =>{
    return <Script
    id="faq-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(FaqjsonLd),
    }}
  />
}

export const MySelfScript = () => {
  return <Script
    id="person-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(MyselfjsonLd),
    }}
  />
}

