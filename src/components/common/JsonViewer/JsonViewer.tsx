'use client';

import { useState } from 'react';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import './JsonViewer.css';

interface JsonViewerProps {
  src: any;
  title?: string;
  collapsed?: number;
  className?: string;
  copyable?: boolean;
}

export default function JsonViewer({ src, title, collapsed = 2, className = '', copyable = true }: Readonly<JsonViewerProps>) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(src, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className={`json-viewer ${className}`}>
      <div className="json-viewer-top">
        {title && <span className="json-viewer-title">{title}</span>}
        {copyable && (
          <button className={`json-viewer-copy-btn ${copied ? 'copied' : ''}`} onClick={copyToClipboard} title="Copy to clipboard">
            {copied ? '✓' : 'Copy'}
          </button>
        )}
      </div>
      <div className="json-viewer-scroll">
        <JsonView src={src} theme="default" collapsed={collapsed} displaySize={0} />
      </div>
    </div>
  );
}
