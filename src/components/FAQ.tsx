
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQ = () => {
  const faqData = [
    {
      category: "Orders & Delivery",
      questions: [
        {
          question: "How can I track my order?",
          answer: "You can track your order through your dashboard. Once your order is confirmed, you'll receive a tracking link via email and SMS updates."
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery times vary by location and part availability. Most orders are delivered within 1-3 business days in major UAE cities."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Orders can be modified within the first hour of placement. After that, please contact our support team for assistance."
        }
      ]
    },
    {
      category: "Parts & Warranty",
      questions: [
        {
          question: "What is your warranty policy?",
          answer: "We offer manufacturer warranties on genuine OEM parts and our own warranty on aftermarket parts. Warranty periods vary by part type and manufacturer."
        },
        {
          question: "How do I know if a part is compatible with my vehicle?",
          answer: "Our system automatically filters parts based on your vehicle details. Additionally, our vendors verify compatibility before confirming orders."
        },
        {
          question: "Do you sell genuine OEM parts?",
          answer: "Yes, we work with authorized dealers and verified suppliers who provide both genuine OEM and high-quality aftermarket parts."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept credit cards, debit cards, bank transfers, and cash on delivery for eligible orders."
        },
        {
          question: "How does the bidding system work?",
          answer: "After you submit a part request, verified vendors submit competitive bids. You can compare prices, delivery times, and vendor ratings before choosing."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees. All costs including part price, delivery, and any applicable taxes are clearly displayed before you confirm your order."
        }
      ]
    }
  ];

  return (
    <section className="section-spacing bg-gray-50">
      <div className="container-responsive">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions or contact our support team.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {category.category}
              </h3>
              
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, questionIndex) => (
                  <AccordionItem 
                    key={questionIndex} 
                    value={`${categoryIndex}-${questionIndex}`}
                    className="border border-gray-100 rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-base font-medium text-gray-800 hover:text-primary">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
