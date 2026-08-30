import React, { useMemo } from 'react';
import { markdownToHtml, type FormatStyle } from '../utils/markdownParser';
import './FormattedContent.css';

interface FormattedContentProps {
  /** Plain-text conversion (markdownToSocialText output) used as fallback. */
  contentText: string;
  /** Raw markdown; when present it is rendered as sanitized HTML instead. */
  markdown?: string;
  formatStyle?: FormatStyle;
  /** Class of the platform's text element, reused for both render modes. */
  textClassName: string;
  placeholder?: string;
  placeholderClassName?: string;
}

/**
 * Shared content renderer for the platform previews: real formatted HTML when
 * raw markdown is available (sanitized by DOMPurify inside markdownToHtml),
 * the plain-text conversion otherwise. Never injects unsanitized content.
 */
export const FormattedContent: React.FC<FormattedContentProps> = ({
  contentText,
  markdown,
  formatStyle = 'standard',
  textClassName,
  placeholder,
  placeholderClassName,
}) => {
  const html = useMemo(
    () => (markdown ? markdownToHtml(markdown, formatStyle) : ''),
    [markdown, formatStyle]
  );

  if (!markdown && !contentText) {
    if (!placeholder) return null;
    return <p className={placeholderClassName}>{placeholder}</p>;
  }

  if (markdown) {
    return (
      <div
        className={`${textClassName} formatted-content`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return <p className={textClassName}>{contentText}</p>;
};
