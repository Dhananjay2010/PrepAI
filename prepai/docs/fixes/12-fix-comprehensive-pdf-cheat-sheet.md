# Fix Spec 12: Comprehensive PDF Cheat Sheet Export

- **Issue Type:** GAP
- **Target File(s):** [components/CheatSheetPDFDocument.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/CheatSheetPDFDocument.tsx), [components/PrintableCheatSheet.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/PrintableCheatSheet.tsx)
- **Priority:** HIGH
- **Affected Route(s):** PDF Export modal on `/` and `/dashboard/[id]`

---

## 1. Current State & Root Cause Analysis

In [CheatSheetPDFDocument.tsx](file:///Users/dhananjayrawat/Antigravity/PrepAI/prepai/components/CheatSheetPDFDocument.tsx), PrepAI compiles session questions into a PDF document using `@react-pdf/renderer`.

### Critical Deficiencies & Pain Points:
1. **Omitted Visual Artifacts:** The exported PDF document only contains basic text fields (`question`, `category`, `what_they_test`, `strong_answer_outline`).
2. **Missing Diagrams & Code:** All visual **Mermaid Architecture Diagrams**, **Code Snippets**, **Trade-off Comparison Matrices**, and **STAR Stories** are completely omitted from the generated PDF!
3. **Incomplete Offline Pack:** Candidates trying to print a revision guide 1 day before their interview miss the visual architecture diagrams and code examples.

---

## 2. Proposed Technical Architecture

```mermaid
graph TD
    A[Export PDF Requested] --> B[Collect Session Artifacts]
    B --> C[Question Text & Model Answers]
    B --> D[Convert Mermaid SVG Diagrams to Base64 PNG]
    B --> E[Format Code Snippets & SQL Queries]
    B --> F[Format Architectural Trade-Off Matrices]
    B --> G[Format Tailored STAR Stories]
    
    C & D & E & F & G --> H[@react-pdf/renderer Comprehensive Document Generator]
    H --> I[Download Complete High-Fidelity PDF Revision Pack]
```

---

## 3. Step-by-Step Implementation Plan

### Step 3.1: Convert Mermaid SVG Diagrams to PDF-Compatible Images
Use `canvg` or browser `<canvas>` to convert Mermaid SVG renders into PNG Data URLs before building the PDF document:

```typescript
export async function convertSvgToPngDataUrl(svgElement: SVGElement): Promise<string> {
  return new Promise((resolve) => {
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgString)));
  });
}
```

### Step 3.2: Update `CheatSheetPDFDocument.tsx` Schema
Add sections in `@react-pdf/renderer` for Code Snippets, Trade-off Tables, and STAR Stories:

```tsx
{/* Code Snippet Section */}
{q.sample_code_snippet && (
  <View style={styles.codeBlock}>
    <Text style={styles.codeHeader}>{q.sample_code_snippet.language.toUpperCase()} CODE SNIPPET:</Text>
    <Text style={styles.codeText}>{q.sample_code_snippet.code}</Text>
  </View>
)}

{/* Trade-off Matrix Section */}
{q.trade_offs && (
  <View style={styles.tradeoffBox}>
    <Text style={styles.tradeoffTitle}>SYSTEM TRADE-OFF COMPARISON:</Text>
    <Text style={styles.tradeoffText}>Option A ({q.trade_offs.technology_a}) vs Option B ({q.trade_offs.technology_b})</Text>
    <Text style={styles.verdictText}>Verdict: {q.trade_offs.verdict}</Text>
  </View>
)}
```

---

## 4. Regression Prevention & Safety Mitigation

- **Async PDF Generation:** Render PDF generation asynchronously in background to prevent blocking the UI during image conversion.
- **Graceful Image Fallback:** If SVG image conversion fails, fall back to rendering the raw text definition of the architecture diagram inside a code block.

---

## 5. Verification & Acceptance Criteria

1. **PDF Content Check:** Export PDF for a session containing 10 questions. Confirm generated PDF includes:
   - System Architecture Diagrams (PNG images).
   - Code Sandbox Snippets with syntax styling.
   - Architectural Trade-off Matrices.
   - Tailored STAR Stories.
2. **Print Quality Test:** Open exported PDF in Adobe Acrobat / Apple Preview. Confirm formatting, font crispness, and page breaks are clean.
