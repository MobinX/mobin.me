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

  export const FaqScript = () =>{
    return <Script
    id="faq-schema"
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(FaqjsonLd),
    }}
  />
  }

