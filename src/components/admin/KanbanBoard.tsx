'use client';

import React, { useMemo, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, Send, User, ChevronRight, Activity } from 'lucide-react';

const COLUMNS = [
  { id: 'Новий', title: 'Нові' },
  { id: 'В роботі', title: 'В роботі' },
  { id: 'Думає', title: 'Думає' },
  { id: 'Ждемо оплату', title: 'Ждемо оплату' },
  { id: 'Оплачено', title: 'Оплачено' },
  { id: 'Відмова', title: 'Відмова' }
];

function SortableLeadCard({ lead, onClick }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead._selectionId });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      onClick={(e) => {
          // If they clicked to drag, don't open modal, but if they just clicked, open it.
          // simple hack: check if e.detail === 1 or handle inside onClick
          onClick(lead);
      }}
      className="bg-[#111111] p-4 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-[#C4A47C]/50 transition-colors flex flex-col gap-3 group"
    >
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#222] to-[#111] border border-white/10 flex items-center justify-center text-white/80 font-bold text-xs">
          {(lead.name || lead["Ім'я"])?.[0] || <User size={12} className="text-white/40" />}
        </div>
        <div>
          <p className="font-bold text-xs text-white/90 truncate max-w-[140px]">{lead.name || lead["Ім'я"] || 'Anonymous'}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {lead._tags?.slice(0, 1).map((tag: string) => (
                <span key={tag} className="text-[6px] px-1 py-0.5 rounded-sm bg-white/5 border border-white/5 text-white/40 uppercase font-black">{tag}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-[10px]">
        {lead.phone && <div className="flex items-center gap-1.5 text-white/60"><Phone size={10} /> <span>{lead.phone}</span></div>}
        {lead.telegram && <div className="flex items-center gap-1.5 text-[#C4A47C]/80"><Send size={10} /> <span className="truncate">{lead.telegram}</span></div>}
      </div>
      {(lead.comment || lead["Коментар"]) && (
          <div className="h-4 w-4 absolute bottom-3 right-3 rounded-full bg-[#C4A47C]/10 flex items-center justify-center text-[#C4A47C]">
              <Activity size={8} />
          </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ leads, updateLeadStatus, onLeadClick, globalUsers }: any) {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Mapping uuid to sales_status
  const statusMap = useMemo(() => {
    const map = new Map<string, string>();
    globalUsers.forEach((u: any) => {
        if(u.UUID && u.Sales_Status) map.set(u.UUID, u.Sales_Status);
    });
    return map;
  }, [globalUsers]);

  // Distribute leads
  const columnsData = useMemo(() => {
    const cols: Record<string, any[]> = {};
    COLUMNS.forEach(c => cols[c.id] = []);
    
    leads.forEach((l: any) => {
       const uuid = l.UUID || l._selectionId;
       let status = statusMap.get(uuid) || 'Новий';
       
       // Sync with actual financial status automatically if needed
       if (l._computedStatus === 'Оплачено') status = 'Оплачено';
       if (l._computedStatus === 'Відхилено') status = 'Відмова';
       if (l._computedStatus === 'Заброньовано' && status === 'Новий') status = 'Ждемо оплату';

       if (!cols[status]) cols['Новий'].push(l); // fallback
       else cols[status].push(l);
    });

    // sort inside column by date
    Object.keys(cols).forEach(k => {
       cols[k] = cols[k].sort((a: any, b: any) => b._latestAction - a._latestAction);
    });

    return cols;
  }, [leads, statusMap]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeLeadId = active.id as string;
    const overId = over.id as string;

    // Find what column overId belongs to
    let destColId = COLUMNS.find(c => c.id === overId)?.id;
    if (!destColId) {
       // if over a card, find which column that card is in
       for (const col of COLUMNS) {
          if (columnsData[col.id].find(l => l._selectionId === overId)) {
             destColId = col.id;
             break;
          }
       }
    }

    if (destColId) {
       // Find the lead
       const lead = leads.find((l:any) => l._selectionId === activeLeadId);
       if (lead) {
           const uuid = lead.UUID || lead._selectionId;
           const currentStatus = statusMap.get(uuid) || 'Новий';
           if (currentStatus !== destColId) {
               updateLeadStatus(uuid, destColId);
           }
       }
    }
  };

  const activeLead = activeId ? leads.find((l:any) => l._selectionId === activeId) : null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 h-[calc(100vh-250px)] items-start">
        {COLUMNS.map(col => (
          <div key={col.id} className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 min-w-[280px] w-[280px] flex flex-col max-h-full">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white/70">{col.title}</h3>
              <span className="text-[10px] font-black text-white/30 bg-white/5 px-2 py-0.5 rounded">{columnsData[col.id].length}</span>
            </div>
            
            <SortableContext id={col.id} items={columnsData[col.id].map(l => l._selectionId)} strategy={verticalListSortingStrategy}>
              <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-2 pr-1 custom-scrollbar">
                {columnsData[col.id].map(lead => (
                  <SortableLeadCard key={lead._selectionId} lead={lead} onClick={() => onLeadClick(lead._selectionId)} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="bg-[#111111] p-4 rounded-xl border border-[#C4A47C] shadow-2xl opacity-90 scale-105 rotate-2 w-[250px]">
             <div className="flex items-center gap-3">
               <div className="h-8 w-8 rounded-full bg-[#222] border border-white/10 flex items-center justify-center font-bold text-xs">
                 {(activeLead.name || activeLead["Ім'я"])?.[0] || 'U'}
               </div>
               <p className="font-bold text-xs text-white/90 truncate">{activeLead.name || activeLead["Ім'я"] || 'Anonymous'}</p>
             </div>
          </div>
        ) : null}
      </DragOverlay>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}} />
    </DndContext>
  );
}
