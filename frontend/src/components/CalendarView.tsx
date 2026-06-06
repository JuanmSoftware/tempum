import { useState } from "react";
import { Calendar, momentLocalizer, type View } from "react-big-calendar";
import moment from "moment";
// @ts-ignore
import 'moment/locale/es';
import "react-big-calendar/lib/css/react-big-calendar.css";

// Inicializamos moment en español
moment.locale('es');
const localizer = momentLocalizer(moment);

interface Evento {
    id?: number;
    title: string;
    start: Date;
    end: Date;
    estado?: string;
}

interface Props {
    events: Evento[];
    onSelectEvent: (event: any) => void;
}

function CalendarView({ events, onSelectEvent }: Props) {
    // Definimos el estado para la fecha y vista actuales
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [currentView, setCurrentView] = useState<View>("month");

    return (
        <div className="h-[520px] w-full text-slate-700">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                onSelectEvent={onSelectEvent}
                views={['month', 'week', 'day']}
                
                // Conectamos el estado controlado del calendario
                date={currentDate}
                onNavigate={(newDate) => setCurrentDate(newDate)}
                view={currentView}
                onView={(newView) => setCurrentView(newView)}

                messages={{
                    next: "Sig.",
                    previous: "Ant.",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    showMore: (total: number) => `+ Ver ${total} más`
                }}
                eventPropGetter={(event: any) => {
                    // Configuración por defecto (Azul suave)
                    let backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    let borderLeft = '4px solid #2563eb';
                    let color = '#93c5fd'; // Brighter text for dark theme

                    if (event.estado === 'PENDIENTE') {
                        backgroundColor = 'rgba(245, 158, 11, 0.15)'; // Amber 500 c/ opacidad
                        borderLeft = '4px solid #d97706'; // Amber 600
                        color = '#fbbf24'; // Amber 400 (bright text)
                    }
                    if (event.estado === 'CONFIRMADA') {
                        backgroundColor = 'rgba(16, 185, 129, 0.15)'; // Emerald 500 c/ opacidad
                        borderLeft = '4px solid #059669'; // Emerald 600
                        color = '#34d399'; // Emerald 400 (bright text)
                    }
                    if (event.estado === 'CANCELADA') {
                        backgroundColor = 'rgba(239, 68, 68, 0.15)'; // Red 500 c/ opacidad
                        borderLeft = '4px solid #dc2626'; // Red 600
                        color = '#f87171'; // Red 400 (bright text)
                    }

                    return {
                        style: {
                            backgroundColor,
                            borderLeft,
                            color,
                            borderTop: 'none',
                            borderRight: 'none',
                            borderBottom: 'none',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            display: 'block'
                        }
                    };
                }}
                components={{
                    event: ({ event }: any) => (
                        <div className="flex flex-col h-full justify-center">
                            <span className="font-bold truncate text-[11px] sm:text-xs">
                                {event.title}
                            </span>
                        </div>
                    )
                }}
            />
        </div>
    );
}

export default CalendarView;