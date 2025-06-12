
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, ArrowLeft } from 'lucide-react';

export const ReceiptActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your receipt PDF is being generated...",
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button onClick={() => navigate('/dashboard')} variant="outline">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>
      <Button onClick={handlePrint} variant="outline">
        <Printer className="w-4 h-4 mr-2" />
        Print Receipt
      </Button>
      <Button onClick={handleDownload}>
        <Download className="w-4 h-4 mr-2" />
        Download PDF
      </Button>
    </div>
  );
};
