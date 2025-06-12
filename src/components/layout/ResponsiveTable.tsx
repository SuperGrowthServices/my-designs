
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data available",
  className = ""
}) => {
  const isMobile = useIsMobile();

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, index) => (
          <Card 
            key={index} 
            className={`${onRowClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
            onClick={() => onRowClick?.(row)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map((column) => {
                    const value = row[column.key];
                    const displayValue = column.render ? column.render(value, row) : value;
                    
                    return (
                      <div key={column.key} className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-600 min-w-0 flex-1">
                          {column.mobileLabel || column.label}:
                        </span>
                        <div className="text-sm text-gray-900 ml-2 flex-shrink-0">
                          {displayValue}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow 
              key={index}
              className={onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = row[column.key];
                const displayValue = column.render ? column.render(value, row) : value;
                
                return (
                  <TableCell key={column.key}>
                    {displayValue}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
