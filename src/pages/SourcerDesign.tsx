import React, { useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { Menu, X } from 'lucide-react';

// Interface for a quote submitted by a sourcer
interface SourcerQuote {
  price: number;
  condition: 'New' | 'Used' | 'Reconditioned' | '';
  warranty: string;
  sourcerNotes?: string;
  images: string[];
}

interface PartRequest {
  id: string;
  partName: string;
  buyerNotes: string;
  quantity: number;
  conditionNeeded: string;
  budget?: string;
  quoteStatus: 'Pending' | 'Submitted' | 'Accepted';
  quote?: SourcerQuote;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  parts: PartRequest[];
}

interface Order {
  id: string;
  vehicle: Vehicle;
  buyerBudget?: string;
  totalPartsAssigned: number;
}

const SourcerDesign: React.FC = () => {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isViewQuoteModalOpen, setIsViewQuoteModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartRequest | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [quoteForm, setQuoteForm] = useState({
    price: '',
    condition: '' as SourcerQuote['condition'],
    warranty: '',
    sourcerNotes: '',
    imageFiles: null as FileList | null,
  });

  // Mock data for demonstration
  const sourcerName = "John Smith";
  const metrics = {
    assignedRequests: 12,
    buyerPending: 5,
    acceptedQuotes: 23
  };

  const navigationItems = [
    { name: "Dashboard", route: "/sourcer/dashboard", icon: "📊" },
    { name: "Quote History", route: "/sourcer/history", icon: "📁" },
    { name: "Support", route: "/sourcer/support", icon: "💬" },
    { name: "Settings", route: "/sourcer/settings", icon: "⚙️" }
  ];

  // Mock assigned requests data
  const [assignedRequests, setAssignedRequests] = useState<Order[]>([
    {
      id: "ORD-001",
      vehicle: {
        id: "V1",
        make: "Toyota",
        model: "Camry",
        year: 2020,
        vin: "1HGBH41JXMN109186",
        parts: [
          {
            id: "P1",
            partName: "Front Bumper",
            buyerNotes: "Needs to match factory color - Pearl White",
            quantity: 1,
            conditionNeeded: "New or Used",
            budget: "AED 400 - 600",
            quoteStatus: "Pending",
          },
          {
            id: "P2",
            partName: "Headlight Assembly",
            buyerNotes: "Driver side, LED preferred",
            quantity: 1,
            conditionNeeded: "New",
            budget: "AED 800 - 1200",
            quoteStatus: "Submitted",
            quote: {
                price: 950,
                condition: 'New',
                warranty: '1 year',
                sourcerNotes: 'Genuine Toyota part, brand new in box. Ready for immediate dispatch.',
                images: [
                    "/assets/parts/download (1).jpeg",
                    "/assets/parts/download (2).jpeg",
                    "/assets/parts/images (1).jpeg"
                ]
            }
          }
        ]
      },
      buyerBudget: "AED 2000 - 3000",
      totalPartsAssigned: 2
    },
    {
      id: "ORD-002",
      vehicle: {
        id: "V2",
        make: "Honda",
        model: "Civic",
        year: 2019,
        vin: "2T1BURHE0JC123456",
        parts: [
          {
            id: "P3",
            partName: "Rear Bumper",
            buyerNotes: "Any color, will be painted",
            quantity: 1,
            conditionNeeded: "Used",
            budget: "AED 200 - 400",
            quoteStatus: "Pending"
          }
        ]
      },
      totalPartsAssigned: 1
    }
  ]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    newExpanded.has(orderId) ? newExpanded.delete(orderId) : newExpanded.add(orderId);
    setExpandedOrders(newExpanded);
  };

  const openQuoteModal = (part: PartRequest) => {
    setSelectedPart(part);
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setSelectedPart(null);
    setQuoteForm({ price: '', condition: '', warranty: '', sourcerNotes: '', imageFiles: null });
  };
  
  const openViewQuoteModal = (part: PartRequest) => {
    setSelectedPart(part);
    setIsViewQuoteModalOpen(true);
  }

  const closeViewQuoteModal = () => {
    setIsViewQuoteModalOpen(false);
    setSelectedPart(null);
  }

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;

    const imageUrls = quoteForm.imageFiles
        ? Array.from(quoteForm.imageFiles).map(file => URL.createObjectURL(file))
        : [];

    const newQuote: SourcerQuote = {
        price: parseFloat(quoteForm.price),
        condition: quoteForm.condition,
        warranty: quoteForm.warranty,
        sourcerNotes: quoteForm.sourcerNotes,
        images: imageUrls
    };

    const updatedRequests = assignedRequests.map(order => ({
        ...order,
        vehicle: {
            ...order.vehicle,
            parts: order.vehicle.parts.map(part => {
                if (part.id === selectedPart.id) {
                    return { ...part, quoteStatus: 'Submitted' as const, quote: newQuote };
                }
                return part;
            })
        }
    }));
    setAssignedRequests(updatedRequests);
    closeQuoteModal();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Accepted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 md:flex">
      {/* Sidebar: fixed on mobile, part of flex on desktop */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Sourcer Portal</h2>
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X className="h-6 w-6" />
                    </button>
                </div>
                <nav className="space-y-2">
                    {navigationItems.map((item, index) => (
                      <a
                        key={index}
                        href={item.route}
                        className="flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span className="font-medium">{item.name}</span>
                      </a>
                    ))}
                </nav>
            </div>
            <div className="mt-auto p-6">
                 <button className="w-full flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                    <span className="text-lg mr-3">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Main content */}
      <main className="flex-1">
        {/* Header with hamburger */}
        <header className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 sm:px-8 py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button className="md:hidden mr-4" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Sourcer Dashboard</h1>
                        <p className="text-gray-600 mt-1 hidden sm:block">
                        Manage part requests, submit quotes, and track your history.
                        </p>
                    </div>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {sourcerName}
                  </span>
                </div>
            </div>
        </header>

        {/* Content body */}
        <div className="p-4 sm:p-8">
          {/* Dashboard Summary Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Assigned Requests Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Assigned Requests</h3>
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {metrics.assignedRequests}
              </div>
              <p className="text-sm text-gray-600">
                Unquoted part requests assigned to you
              </p>
            </div>

            {/* Buyer Pending Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Buyer Pending</h3>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {metrics.buyerPending}
              </div>
              <p className="text-sm text-gray-600">
                Submitted quotes awaiting buyer action
              </p>
            </div>

            {/* Accepted Quotes Card */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Accepted Quotes</h3>
                <span className="text-2xl">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {metrics.acceptedQuotes}
              </div>
              <p className="text-sm text-gray-600">
                Total quotes accepted by buyers
              </p>
            </div>
          </div>

          {/* Assigned Requests Table */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Assigned Requests</h2>
              <p className="text-sm text-gray-600 mt-1">Parts pending quote submission</p>
            </div>

            <div className="divide-y divide-gray-200">
              {assignedRequests.map((order) => (
                <div key={order.id} className="p-6">
                  {/* Order Section Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleOrderExpansion(order.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                          Order {order.id}
                        </h3>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {order.vehicle.parts.length} Parts
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p><strong>Vehicle:</strong> {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</p>
                        <p><strong>VIN:</strong> {order.vehicle.vin}</p>
                        {order.buyerBudget && (
                          <p><strong>Budget Range:</strong> {order.buyerBudget}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">
                        {expandedOrders.has(order.id) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>

                  {/* Part Request Rows */}
                  {expandedOrders.has(order.id) && (
                    <div className="mt-4 space-y-4">
                      {order.vehicle.parts.map((part) => (
                        <div key={part.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h4 className="font-semibold text-gray-800">{part.partName}</h4>
                              <p className="text-sm text-gray-600 mt-1">{part.buyerNotes}</p>
                              {/* Carousel for part images */}
                              {part.quote && part.quote.images.length > 0 && (
                                <div className="mt-2">
                                  <Carousel className="w-full max-w-xs">
                                    <CarouselContent>
                                      {part.quote.images.map((img, idx) => (
                                        <CarouselItem key={idx}>
                                          <img src={img} alt={`Part ${part.partName} image ${idx+1}`} className="rounded-lg object-cover w-full h-32" />
                                        </CarouselItem>
                                      ))}
                                    </CarouselContent>
                                    <CarouselPrevious />
                                    <CarouselNext />
                                  </Carousel>
                                </div>
                              )}
                            </div>
                            <div className="text-sm">
                              <p><strong>Qty:</strong> {part.quantity}</p>
                              <p><strong>Condition:</strong> {part.conditionNeeded}</p>
                            </div>
                            <div className="text-sm">
                              {part.budget && (
                                <p><strong>Budget:</strong> {part.budget}</p>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(part.quoteStatus)}`}>
                                {part.quoteStatus}
                              </span>
                            </div>
                            <div className="text-right">
                              {part.quoteStatus === 'Pending' && (
                                <button
                                  onClick={() => openQuoteModal(part)}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                  Submit Quote
                                </button>
                              )}
                              {part.quoteStatus === 'Submitted' && part.quote && (
                                <div className="flex items-center justify-end gap-2">
                                    <img src={part.quote.images[0]} alt="Part preview" className="w-12 h-12 object-cover rounded-md"/>
                                    <button onClick={() => openViewQuoteModal(part)} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">View Quote</button>
                                </div>
                              )}
                              {part.quoteStatus === 'Accepted' && (
                                <span className="text-green-600 text-sm font-semibold">Quote Accepted</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* View All Quotes Button */}
            <div className="px-6 py-4 border-t border-gray-200">
              <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                View All Quotes Submitted
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Quote Submission Modal */}
      {isQuoteModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Submit Quote</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedPart.partName}</p>
            </div>

            <form onSubmit={handleQuoteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (AED)
                </label>
                <input
                  type="number"
                  value={quoteForm.price}
                  onChange={(e) => setQuoteForm({...quoteForm, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition
                </label>
                <select
                  value={quoteForm.condition}
                  onChange={(e) => setQuoteForm({...quoteForm, condition: e.target.value as SourcerQuote['condition']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select condition</option>
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Reconditioned">Reconditioned</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warranty
                </label>
                <input
                  type="text"
                  value={quoteForm.warranty}
                  onChange={(e) => setQuoteForm({...quoteForm, warranty: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 6 months, 1 year"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sourcer Notes
                </label>
                <textarea
                  value={quoteForm.sourcerNotes}
                  onChange={(e) => setQuoteForm({...quoteForm, sourcerNotes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Additional notes for the buyer..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Upload (up to 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setQuoteForm({...quoteForm, imageFiles: e.target.files})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeQuoteModal}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isViewQuoteModalOpen && selectedPart && selectedPart.quote && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b">
                <h3 className="text-xl font-bold text-gray-800">Submitted Quote Details</h3>
                <p className="text-sm text-gray-600">For part: {selectedPart.partName}</p>
            </div>
            <div className="p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Price</h4>
                        <p className="text-2xl font-bold text-blue-600">AED {selectedPart.quote.price}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Condition</h4>
                        <p className="text-lg text-gray-800">{selectedPart.quote.condition}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Warranty</h4>
                        <p className="text-lg text-gray-800">{selectedPart.quote.warranty}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md border">{selectedPart.quote.sourcerNotes || 'No additional notes provided.'}</p>
                    </div>
                </div>
                {/* Right Column: Image Carousel */}
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-500">Part Images</h4>
                    <Carousel className="w-full">
                        <CarouselContent>
                            {selectedPart.quote.images.map((img, idx) => (
                                <CarouselItem key={idx}>
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                                        <img src={img} alt={`Part ${selectedPart.partName} image ${idx + 1}`} className="object-cover w-full h-full" />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                    </Carousel>
                </div>
            </div>
            <div className="px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={closeViewQuoteModal}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourcerDesign; 