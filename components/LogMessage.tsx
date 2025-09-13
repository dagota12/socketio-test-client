import React, { useEffect, useRef, useState, memo, useMemo } from 'react';
import type { Message } from '../types';
import { ClipboardIcon, CheckIcon } from './icons';

// Let TypeScript know that 'JSONEditor' is available on the window object
declare const JSONEditor: any;

interface LogMessageProps {
    message: Message;
}

const LogMessage: React.FC<LogMessageProps> = ({ message }) => {
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const isComplex = useMemo(() => typeof message.data === 'object' && message.data !== null, [message.data]);

    const dataString = useMemo(() => {
        if (isComplex) {
            try {
                return JSON.stringify(message.data, null, 2);
            } catch {
                return String(message.data);
            }
        }
        return String(message.data);
    }, [message.data, isComplex]);

    useEffect(() => {
        if (isComplex && editorContainerRef.current && !editorRef.current) {
            const options = {
                mode: 'view' as const,
                mainMenuBar: false,
                navigationBar: false,
                statusBar: false,
                search: false,
            };
            editorRef.current = new JSONEditor(editorContainerRef.current, options);
            editorRef.current.setText(dataString);
        }
    
        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [isComplex, dataString]);
    
    // Update editor when theme changes
    useEffect(() => {
        if (!isComplex || !editorRef.current) return;

        const observer = new MutationObserver(() => {
            // This is a hack to force the Ace editor to re-evaluate its theme styles
            if (editorRef.current?.aceEditor?.renderer) {
                editorRef.current.aceEditor.renderer.updateFull();
            }
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, [isComplex]);

    const handleCopy = () => {
        navigator.clipboard.writeText(dataString).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    const simpleMessageStyle = "text-sm whitespace-pre-wrap font-mono text-[var(--color-text-primary)] bg-[var(--color-bg-panel)] p-3 rounded-md max-h-32 overflow-y-auto";

    return (
        <div className="bg-[var(--color-bg-primary)] p-3 rounded-lg relative group">
            <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[var(--color-text-secondary)]">{message.timestamp}</span>
                <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-1 rounded bg-[var(--color-bg-panel)] text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    title="Copy to clipboard"
                >
                    {isCopied ? (
                        <CheckIcon className="w-4 h-4 text-green-500" />
                    ) : (
                        <ClipboardIcon className="w-4 h-4" />
                    )}
                </button>
            </div>
            {isComplex ? (
                 <div ref={editorContainerRef} className="log-message-editor w-full"></div>
            ) : (
                 <pre className={simpleMessageStyle}><code>{dataString}</code></pre>
            )}
        </div>
    );
};

export default memo(LogMessage);