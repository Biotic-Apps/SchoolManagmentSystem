import { applyDecorators, type Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

const PAGE_META = {
  type: 'object',
  properties: {
    page: { type: 'integer' },
    pageSize: { type: 'integer' },
    total: { type: 'integer' },
  },
};

/** Documents the `{ data }` envelope around a DTO (or array of DTOs). */
export function ApiData(
  model: Type<unknown>,
  options: { isArray?: boolean } = {},
) {
  const ref = { $ref: getSchemaPath(model) };
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: options.isArray ? { type: 'array', items: ref } : ref,
        },
      },
    }),
  );
}

/** Documents the paged `{ data: [], meta }` envelope. */
export function ApiPage(model: Type<unknown>) {
  return applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(model) } },
          meta: PAGE_META,
        },
      },
    }),
  );
}
