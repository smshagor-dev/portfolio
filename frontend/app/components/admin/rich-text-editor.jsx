"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bookmark,
  Bold,
  Code,
  CodeBlock,
  ClassicEditor,
  Essentials,
  FileRepository,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  HtmlEmbed,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  ShowBlocks,
  SourceEditing,
  Strikethrough,
  Style,
  Subscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TodoList,
  Undo,
  Underline,
  WordCount,
} from "ckeditor5";
import { buildPublicApiUrl } from "@/lib/public-backend-url";

class AdminUploadAdapter {
  constructor(loader, uploadToken) {
    this.loader = loader;
    this.uploadToken = uploadToken;
    this.controller = new AbortController();
  }

  async upload() {
    const file = await this.loader.file;
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(buildPublicApiUrl("/api/admin/upload-image"), {
      method: "POST",
      headers: this.uploadToken
        ? {
            Authorization: `Bearer ${this.uploadToken}`,
          }
        : {},
      body: formData,
      signal: this.controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.path) {
      throw new Error(data.message || `Couldn't upload file: ${file.name}.`);
    }

    return {
      default: data.path,
    };
  }

  abort() {
    this.controller.abort();
  }
}

function createAdminUploadAdapterPlugin(uploadToken) {
  return function AdminUploadAdapterPlugin(editor) {
    editor.plugins.get(FileRepository).createUploadAdapter = (loader) =>
      new AdminUploadAdapter(loader, uploadToken);
  };
}

function buildEditorConfig(uploadToken) {
  const resolvedUploadToken =
    uploadToken ||
    (typeof window !== "undefined" ? localStorage.getItem("portfolio_admin_token") || "" : "");

  return {
    licenseKey: "GPL",
    plugins: [
      Alignment,
      Autoformat,
      BlockQuote,
      Bold,
      Bookmark,
      Code,
      CodeBlock,
      Essentials,
      FindAndReplace,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      HtmlEmbed,
      Image,
      ImageCaption,
      ImageInsert,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      List,
      ListProperties,
      MediaEmbed,
      Paragraph,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      ShowBlocks,
      SourceEditing,
      Strikethrough,
      Style,
      Subscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextPartLanguage,
      TodoList,
      Underline,
      Undo,
      WordCount,
    ],
    extraPlugins: [createAdminUploadAdapterPlugin(resolvedUploadToken)],
    toolbar: [
      "undo",
      "redo",
      "|",
      "findAndReplace",
      "selectAll",
      "showBlocks",
      "sourceEditing",
      "|",
      "heading",
      "style",
      "|",
      "fontSize",
      "fontFamily",
      "fontColor",
      "fontBackgroundColor",
      "highlight",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "subscript",
      "code",
      "removeFormat",
      "|",
      "link",
      "bookmark",
      "insertImage",
      "mediaEmbed",
      "insertTable",
      "blockQuote",
      "codeBlock",
      "horizontalLine",
      "htmlEmbed",
      "|",
      "bulletedList",
      "numberedList",
      "todoList",
      "outdent",
      "indent",
      "alignment",
    ],
    image: {
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:block",
        "imageStyle:side",
        "|",
        "resizeImage",
      ],
      insert: {
        integrations: ["upload", "url"],
      },
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    style: {
      definitions: [
        {
          name: "Lead Paragraph",
          element: "p",
          classes: ["article-lead"],
        },
        {
          name: "Muted Paragraph",
          element: "p",
          classes: ["article-muted"],
        },
        {
          name: "Info Box",
          element: "p",
          classes: ["article-info-box"],
        },
        {
          name: "Section Heading",
          element: "h2",
          classes: ["article-section-title"],
        },
        {
          name: "Small Label",
          element: "span",
          classes: ["article-small-label"],
        },
        {
          name: "Highlighted Text",
          element: "span",
          classes: ["article-highlight-text"],
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /.*/,
          attributes: true,
          classes: true,
          styles: true,
        },
      ],
    },
  };
}

export default function RichTextEditor({ id, label, value, onChange, uploadToken }) {
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

      const editor = await ClassicEditor.create(hostRef.current, buildEditorConfig(uploadToken));

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
  }, [uploadToken]);

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
