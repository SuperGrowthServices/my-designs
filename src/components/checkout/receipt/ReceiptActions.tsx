import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const ReceiptActions: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    toast({
      title: "Generating PDF...",
      description: "Your receipt is being downloaded.",
    });

    try {
      // Capture the entire page (or a specific element with `document.getElementById('receipt')`)
      const canvas = await html2canvas(document.body);
      const imgData = canvas.toDataURL('image/png');
      
      // Create a PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
      });

      // Calculate PDF dimensions to fit the content
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('receipt.pdf');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive",
      });
      console.error("PDF generation failed:", error);
    }
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