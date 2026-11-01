import { Document, Packer, PageBreak, Paragraph, TextRun } from "docx";
import type { ArbDocBlock, ArbDocModel } from "./doc-model";

// Renders the doc model to .docx per the course submission rules: Arial,
// 12 pt (24 half-points, complex-script size too so Hebrew is 12 pt),
// 1.5 line spacing (line 360 at the 240 single-line base). Hebrew output
// sets paragraph bidi and run right-to-left so Word lays it out RTL.

export const ARB_DOCX_FONT = "Arial";
export const ARB_DOCX_HALF_POINTS = 24;
export const ARB_DOCX_LINE = 360;

function paragraphFor(block: ArbDocBlock, rtl: boolean): Paragraph {
  if (block.type === "pageBreak") return new Paragraph({ children: [new PageBreak()] });
  const bold = block.type === "title" || block.type === "heading1" || block.type === "heading2";
  const run = new TextRun({
    text: block.text,
    bold,
    italics: block.type === "note",
    rightToLeft: rtl,
    font: ARB_DOCX_FONT,
    size: ARB_DOCX_HALF_POINTS,
    sizeComplexScript: ARB_DOCX_HALF_POINTS,
  });
  return new Paragraph({
    children: [run],
    bidirectional: rtl,
    bullet: block.type === "bullet" ? { level: 0 } : undefined,
    spacing: {
      line: ARB_DOCX_LINE,
      before: block.type === "heading1" ? 240 : block.type === "heading2" ? 160 : 0,
      after: 120,
    },
  });
}

export function buildArbDocx(model: ArbDocModel): Document {
  const rtl = model.lang === "he";
  return new Document({
    creator: "TokenLens",
    title: "Arbitrum (ARB) final project",
    styles: {
      default: {
        document: {
          run: {
            font: ARB_DOCX_FONT,
            size: ARB_DOCX_HALF_POINTS,
            sizeComplexScript: ARB_DOCX_HALF_POINTS,
            rightToLeft: rtl,
          },
          paragraph: { spacing: { line: ARB_DOCX_LINE } },
        },
      },
    },
    sections: [{ children: model.blocks.map((b) => paragraphFor(b, rtl)) }],
  });
}

export function arbDocxBlob(model: ArbDocModel): Promise<Blob> {
  return Packer.toBlob(buildArbDocx(model));
}

export function arbDocxBuffer(model: ArbDocModel): Promise<Buffer> {
  return Packer.toBuffer(buildArbDocx(model));
}
