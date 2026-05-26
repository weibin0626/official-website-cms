import sanitizeHtml from 'sanitize-html';

const defaultOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'hr', 'blockquote',
    'ul', 'ol', 'li',
    'a', 'strong', 'em', 'b', 'i', 'u', 's', 'sub', 'sup',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'img', 'figure', 'figcaption',
    'pre', 'code',
    'div', 'span',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    '*': ['class', 'style'],
  },
  allowedStyles: {
    '*': {
      'text-align': [/^left|^right|^center|^justify$/],
      'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'background-color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
    },
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  selfClosing: ['img', 'br', 'hr'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
  },
};

export const sanitize = (dirty: string, options?: sanitizeHtml.IOptions): string => {
  return sanitizeHtml(dirty, options || defaultOptions);
};

export const sanitizePlain = (str: string): string => {
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
  });
};

export default sanitize;
