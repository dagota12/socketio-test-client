import { useState, useEffect, useRef, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { Message, MessagesByEvent, ConnectionProfile } from '../types';
import useLocalStorage from './useLocalStorage';

// Let TypeScript know that 'io' is available on the window object
declare const io: any;

const GENERAL_EVENT = 'general';
const SENT_EVENT = 'sent';

const generateId = () => `conn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const createDefaultProfile = (): ConnectionProfile => ({
    id: generateId(),
    name: 'Local Dev',
    url: 'ws://localhost:3000',
    token: '',
    listeners: [],
    messages: { [GENERAL_EVENT]: [], [SENT_EVENT]: [] },
    draftEventName: 'message',
    draftEventPayload: '{}'
});

interface ConnectionState {
    isConnected: boolean;
    isConnecting: boolean;
    socketId: string | null;
    error: string | null;
}

export const useSocketManager = () => {
    const [profiles, setProfiles] = useLocalStorage<ConnectionProfile[]>('socketio-test-client:profiles', []);
    const [activeProfileId, setActiveProfileId] = useLocalStorage<string | null>('socketio-test-client:activeProfileId', null);

    const [liveStates, setLiveStates] = useState<Map<string, ConnectionState>>(new Map());
    const socketInstances = useRef<Map<string, Socket>>(new Map());
    const handlersRef = useRef<Map<string, Map<string, (data: any) => void>>>(new Map()); // Map<profileId, Map<eventName, handler>>

    // Ensure there is at least one profile on first load
    useEffect(() => {
        if (profiles.length === 0) {
            const defaultProfile = createDefaultProfile();
            setProfiles([defaultProfile]);
            setActiveProfileId(defaultProfile.id);
        } else if (!activeProfileId || !profiles.some(p => p.id === activeProfileId)) {
            setActiveProfileId(profiles[0]?.id || null);
        }
    }, []); // Run only once

    const activeProfile = profiles.find(p => p.id === activeProfileId);
    const activeLiveState = liveStates.get(activeProfileId || '') || { isConnected: false, isConnecting: false, socketId: null, error: null };

    const updateProfile = useCallback((profileId: string, updates: Partial<ConnectionProfile>) => {
        setProfiles(prevProfiles =>
            prevProfiles.map(p => (p.id === profileId ? { ...p, ...updates } : p))
        );
    }, [setProfiles]);

    const addMessage = useCallback((profileId: string, event: string, data: any) => {
        const newMessage: Message = {
            id: `${event}-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toLocaleTimeString(),
            data,
        };
        updateProfile(profileId, {
            messages: {
                ...(profiles.find(p => p.id === profileId)?.messages || {}),
                [event]: [newMessage, ...(profiles.find(p => p.id === profileId)?.messages[event] || [])],
            },
        });
    }, [profiles, updateProfile]);

    const setLiveState = useCallback((profileId: string, state: Partial<ConnectionState>) => {
        setLiveStates(prev => new Map(prev).set(profileId, { ...(prev.get(profileId) || {} as ConnectionState), ...state }));
    }, []);

    const connect = useCallback(() => {
        if (!activeProfile || socketInstances.current.has(activeProfile.id) || activeLiveState.isConnecting) return;
        
        try {
            setLiveState(activeProfile.id, { error: null, isConnecting: true });
            
            const socketOptions: any = {
                reconnectionAttempts: 5,
                transports: ['websocket', 'polling'],
            };

            if (activeProfile.token && activeProfile.token.trim()) {
                socketOptions.auth = { token: activeProfile.token.trim() };
            }

            const newSocket = io(activeProfile.url, socketOptions);
            socketInstances.current.set(activeProfile.id, newSocket);

            newSocket.on('connect', () => {
                setLiveState(activeProfile.id, { isConnected: true, isConnecting: false, socketId: newSocket.id });
                addMessage(activeProfile.id, GENERAL_EVENT, `Connected with ID: ${newSocket.id}`);

                // Re-register all existing listeners for this profile
                handlersRef.current.get(activeProfile.id)?.forEach((handler, eventName) => {
                    newSocket.off(eventName).on(eventName, handler);
                });
            });

            newSocket.on('disconnect', (reason: string) => {
                setLiveState(activeProfile.id, { isConnected: false, isConnecting: false, socketId: null });
                addMessage(activeProfile.id, GENERAL_EVENT, `Disconnected: ${reason}`);
            });

            newSocket.on('connect_error', (err: Error) => {
                setLiveState(activeProfile.id, { error: `Connection Error: ${err.message}`, isConnecting: false });
                addMessage(activeProfile.id, GENERAL_EVENT, `Connection Error: ${err.message}`);
                newSocket.disconnect();
                socketInstances.current.delete(activeProfile.id!);
            });

        } catch (err: any) {
            setLiveState(activeProfile.id, { error: `Failed to connect: ${err.message}`, isConnecting: false });
        }
    }, [activeProfile, activeLiveState.isConnecting, setLiveState, addMessage]);

    const disconnect = useCallback(() => {
        if (activeProfileId && socketInstances.current.has(activeProfileId)) {
            socketInstances.current.get(activeProfileId)?.disconnect();
            socketInstances.current.delete(activeProfileId);
            setLiveState(activeProfileId, { isConnected: false, socketId: null, error: null, isConnecting: false });
        }
    }, [activeProfileId, setLiveState]);

    const addEventListener = useCallback((eventName: string) => {
        if (!activeProfile || !eventName || activeProfile.listeners.includes(eventName)) return;

        const handler = (data: any) => addMessage(activeProfile.id, eventName, data);
        
        if (!handlersRef.current.has(activeProfile.id)) {
            handlersRef.current.set(activeProfile.id, new Map());
        }
        handlersRef.current.get(activeProfile.id)!.set(eventName, handler);

        socketInstances.current.get(activeProfile.id)?.on(eventName, handler);
        
        updateProfile(activeProfile.id, { 
            listeners: [...activeProfile.listeners, eventName],
            messages: {
                ...activeProfile.messages,
                [eventName]: activeProfile.messages[eventName] || []
            }
        });
    }, [activeProfile, addMessage, updateProfile]);

    const removeEventListener = useCallback((eventName: string) => {
        if (!activeProfile) return;

        const handler = handlersRef.current.get(activeProfile.id)?.get(eventName);
        if (handler) {
            socketInstances.current.get(activeProfile.id)?.off(eventName, handler);
            handlersRef.current.get(activeProfile.id)!.delete(eventName);
        }
        updateProfile(activeProfile.id, { listeners: activeProfile.listeners.filter(l => l !== eventName) });
    }, [activeProfile, updateProfile]);

    const sendEvent = useCallback((eventName: string, data: string) => {
        if (activeProfile && socketInstances.current.has(activeProfile.id) && activeLiveState.isConnected) {
            const payload = JSON.parse(data);
            socketInstances.current.get(activeProfile.id)?.emit(eventName, payload);
            addMessage(activeProfile.id, SENT_EVENT, { event: eventName, payload });
        }
    }, [activeProfile, activeLiveState.isConnected, addMessage]);

    const clearMessages = useCallback((eventName: string) => {
        if (activeProfile) {
             updateProfile(activeProfile.id, {
                messages: { ...activeProfile.messages, [eventName]: [] }
            });
        }
    }, [activeProfile, updateProfile]);

    const addConnection = () => {
        const newProfile = createDefaultProfile();
        setProfiles(prev => [...prev, newProfile]);
        setActiveProfileId(newProfile.id);
    };

    const removeConnection = (profileId: string) => {
        // Disconnect if active
        if (socketInstances.current.has(profileId)) {
            socketInstances.current.get(profileId)?.disconnect();
            socketInstances.current.delete(profileId);
        }
        // Clean up state
        setLiveStates(prev => {
            const next = new Map(prev);
            next.delete(profileId);
            return next;
        });
        handlersRef.current.delete(profileId);

        // Remove from profiles and set new active one
        setProfiles(prev => {
            const remaining = prev.filter(p => p.id !== profileId);
            if (activeProfileId === profileId) {
                setActiveProfileId(remaining[0]?.id || null);
            }
            return remaining.length > 0 ? remaining : [createDefaultProfile()];
        });
    };
    
    // Wire up handlers for all listeners of all profiles on initial mount
    useEffect(() => {
        profiles.forEach(profile => {
            const profileHandlers = new Map<string, (data: any) => void>();
            profile.listeners.forEach(eventName => {
                profileHandlers.set(eventName, (data: any) => addMessage(profile.id, eventName, data));
            });
            handlersRef.current.set(profile.id, profileHandlers);
        });
    }, []); // Run only once

    useEffect(() => {
        return () => {
            socketInstances.current.forEach(socket => socket.disconnect());
        };
    }, []);

    return {
        profiles,
        activeProfile,
        setActiveProfileId,
        updateProfile: (updates: Partial<ConnectionProfile>) => activeProfile && updateProfile(activeProfile.id, updates),
        addConnection,
        removeConnection: () => activeProfile && removeConnection(activeProfile.id),
        isConnected: activeLiveState.isConnected,
        isConnecting: activeLiveState.isConnecting,
        socketId: activeLiveState.socketId,
        error: activeLiveState.error,
        connect,
        disconnect,
        addEventListener,
        removeEventListener,
        sendEvent,
        clearMessages,
    };
};
