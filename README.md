# Markdown2Social

A sleek, modern web application that converts Markdown content into formatted social media posts. Write in Markdown, preview in real-time, and copy formatted content ready for LinkedIn and other platforms.

![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)
![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

- **Live Markdown Editor**: Write with syntax highlighting using CodeMirror
- **Real-time Preview**: See how your post will look instantly
- **Multi-platform Support**: Optimized for LinkedIn (expandable to other platforms)
- **Rich Text Copying**: Copy content with inline styles preserved
- **Formatting Styles**:
  - Standard formatting
  - Bullet-optimized (converts bullets to ✅ emojis)
  - Bold headers (converts headers to bold text)
- **Unicode Text Conversion**: Converts **bold** and _italic_ Markdown to Unicode variants that render on all platforms
- **Code Highlighting**: Syntax highlighting for code blocks with 30+ languages supported via highlight.js
- **Auto-save History**: Drafts are automatically saved with timestamps
- **Draft Management**: View and restore previous drafts

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd md-to-social

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📖 Usage

1. **Write**: Enter your content in the Markdown editor on the left
2. **Preview**: See the formatted output in real-time on the right
3. **Configure**: Click the settings gear to choose your formatting style
4. **Copy**: Click "Copy" to copy formatted content to your clipboard
5. **Paste**: Paste into LinkedIn or your preferred platform

### Markdown Support

The editor supports standard Markdown syntax:

- Headers (`# H1`, `## H2`, etc.)
- Bold (`**text**`) and italic (`*text*` or `_text_`)
- Lists (bullet and numbered)
- Code blocks with syntax highlighting (` ```language `)
- Inline code (`` `code` ``)
- Links (`[text](url)`)

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Code Editor**: CodeMirror 6 with @codemirror/lang-markdown
- **Markdown Parsing**: Marked with marked-highlight
- **Syntax Highlighting**: Highlight.js (GitHub theme)
- **Sanitization**: DOMPurify
- **Icons**: Lucide React

## 📁 Project Structure

```
md-to-social/
├── src/
│   ├── components/
│   │   ├── Workspace.tsx       # Main editor workspace
│   │   ├── MarkdownEditor.tsx  # CodeMirror-based editor
│   │   ├── LivePreview.tsx     # HTML preview component
│   │   ├── LinkedInPost.tsx    # LinkedIn-style post preview
│   │   ├── Toolbar.tsx         # Action toolbar
│   │   ├── StyleModal.tsx      # Formatting settings modal
│   │   └── HistoryModal.tsx    # Draft history modal
│   ├── hooks/
│   │   └── useHistory.ts       # Draft history management
│   ├── utils/
│   │   └── markdownParser.ts   # Markdown parsing & conversion
│   ├── App.tsx
│   └── main.tsx
├── design/
│   └── product_requirements_document.html
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for content creators who love Markdown.
