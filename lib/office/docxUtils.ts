import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  PageOrientation
} from "docx";

export type PageSizeKey = "a4" | "letter" | "legal" | "a5";
export type PageOrientationKey = "portrait" | "landscape";
export type PageMarginKey = "normal" | "narrow" | "wide";

export const PAGE_SIZE_SPECS: Record<
  PageSizeKey,
  { label: string; widthPx: number; heightPx: number; widthTwip: number; heightTwip: number }
> = {
  a4: { label: "A4 (210 × 297 mm)", widthPx: 794, heightPx: 1123, widthTwip: 11906, heightTwip: 16838 },
  letter: { label: "US Letter (8.5 × 11 in)", widthPx: 816, heightPx: 1056, widthTwip: 12240, heightTwip: 15840 },
  legal: { label: "Legal (8.5 × 14 in)", widthPx: 816, heightPx: 1344, widthTwip: 12240, heightTwip: 20160 },
  a5: { label: "A5 (148 × 210 mm)", widthPx: 559, heightPx: 794, widthTwip: 8391, heightTwip: 11906 },
};

export const MARGIN_SPECS: Record<PageMarginKey, { label: string; px: number; twip: number }> = {
  normal: { label: "Normal (1 in)", px: 56, twip: 1440 },
  narrow: { label: "Narrow (0.5 in)", px: 28, twip: 720 },
  wide: { label: "Wide (1.5 in)", px: 84, twip: 2160 },
};

export async function importDocxFile(file: File): Promise<{ title: string; html: string }> {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return {
    title: file.name.replace(/\.docx$/i, ""),
    html: result.value || "<p></p>",
  };
}

export async function exportDocxFile(options: {
  title: string;
  html: string;
  pageSize: PageSizeKey;
  orientation: PageOrientationKey;
  margin: PageMarginKey;
  headerText?: string;
  footerText?: string;
}) {
  const { title, html, pageSize, orientation, margin, headerText, footerText } = options;
  const spec = PAGE_SIZE_SPECS[pageSize];
  const mSpec = MARGIN_SPECS[margin];

  const parser = new DOMParser();
  const parsed = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const container = parsed.body.firstElementChild;
  const children: (Paragraph | Table)[] = [];

  if (headerText?.trim()) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: headerText.trim(), size: 18, color: "64748B", italics: true })],
        spacing: { after: 200 },
      })
    );
  }

  const buildRuns = (el: Node): TextRun[] => {
    const runs: TextRun[] = [];
    el.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent) runs.push(new TextRun({ text: node.textContent }));
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = (node as Element).tagName.toLowerCase();
        const text = node.textContent || "";
        if (!text) return;
        runs.push(
          new TextRun({
            text,
            bold: tag === "strong" || tag === "b",
            italics: tag === "em" || tag === "i",
            underline: tag === "u" ? {} : undefined,
            strike: tag === "s" || tag === "strike" || tag === "del",
          })
        );
      }
    });
    return runs.length ? runs : [new TextRun({ text: el.textContent || "" })];
  };

  if (container) {
    Array.from(container.children).forEach((el) => {
      const tag = el.tagName.toLowerCase();
      if (tag === "h1") {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: buildRuns(el) }));
      } else if (tag === "h2") {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: buildRuns(el) }));
      } else if (tag === "h3") {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: buildRuns(el) }));
      } else if (tag === "ul" || tag === "ol") {
        Array.from(el.querySelectorAll("li")).forEach((li) => {
          children.push(
            new Paragraph({
              bullet: tag === "ul" ? { level: 0 } : undefined,
              numbering: tag === "ol" ? { reference: "default-numbering", level: 0 } : undefined,
              children: buildRuns(li),
            })
          );
        });
      } else if (tag === "table") {
        const rows = Array.from(el.querySelectorAll("tr")).map((tr) => {
          const cells = Array.from(tr.querySelectorAll("th,td")).map(
            (cell) =>
              new TableCell({
                children: [new Paragraph({ children: buildRuns(cell) })],
              })
          );
          return new TableRow({ children: cells.length ? cells : [new TableCell({ children: [new Paragraph("")] })] });
        });
        if (rows.length) {
          children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
        }
      } else if (tag === "hr") {
        children.push(new Paragraph({ text: "────────────────────────────────────────" }));
      } else {
        children.push(new Paragraph({ children: buildRuns(el), spacing: { after: 140 } }));
      }
    });
  }

  if (footerText?.trim()) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: footerText.trim(), size: 18, color: "64748B" })],
        spacing: { before: 240 },
      })
    );
  }

  if (children.length === 0) {
    children.push(new Paragraph({ text: title || "Document" }));
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: "left" }],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: {
              width: orientation === "landscape" ? spec.heightTwip : spec.widthTwip,
              height: orientation === "landscape" ? spec.widthTwip : spec.heightTwip,
              orientation:
                orientation === "landscape"
                  ? PageOrientation.LANDSCAPE
                  : PageOrientation.PORTRAIT,
            },
            margin: {
              top: mSpec.twip,
              right: mSpec.twip,
              bottom: mSpec.twip,
              left: mSpec.twip,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(title || "document").replace(/\s+/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
