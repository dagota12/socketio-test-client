import React, { useEffect, useRef } from 'react';

// Let TypeScript know that 'JSONEditor' is available on the window object
declare const JSONEditor: any;

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({ value, onChange, disabled = false }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<any | null>(null);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    useEffect(() => {
        if (containerRef.current && !editorRef.current) {
            const options = {
                mode: 'code' as const,
                modes: ['code', 'tree', 'view'] as const,
                onChangeText: (jsonString: string) => {
                    onChangeRef.current(jsonString);
                },
                mainMenuBar: false,
                navigationBar: false,
                statusBar: false,
                search: false, 
            };
            
            editorRef.current = new JSONEditor(containerRef.current, options);
            try {
                // Format the initial value if it's valid JSON
                const formatted = JSON.stringify(JSON.parse(value), null, 2);
                editorRef.current.setText(formatted);
            } catch {
                editorRef.current.setText(value);
            }
        }

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (editorRef.current) {
            // This is the core logic for a controlled component. If the prop `value`
            // is different from what's currently in the editor, update the editor.
            // This prevents an infinite loop of updates and preserves the cursor position
            // and undo history during user input.
            if (editorRef.current.getText() !== value) {
                editorRef.current.setText(value);
            }
        }
    }, [value]);

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.setMode(disabled ? 'view' : 'code');
        }
    }, [disabled]);

    return <div ref={containerRef} className="w-full h-full" />;
};