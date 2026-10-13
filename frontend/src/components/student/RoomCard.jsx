import React from 'react';
import { Bed, Eye, UserPlus, Wrench } from 'lucide-react';

const RoomCard = ({ room, onViewDetails, onAllocate, onToggleStatus }) => {
  const isFull = room.currentOccupancy >= room.capacity;
  const isMaintenance = room.status === 'maintenance';
  const availableBeds = room.capacity - room.currentOccupancy;
  const occupancyPercentage = Math.round((room.currentOccupancy / room.capacity) * 100);

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between space-y-4 hover:-translate-y-0.5 shadow-card hover:shadow-card-hover ${
      isMaintenance
        ? 'border-[#ECC2BA]'
        : isFull
        ? 'border-[#E6DCCD]'
        : 'border-[#2F5D50]/40'
    }`}>
      
      {/* Top Bar: Room Number & Status Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center border text-xs font-bold font-mono ${
            isMaintenance
              ? 'bg-[#F6DFDA] text-[#9A3B2E] border-[#ECC2BA]'
              : isFull
              ? 'bg-[#FBEBC8] text-[#8A5A00] border-[#F6D792]'
              : 'bg-[#DDEFE5] text-[#1F6B4A] border-[#BFE0CE]'
          }`}>
            <Bed className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-display font-normal text-xl text-[#2B2622] tracking-tight leading-tight">
              Room <span className="font-mono text-lg font-bold">{room.roomNumber}</span>
            </h3>
            <p className="text-[11px] text-[#6B6258] font-sans">
              Block {room.block} · Floor {room.floor}
            </p>
          </div>
        </div>

        {/* Soft Tinted Status Badges */}
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans ${
          isMaintenance
            ? 'badge-booked'
            : isFull
            ? 'badge-booked'
            : 'badge-available'
        }`}>
          {isMaintenance ? 'MAINTENANCE' : isFull ? 'BOOKED / OCCUPIED' : `${availableBeds} BED(S) AVAILABLE`}
        </span>
      </div>

      {/* Capacity Progress Bar */}
      <div className="space-y-1.5 p-3 rounded-xl bg-[#FAF6EF] border border-[#E6DCCD]">
        <div className="flex items-center justify-between text-xs font-sans">
          <span className="text-[#6B6258] font-semibold">Bed Occupancy</span>
          <span className="font-mono font-bold text-[#2B2622] text-[11px]">
            {room.currentOccupancy} / {room.capacity} Beds ({occupancyPercentage}%)
          </span>
        </div>
        <div className="w-full bg-[#E6DCCD]/60 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isMaintenance ? 'bg-[#9A3B2E]' : isFull ? 'bg-[#8A5A00]' : 'bg-[#1F6B4A]'
            }`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
        <p className="text-[10px] text-[#6B6258] text-right font-mono pt-0.5">
          ₹{room.rentPerMonth?.toLocaleString('en-IN') || 0} / month
        </p>
      </div>

      {/* Amenities Micro Badges */}
      <div className="flex flex-wrap gap-1.5 text-[10px] font-sans">
        <span className="px-2 py-0.5 rounded bg-[#FAF6EF] text-[#2B2622] border border-[#E6DCCD] font-semibold capitalize">
          {room.type} Sharing
        </span>
        {room.amenities?.hasAC && (
          <span className="px-2 py-0.5 rounded bg-[#DDEFE5] text-[#1F6B4A] border border-[#BFE0CE] font-semibold">AC</span>
        )}
        {room.amenities?.hasAttachedBathroom && (
          <span className="px-2 py-0.5 rounded bg-[#FBEBC8] text-[#8A5A00] border border-[#F6D792] font-semibold">Attached Bath</span>
        )}
        {room.amenities?.hasBalcony && (
          <span className="px-2 py-0.5 rounded bg-[#FAF6EF] text-[#6B6258] border border-[#E6DCCD] font-semibold">Balcony</span>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-[#E6DCCD] flex items-center justify-between gap-2">
        <button
          onClick={() => onViewDetails(room)}
          className="btn-secondary text-[11px] py-2 px-3 flex-1 flex items-center justify-center gap-1 font-sans"
        >
          <Eye className="h-3.5 w-3.5" /> Details
        </button>

        {!isMaintenance && !isFull && (
          <button
            onClick={() => onAllocate(room)}
            className="btn-primary text-[11px] py-2 px-3 flex-1 flex items-center justify-center gap-1 font-sans"
          >
            <UserPlus className="h-3.5 w-3.5" /> Allocate
          </button>
        )}

        <button
          onClick={() => onToggleStatus(room)}
          className={`p-2 rounded-xl border text-xs transition-colors ${
            isMaintenance
              ? 'bg-[#DDEFE5] border-[#BFE0CE] text-[#1F6B4A] hover:bg-[#C2E2D2]'
              : 'bg-[#FAF6EF] border-[#E6DCCD] text-[#6B6258] hover:bg-[#F6DFDA] hover:text-[#9A3B2E] hover:border-[#ECC2BA]'
          }`}
          title={isMaintenance ? 'Mark Available' : 'Set to Maintenance'}
        >
          <Wrench className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
};

export default RoomCard;
