import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, Palette } from 'lucide-react';

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  showApplyOptions?: boolean;
  onApplyToSection?: () => void;
  onApplyGlobally?: () => void;
};

export function RichTextEditor({
  content,
  onChange,
  label,
  placeholder = 'Enter text...',
  showApplyOptions = false,
  onApplyToSection,
  onApplyGlobally,
}: RichTextEditorProps) {
  const [showColorPicker, setShowColorPicker] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState('#000000');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] p-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const applyColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setSelectedColor(color);
    setShowColorPicker(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {showApplyOptions && (
            <div className="flex gap-1">
              {onApplyToSection && (
                <button
                  onClick={onApplyToSection}
                  className="text-xs px-2 py-1 text-blue-600 hover:bg-blue-50 rounded"
                >
                  Apply to Section
                </button>
              )}
              {onApplyGlobally && (
                <button
                  onClick={onApplyGlobally}
                  className="text-xs px-2 py-1 text-purple-600 hover:bg-purple-50 rounded"
                >
                  Apply Globally
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-300 rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 transition-colors ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200 transition-colors"
            title="Text Color"
          >
            <Palette className="w-4 h-4" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {[
                  '#000000',
                  '#6B7280',
                  '#EF4444',
                  '#F59E0B',
                  '#10B981',
                  '#3B82F6',
                  '#8B5CF6',
                  '#EC4899',
                  '#FFFFFF',
                  '#F3F4F6',
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => applyColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-300"
              />
            </div>
          )}
        </div>

        <div className="ml-auto text-xs text-gray-500">
          Select text to format
        </div>
      </div>

      {/* Editor */}
      <div className="border border-t-0 border-gray-300 rounded-b-lg bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// Helper to convert HTML to plain text
export function stripHtml(html: string): string {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
