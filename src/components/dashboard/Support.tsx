
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';

export const Support: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    orderNumber: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('send-support-email', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          orderNumber: formData.orderNumber
        }
      });

      if (error) {
        throw error;
      }

      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        orderNumber: ''
      });

      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error sending support email:', error);
      toast({
        title: "Error sending message",
        description: "Unable to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      category: "Orders & Delivery",
      items: [
        {
          question: "How can I track my order?",
          answer: "You can track your order status in the 'Order History' section of your dashboard. We'll also send you email updates when your order status changes."
        },
        {
          question: "How long does delivery take?",
          answer: "Delivery typically takes 2-5 business days within the UAE. Remote areas may take an additional 1-2 days."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Orders can be modified within 1 hour of placement. After that, please contact our support team for assistance."
        }
      ]
    },
    {
      category: "Parts & Warranty",
      items: [
        {
          question: "What is your warranty policy?",
          answer: "We offer a 7-day warranty on all parts. If you receive a defective or incorrect part, contact us within 7 days for a replacement or refund."
        },
        {
          question: "How do I know if a part is compatible with my vehicle?",
          answer: "Our vendors verify part compatibility before bidding. Always double-check your vehicle's make, model, year, and VIN when placing orders."
        },
        {
          question: "Do you sell genuine OEM parts?",
          answer: "We work with verified vendors who supply both genuine OEM and high-quality aftermarket parts. Part authenticity is clearly indicated in vendor bids."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      items: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and bank transfers through our secure payment gateway."
        },
        {
          question: "How does the bidding system work?",
          answer: "After you submit a parts request, verified vendors submit bids with their prices and delivery times. You can review and accept the best offer."
        },
        {
          question: "Are there any hidden fees?",
          answer: "No hidden fees. The price you see in the accepted bid includes all costs except delivery, which is clearly stated separately."
        }
      ]
    },
    {
      category: "Account & Support",
      items: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email address."
        },
        {
          question: "Can I become a vendor?",
          answer: "Yes! Apply to become a vendor through the 'Settings' section in your dashboard. We'll review your application and contact you within 2-3 business days."
        },
        {
          question: "How do I contact customer support?",
          answer: "You can reach us through this support form, email us at hello@sgservices.ae, or WhatsApp us for urgent matters."
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Center</h1>
        <p className="text-gray-600">Find answers to common questions or contact our support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* FAQs Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {category.items.map((faq, faqIndex) => (
                      <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                        <AccordionTrigger className="text-left text-sm font-medium">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-gray-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </Accordion>
        </div>

        {/* Contact Form Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Contact Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showSuccess ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-green-700 mb-2">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Thanks for your message. We'll get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order-inquiry">Order Inquiry</SelectItem>
                        <SelectItem value="payment-issue">Payment Issue</SelectItem>
                        <SelectItem value="part-compatibility">Part Compatibility</SelectItem>
                        <SelectItem value="warranty-claim">Warranty Claim</SelectItem>
                        <SelectItem value="delivery-issue">Delivery Issue</SelectItem>
                        <SelectItem value="account-help">Account Help</SelectItem>
                        <SelectItem value="vendor-application">Vendor Application</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="orderNumber">Order Number (Optional)</Label>
                    <Select value={formData.orderNumber} onValueChange={(value) => setFormData(prev => ({ ...prev, orderNumber: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an order (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            Order #{order.id.slice(0, 8)} - {new Date(order.created_at).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your issue or question..."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
