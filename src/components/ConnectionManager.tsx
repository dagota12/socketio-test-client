import React from 'react';
import { PlugIcon, LoadingSpinnerIcon, AlertTriangleIcon, PlusIcon, TrashIcon } from './icons';
import type { ConnectionProfile } from '../types';

interface ConnectionManagerProps {
    profiles: ConnectionProfile[];
    activeProfile: ConnectionProfile;
    setActiveProfileId: (id: string) => void;
    updateProfile: (updates: Partial<ConnectionProfile>) => void;
    addConnection: () => void;
    removeConnection: () => void;
    isConnected: boolean;
    isConnecting: boolean;
    socketId: string | null;
    error: string | null;
    connect: () => void;
    disconnect: () => void;
}

export const ConnectionManager: React.FC<ConnectionManagerProps> = ({ 
    profiles, activeProfile, setActiveProfileId, updateProfile, addConnection, removeConnection,
    isConnected, isConnecting, socketId, error, connect, disconnect 
}) => {

    const handleConnect = () => {
        if (activeProfile.url) {
            connect();
        }
    };

    const statusColor = isConnected ? 'text-green-400' : 'text-red-400';
    const statusText = isConnecting ? 'Connecting...' : (isConnected ? 'Connected' : 'Disconnected');

    return (
        <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] p-4 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[var(--color-text-heading)] flex items-center">
                    <PlugIcon className="w-6 h-6 mr-2" />
                    Connection
                </h2>
                <div className="flex items-center space-x-2">
                    <button onClick={addConnection} className="p-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors" title="Add new connection profile">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                    <button onClick={removeConnection} disabled={profiles.length <= 1} className="p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Remove current connection profile">
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="conn-profile" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Active Profile</label>
                        <select
                            id="conn-profile"
                            value={activeProfile.id}
                            onChange={(e) => setActiveProfileId(e.target.value)}
                            className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="conn-name" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">Profile Name</label>
                         <input
                            id="conn-name"
                            type="text"
                            value={activeProfile.name}
                            onChange={(e) => updateProfile({ name: e.target.value })}
                            placeholder="e.g., Local Dev"
                            className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isConnected || isConnecting}
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={activeProfile.url}
                        onChange={(e) => updateProfile({ url: e.target.value })}
                        placeholder="e.g., ws://localhost:3000"
                        className="flex-grow bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isConnected || isConnecting}
                        aria-label="Socket URL"
                    />
                    {!isConnected ? (
                        <button
                            onClick={handleConnect}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 flex items-center justify-center w-36 disabled:opacity-50"
                            disabled={!activeProfile.url || isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <LoadingSpinnerIcon className="w-5 h-5 mr-2"/>
                                    Connecting...
                                </>
                            ) : (
                                'Connect'
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={disconnect}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 w-36"
                        >
                            Disconnect
                        </button>
                    )}
                </div>
                <input
                    type="text"
                    value={activeProfile.token}
                    onChange={(e) => updateProfile({ token: e.target.value })}
                    placeholder="Auth Token (optional)"
                    className="w-full bg-[var(--color-bg-input)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50"
                    disabled={isConnected || isConnecting}
                    aria-label="Authentication Token"
                />
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                        <span className="font-semibold mr-2 text-[var(--color-text-secondary)]">Status:</span>
                        <span className={`font-bold ${statusColor}`}>{statusText}</span>
                        <div className={`w-3 h-3 rounded-full ml-2 ${isConnecting ? 'bg-yellow-500 animate-pulse' : (isConnected ? 'bg-green-500' : 'bg-red-500')}`}></div>
                    </div>
                    {socketId && <span className="text-[var(--color-text-secondary)]">ID: {socketId}</span>}
                </div>
                {error && (
                    <div className="text-red-400 text-sm bg-red-900/50 p-3 rounded-md flex items-center">
                        <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
