import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Message, MessagesByEvent } from '../types';
import { TrashIcon } from './icons';
import LogMessage from './LogMessage';

interface MessageLogsProps {
    messages: MessagesByEvent;
    listeners: string[];
    clearMessages: (eventName: string) => void;
}

const LogPanel: React.FC<{
    messages: Message[];
    eventName: string;
    clearMessages: (eventName: string) => void;
    autoScroll: boolean;
    setAutoScroll: (v: boolean) => void;
}> = ({ messages, eventName, clearMessages, autoScroll, setAutoScroll }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [messages, autoScroll]);
    
    return (
        <div className="flex flex-col bg-[var(--color-bg-panel)] rounded-b-lg">
            <div className="flex justify-between items-center p-2 border-b border-[var(--color-border)]">
                <h3 className="text-sm font-bold text-[var(--color-text-secondary)]">Log for <span className="font-mono text-cyan-400">{eventName}</span></h3>
                <div className="flex items-center space-x-4">
                    <label className="flex items-center text-xs text-[var(--color-text-secondary)] cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoScroll}
                            onChange={(e) => setAutoScroll(e.target.checked)}
                            className="mr-2 h-4 w-4 rounded border-[var(--color-border)] bg-[var(--color-bg-input)] text-blue-500 focus:ring-blue-500 accent-blue-500"
                        />
                        Auto-scroll
                    </label>
                    <button
                        onClick={() => clearMessages(eventName)}
                        className="text-[var(--color-text-secondary)] hover:text-red-400 transition-colors"
                        title={`Clear ${eventName} log`}
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div ref={scrollRef} className="overflow-y-auto p-4 space-y-3 max-h-[48rem]">
                {messages.length === 0 ? (
                    <div className="text-center text-[var(--color-text-secondary)] pt-8">No messages yet.</div>
                ) : (
                    messages.map((msg) => (
                       <LogMessage key={msg.id} message={msg} />
                    ))
                )}
            </div>
        </div>
    );
};


export const MessageLogs: React.FC<MessageLogsProps> = ({ messages, listeners, clearMessages }) => {
    const tabs = useMemo(() => ['general', 'sent', ...listeners], [listeners]);
    const [activeTab, setActiveTab] = useState('general');
    const [autoScroll, setAutoScroll] = useState(true);

    useEffect(() => {
        if (!tabs.includes(activeTab)) {
            setActiveTab('general');
        }
    }, [tabs, activeTab]);

    return (
        <div className="border border-[var(--color-border)] bg-[var(--color-bg-panel)] rounded-lg shadow-lg flex flex-col">
            <div className="flex border-b border-[var(--color-border)] overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                            activeTab === tab
                                ? 'border-b-2 border-blue-500 text-[var(--color-text-primary)] bg-[var(--color-bg-panel)]'
                                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]/50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div>
                 <LogPanel 
                    messages={messages[activeTab] || []}
                    eventName={activeTab}
                    clearMessages={clearMessages}
                    autoScroll={autoScroll}
                    setAutoScroll={setAutoScroll}
                />
            </div>
        </div>
    );
};