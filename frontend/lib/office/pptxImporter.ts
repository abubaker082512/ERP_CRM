import JSZip from "jszip";

export type ImportedSlide = {
  id: string;
  layout: "cover" | "bullets" | "split" | "kpi";
  title: string;
  subtitle: string;
  bullets: string[];
  notes: string;
};

export async function importPptxFile(file: File): Promise<{ name: string; slides: ImportedSlide[] }> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });

  const parser = new DOMParser();
  const slides: ImportedSlide[] = [];

  for (let i = 0; i < slidePaths.length; i++) {
    const xmlStr = await zip.files[slidePaths[i]].async("text");
    const doc = parser.parseFromString(xmlStr, "application/xml");
    const paragraphs = Array.from(doc.getElementsByTagName("a:p"))
      .map((p) =>
        Array.from(p.getElementsByTagName("a:t"))
          .map((t) => t.textContent || "")
          .join("")
          .trim()
      )
      .filter(Boolean);

    const title = paragraphs[0] || `Slide ${i + 1}`;
    const subtitle = paragraphs[1] || "";
    const bullets = paragraphs.slice(2);

    slides.push({
      id: `imp-${Date.now()}-${i}`,
      layout: i === 0 ? "cover" : "bullets",
      title,
      subtitle,
      bullets: bullets.length ? bullets : subtitle ? [] : ["Imported slide content"],
      notes: "",
    });
  }

  return {
    name: file.name.replace(/\.pptx$/i, ""),
    slides: slides.length
      ? slides
      : [
          {
            id: `imp-${Date.now()}`,
            layout: "cover",
            title: file.name.replace(/\.pptx$/i, ""),
            subtitle: "Imported Presentation",
            bullets: [],
            notes: "",
          },
        ],
  };
}
