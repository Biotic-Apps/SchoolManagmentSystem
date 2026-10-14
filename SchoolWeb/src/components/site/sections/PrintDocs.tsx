import { DocCarousel } from "@/components/site/docs/DocCarousel";
import { DocFan } from "@/components/site/docs/DocFan";
import { PrintPoints } from "@/components/site/docs/PrintPoints";
import { SectionHeading } from "@/components/site/ui/SectionHeading";
import { PRINT_DOCS_COPY } from "@/lib/site/content";

/**
 * "Print-ready documents": a report card, a family fee challan, a certificate
 * and an ID card drawn as real paper. On tablets and up they fan out from a
 * pile as the section arrives; on phones they become a swipeable carousel.
 */
export function PrintDocs() {
  return (
    <section id="documents" className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow={PRINT_DOCS_COPY.eyebrow} title={PRINT_DOCS_COPY.title} body={PRINT_DOCS_COPY.body} />
          <PrintPoints />
        </div>

        <div className="min-w-0 lg:col-span-7">
          <div className="hidden md:block">
            <DocFan />
          </div>
          <div className="md:hidden">
            <DocCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
