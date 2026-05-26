import React, { useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: number;
  placeholder?: string;
}

/**
 * TinyMCE-based rich text editor component.
 * Uses TinyMCE loaded from CDN (no API key needed for self-hosted/open-source usage).
 * Note: For production, install @tinymce/tinymce-react and host TinyMCE locally.
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  height = 500,
  placeholder = '请输入内容...',
}) => {
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Load TinyMCE script dynamically
  useEffect(() => {
    const loadTinyMCE = () => {
      if ((window as any).tinymce) {
        initEditor();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.tiny.cloud/1/no-api-key/tinymce/7/tinymce.min.js';
      script.referrerPolicy = 'origin';
      script.onload = () => {
        initEditor();
      };
      document.head.appendChild(script);
    };

    const initEditor = () => {
      if (!containerRef.current || isInitializedRef.current) return;
      isInitializedRef.current = true;

      const id = 'tinymce-editor-' + Math.random().toString(36).substring(7);
      containerRef.current.id = id;

      (window as any).tinymce.init({
        selector: `#${id}`,
        height,
        menubar: true,
        plugins: [
          'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
          'preview', 'anchor', 'searchreplace', 'visualblocks', 'code',
          'fullscreen', 'insertdatetime', 'media', 'table', 'wordcount',
        ],
        toolbar:
          'undo redo | blocks | bold italic underline strikethrough | ' +
          'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
          'bullist numlist outdent indent | link image table | removeformat code',
        placeholder,
        content_style: 'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; line-height: 1.6; }',
        branding: false,
        promotion: false,
        license_key: 'gpl',
        setup: (editor: any) => {
          editorRef.current = editor;

          editor.on('init', () => {
            if (value) {
              editor.setContent(value);
            }
          });

          editor.on('input change keyup setcontent', () => {
            const content = editor.getContent();
            onChange(content);
          });
        },
      });
    };

    loadTinyMCE();

    return () => {
      if (editorRef.current) {
        try {
          (window as any).tinymce.remove(editorRef.current);
        } catch {
          // Ignore cleanup errors
        }
        editorRef.current = null;
        isInitializedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes to the editor
  useEffect(() => {
    if (editorRef.current && isInitializedRef.current) {
      const currentContent = editorRef.current.getContent();
      if (value !== currentContent) {
        editorRef.current.setContent(value || '');
      }
    }
  }, [value]);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      <div ref={containerRef}>{value || ''}</div>
    </Box>
  );
};

export default RichTextEditor;
