"use client";

import { useEffect, useRef, useState } from "react";
import {
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Table,
  TableToolbar,
  Undo,
} from "ckeditor5";

const editorConfig = {
  licenseKey: "GPL",
  plugins: [
    Autoformat,
    BlockQuote,
    Bold,
    Essentials,
    Heading,
    Italic,
    Link,
    List,
    Paragraph,
    Table,
    TableToolbar,
    Undo,
  ],
  toolbar: [
    "undo",
    "redo",
    "|",
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "blockQuote",
    "|",
    "bulletedList",
    "numberedList",
    "|",
    "insertTable",
  ],
  table: {
    contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
  },
};

export default function RichTextEditor({ id, label, value, onChange }) {
  const hostRef = useRef(null);
  const editorRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const initialValueRef = useRef(value || "");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    async function createEditor() {
      if (!hostRef.current) {
        return;
      }

      const editor = await ClassicEditor.create(hostRef.current, editorConfig);

      if (!mounted) {
        await editor.destroy();
        return;
      }

      editorRef.current = editor;
      editor.setData(initialValueRef.current);
      editor.model.document.on("change:data", () => {
        onChangeRef.current?.(editor.getData());
      });
      setIsReady(true);
    }

    createEditor().catch((error) => {
      console.error("Failed to initialize CKEditor:", error);
    });

    return () => {
      mounted = false;
      setIsReady(false);

      if (editorRef.current) {
        const editor = editorRef.current;
        editorRef.current = null;
        editor.destroy().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    const currentData = editorRef.current.getData();
    if (currentData !== (value || "")) {
      editorRef.current.setData(value || "");
    }
  }, [value]);

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="mb-2 block text-sm font-medium text-[#d7dfec]">
          {label}
        </label>
      ) : null}
      <div className="admin-editor overflow-hidden rounded-2xl border border-[#2c3852] bg-[#0e1728]">
        {!isReady ? (
          <div className="border-b border-[#23304a] px-4 py-3 text-sm text-[#8b98a5]">
            Loading editor...
          </div>
        ) : null}
        <div id={id} ref={hostRef} />
      </div>
    </div>
  );
}
