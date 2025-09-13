
import React, { useState } from 'react';
import { PlusIcon, XIcon } from './icons';

interface EventListenersProps {
    listeners: string[];
    addEventListener: (eventName: string) => void;
    removeEventListener: (eventName: string) => void;
}

export const EventListeners: React.FC<EventListenersProps> = ({ listeners, addEventListener, removeEventListener }) => {
    const [newEvent, setNewEvent] = useState<string>('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newEvent.trim()) {
            addEventListener(newEvent.trim());
            setNewEvent('');
        }
    };

    return (
        <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-[var(--color-text-heading)]">Event Listeners</h2>
            <form onSubmit={handleAdd} className="flex items-center space-x-2 mb-4">
                <input
                    type="text"
                    value={newEvent}
                    onChange={(e) => setNewEvent(e.target.value)}
                    placeholder="Event name to listen for"
                    className="flex-grow bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded-md transition duration-200 flex items-center"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {listeners.length > 0 ? (
                    listeners.map((listener) => (
                        <div key={listener} className="flex justify-between items-center bg-[var(--color-bg-input)] p-2 rounded-md text-sm">
                            <span className="font-mono text-cyan-400">{listener}</span>
                            <button
                                onClick={() => removeEventListener(listener)}
                                className="text-[var(--color-text-secondary)] hover:text-red-400 transition duration-200"
                            >
                                <XIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-[var(--color-text-secondary)] text-center text-sm py-4">No active listeners.</p>
                )}
            </div>
        </div>
    );
};