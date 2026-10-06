import { Injectable } from '@nestjs/common';
import type { GeneratedDocumentKind } from '../../generated/prisma/client';

export interface RenderedDocument {
  buffer: Buffer;
  /** Download name, e.g. `receipt-RCT-MAIN-2026-0001.pdf`. */
  fileName: string;
}

/** One per document kind; registered in `onModuleInit` by the owning module. */
export interface DocumentRenderer {
  readonly kind: GeneratedDocumentKind;
  render(entityId: string, version: number): Promise<RenderedDocument>;
}

@Injectable()
export class DocumentRendererRegistry {
  private readonly renderers = new Map<
    GeneratedDocumentKind,
    DocumentRenderer
  >();

  register(renderer: DocumentRenderer): void {
    if (this.renderers.has(renderer.kind)) {
      throw new Error(`Renderer for ${renderer.kind} already registered`);
    }
    this.renderers.set(renderer.kind, renderer);
  }

  get(kind: GeneratedDocumentKind): DocumentRenderer {
    const renderer = this.renderers.get(kind);
    if (!renderer) throw new Error(`No renderer for ${kind}`);
    return renderer;
  }
}
