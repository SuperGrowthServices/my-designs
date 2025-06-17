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
      category: "Ordering & Payments",
      questions: [
        {
          question: "How does EasyAuto work?",
          answer: "EasyAuto is an online platform that connects you with multiple auto parts vendors. You request parts, receive quotes from vendors, and place orders directly through our platform."
        },
        {
          question: "Who do I pay when I place an order?",
          answer: "All payments are securely processed through EasyAuto. We handle the full payment process and pay the vendors directly once your order is completed."
        },
        {
          question: "Are prices fixed or do I receive quotes?",
          answer: "You will receive multiple quotes from vendors based on your part request. You can then select your preferred offer."
        },
        {
          question: "What payment methods are accepted?",
          answer: "Payments are processed securely via Stripe. We accept credit cards, debit cards, and other payment methods available at checkout."
        },
        {
          question: "Is my order confirmed immediately after payment?",
          answer: "Yes — once payment is successfully processed, your order is confirmed and moved into the delivery preparation stage."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      questions: [
        {
          question: "Who handles the delivery?",
          answer: "EasyAuto manages delivery through approved logistics partners. Your parts will be collected directly from vendors and delivered to your provided address."
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery times may vary depending on vendor preparation and courier schedules. You will be notified once your order is dispatched."
        },
        {
          question: "Can I track my order?",
          answer: "Yes — you can track your order status through your Buyer Dashboard once your order is dispatched."
        }
      ]
    },
    {
      category: "Refunds, Returns & Cancellations",
      questions: [
        {
          question: "Can I cancel an order after payment?",
          answer: "Once payment is processed, cancellations may only be possible if the vendor agrees and if the order hasn't been dispatched. Please contact our support team immediately."
        },
        {
          question: "What is the refund policy?",
          answer: `Each vendor sets their own refund and return policy. Refund windows may be:
          
• No Refund
• 3 Days
• 7 Days
• 14 Days (rare)
• 30 Days (very rare)

You will see the refund policy for each part before confirming your order.`
        },
        {
          question: "How do I request a refund?",
          answer: "Refund requests must be submitted directly through your Buyer Dashboard within the applicable refund period."
        },
        {
          question: "How will refunds be processed?",
          answer: "Once approved, refunds will be processed back to your original payment method."
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
            Everything you need to know about ordering parts through EasyAuto
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                {category.category === "Ordering & Payments" && "🔧"}
                {category.category === "Shipping & Delivery" && "🚚"}
                {category.category === "Refunds, Returns & Cancellations" && "🔄"}
                {category.category}
              </h3>
              
              <Accordion type="single" collapsible className="space-y-2">
                {category.questions.map((item, questionIndex) => (
                  <AccordionItem 
                    key={questionIndex} 
                    value={`${categoryIndex}-${questionIndex}`}
                    className="border border-gray-100 rounded-lg px-4"
                  >
                    <AccordionTrigger className="text-base font-medium text-gray-800 hover:text-primary text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 text-base leading-relaxed whitespace-pre-line">
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
