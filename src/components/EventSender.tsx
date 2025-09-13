import React, { useState } from 'react';
import { SendIcon, AlertTriangleIcon, CheckIcon } from './icons';
import { JsonEditor } from './JsonEditor';

interface EventDetails {
    name: string;
    payload: string;
}

interface EventSenderProps {
    sendEvent: (eventName: string, data: string) => void;
    isConnected: boolean;
    eventDetails: EventDetails;
    setEventDetails: (details: EventDetails) => void;
}

export const EventSender: React.FC<EventSenderProps> = ({ sendEvent, isConnected, eventDetails, setEventDetails }) => {
    const [payloadError, setPayloadError] = useState<string | null>(null);
    const [justSent, setJustSent] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (eventDetails.name.trim()) {
            try {
                sendEvent(eventDetails.name.trim(), eventDetails.payload);
                setPayloadError(null);
                setJustSent(true);
                setTimeout(() => setJustSent(false), 200);
            } catch (err: any) {
                const errorMessage = `Invalid JSON: ${err.message.replace('JSON.parse: ', '')}`;
                setPayloadError(errorMessage);
                setTimeout(() => setPayloadError(null), 5000);
            }
        }
    };

    return (
        <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] p-4 rounded-lg shadow-lg flex flex-col">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-heading)]">Emit Event</h2>
            <form onSubmit={handleSend} className="flex flex-col space-y-4">
                <div>
                    <label htmlFor="event-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Event Name</label>
                    <input
                        id="event-name"
                        type="text"
                        value={eventDetails.name}
                        onChange={(e) => setEventDetails({ ...eventDetails, name: e.target.value })}
                        placeholder="e.g., 'message' or 'update-data'"
                        className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isConnected}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Payload</label>
                    <div className="w-full h-96 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                        <JsonEditor 
                           value={eventDetails.payload}
                           onChange={(newPayload) => setEventDetails({ ...eventDetails, payload: newPayload })}
                           disabled={!isConnected}
                        />
                    </div>
                </div>
               
                {payloadError && (
                    <div className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md flex items-center transition-opacity duration-300">
                        <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{payloadError}</span>
                    </div>
                )}

                <button
                    type="submit"
                    className={`w-full font-bold py-2 px-4 rounded-md transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        justSent
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    disabled={!isConnected || !eventDetails.name || justSent}
                >
                    {justSent ? (
                        <>
                            <CheckIcon className="w-5 h-5 mr-2" />
                            Sent!
                        </>
                    ) : (
                        <>
                            <SendIcon className="w-5 h-5 mr-2" />
                            Send
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
