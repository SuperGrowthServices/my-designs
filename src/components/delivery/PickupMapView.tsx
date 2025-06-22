import React, { useState, useEffect, createRef } from 'react';
import { Map as PigeonMap, Marker, Overlay } from "pigeon-maps";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone, MapPin as MapPinIcon } from 'lucide-react';

import { EnrichedPart } from '@/pages/delivery/Pickup';
type GroupedByVendor = {
    vendor: { id: string; name: string; address: string; phone: string; lat: number; lng: number; };
    parts: EnrichedPart[];
};

const VendorList: React.FC<{ vendors: GroupedByVendor[], onVendorSelect: (vendor: GroupedByVendor) => void, selectedVendorId?: string, refs: React.RefObject<HTMLDivElement>[] }> = 
({ vendors, onVendorSelect, selectedVendorId, refs }) => {
    return (
        <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
                {vendors.map((v, index) => {
                     const isSelected = v.vendor.id === selectedVendorId;
                     const totalQty = v.parts.reduce((sum, part) => sum + part.quantity, 0);
                    return (
                        <div key={v.vendor.id} ref={refs[index]}>
                            <Card 
                                className={`cursor-pointer transition-all ${isSelected ? 'border-primary shadow-lg' : 'hover:shadow-md'}`}
                                onClick={() => onVendorSelect(v)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg flex justify-between items-center">
                                        {v.vendor.name}
                                        <Badge>{totalQty} part(s)</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                     <div className="flex items-start text-gray-600">
                                        <MapPinIcon className="h-4 w-4 mr-2 mt-1 shrink-0" />
                                        <span>{v.vendor.address}</span>
                                     </div>
                                      <a href={`tel:${v.vendor.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center text-gray-600 hover:text-primary">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {v.vendor.phone}
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    )
}

const PickupMapView: React.FC<{ data: GroupedByVendor[] }> = ({ data }) => {
    const [center, setCenter] = useState<[number, number]>([25.2048, 55.2708]);
    const [zoom, setZoom] = useState(11);
    const [selectedVendor, setSelectedVendor] = useState<GroupedByVendor | undefined>(data[0]);
    const [hoveredMarker, setHoveredMarker] = useState<GroupedByVendor | null>(null);
    
    const vendorRefs = React.useMemo(() => Array(data.length).fill(0).map(() => createRef<HTMLDivElement>()), [data]);

    const handleVendorSelect = (vendor: GroupedByVendor) => {
        setSelectedVendor(vendor);
        setCenter([vendor.vendor.lat, vendor.vendor.lng]);
        setZoom(14);
    }
    
    const handleMarkerClick = (vendor: GroupedByVendor, index: number) => {
        setSelectedVendor(vendor);
        setCenter([vendor.vendor.lat, vendor.vendor.lng]);
        setZoom(14);
        vendorRefs[index].current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return (
        <div className="h-full w-full flex flex-col-reverse md:flex-row">
            <div className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full border-r bg-gray-50">
                <VendorList vendors={data} onVendorSelect={handleVendorSelect} selectedVendorId={selectedVendor?.vendor.id} refs={vendorRefs} />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4 h-1/2 md:h-full">
                <PigeonMap 
                    center={center} 
                    zoom={zoom}
                    onBoundsChanged={({ center, zoom }) => { 
                        setCenter(center);
                        setZoom(zoom);
                    }}
                >
                    {data.map((v, index) => (
                        <Marker 
                            key={v.vendor.id} 
                            anchor={[v.vendor.lat, v.vendor.lng]}
                            color={selectedVendor?.vendor.id === v.vendor.id ? '#16a34a' : '#ef4444'}
                            onClick={() => handleMarkerClick(v, index)}
                            onMouseOver={() => setHoveredMarker(v)}
                            onMouseOut={() => setHoveredMarker(null)}
                        />
                    ))}

                    {hoveredMarker && (
                        <Overlay anchor={[hoveredMarker.vendor.lat, hoveredMarker.vendor.lng]} offset={[120, 79]}>
                             <Card className="w-56">
                                <CardHeader className="p-2">
                                    <CardTitle className="text-base">{hoveredMarker.vendor.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-2 text-xs">
                                    <p>{hoveredMarker.parts.reduce((sum, p) => sum + p.quantity, 0)} parts to pick up</p>
                                    <ul className="list-disc pl-4 mt-1">
                                        {hoveredMarker.parts.map(p => <li key={p.id}>{p.partName} (x{p.quantity})</li>)}
                                    </ul>
                                </CardContent>
                            </Card>
                        </Overlay>
                    )}
                </PigeonMap>
            </div>
        </div>
    );
};

export default PickupMapView; 