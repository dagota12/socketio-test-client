import React from 'react';
import { useSocketManager } from './hooks/useSocket';
import { ConnectionManager } from './components/ConnectionManager';
import { EventListeners } from './components/EventListeners';
import { EventSender } from './components/EventSender';
import { MessageLogs } from './components/MessageLogs';
import { ThemeSwitcher } from './components/ThemeSwitcher';

const App: React.FC = () => {
  const {
    profiles,
    activeProfile,
    setActiveProfileId,
    updateProfile,
    addConnection,
    removeConnection,
    isConnected,
    isConnecting,
    socketId,
    error,
    connect,
    disconnect,
    addEventListener,
    removeEventListener,
    sendEvent,
    clearMessages,
  } = useSocketManager();

  if (!activeProfile) {
    // This can happen briefly on initial load or if all profiles are deleted.
    return (
        <div className="min-h-screen flex items-center justify-center">
            <p>Loading connection profiles...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="mb-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
            <div className="w-10"></div> {/* Spacer */}
            <div className="flex-grow text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                  Socket.io Test Client
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-2">
                  A simple tool to connect, listen, and emit Socket.io events.
                </p>
            </div>
            <ThemeSwitcher />
        </div>
      </header>
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-3 space-y-6">
           <ConnectionManager
            profiles={profiles}
            activeProfile={activeProfile}
            setActiveProfileId={setActiveProfileId}
            updateProfile={updateProfile}
            addConnection={addConnection}
            removeConnection={removeConnection}
            isConnected={isConnected}
            isConnecting={isConnecting}
            socketId={socketId}
            error={error}
            connect={connect}
            disconnect={disconnect}
          />
        </div>
       
        <div className="lg:col-span-1 flex flex-col gap-6" key={activeProfile.id}>
            <EventListeners
                listeners={activeProfile.listeners}
                addEventListener={addEventListener}
                removeEventListener={removeEventListener}
            />
            <EventSender 
                eventDetails={{ name: activeProfile.draftEventName, payload: activeProfile.draftEventPayload }}
                setEventDetails={(details) => updateProfile({ draftEventName: details.name, draftEventPayload: details.payload })}
                sendEvent={sendEvent} 
                isConnected={isConnected} 
            />
        </div>

        <div className="lg:col-span-2">
            <MessageLogs 
                messages={activeProfile.messages} 
                listeners={activeProfile.listeners} 
                clearMessages={clearMessages} 
             />
        </div>
      </main>
      <footer className="text-center text-gray-600 mt-8 text-sm">
        <p>Built for efficient backend testing.</p>
      </footer>
    </div>
  );
};

export default App;