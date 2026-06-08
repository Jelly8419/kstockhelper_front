import type { LegalDocument } from "@/lib/legal/content";

/**
 * Renders the structured section data of a legal document.
 * Used both on the standalone /privacy, /terms pages and inside the
 * signup consent accordions.
 */
export function LegalContent({ document }: { document: LegalDocument }) {
  return (
    <div className="flex flex-col gap-6">
      {document.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="text-base font-semibold text-foreground">
            {section.heading}
          </h2>
          {section.blocks.map((block, i) => {
            if (block.type === "subheading") {
              return (
                <h3
                  key={i}
                  className="mt-1 text-sm font-semibold text-foreground"
                >
                  {block.text}
                </h3>
              );
            }
            if (block.type === "ul") {
              return (
                <ul
                  key={i}
                  className="ml-4 list-disc space-y-1 text-sm text-muted"
                >
                  {block.items.map((item, j) => (
                    <li key={j}>{item}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-sm leading-relaxed text-muted">
                {block.text}
              </p>
            );
          })}
        </section>
      ))}
    </div>
  );
}
