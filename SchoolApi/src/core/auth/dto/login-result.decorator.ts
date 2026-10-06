import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { AuthTokensDto, TwoFactorChallengeDto } from './auth-tokens.dto';

/** `{ data: AuthTokensDto | TwoFactorChallengeDto }` (2FA accounts get a challenge). */
export const ApiLoginResult = () =>
  applyDecorators(
    ApiExtraModels(AuthTokensDto, TwoFactorChallengeDto),
    ApiOkResponse({
      schema: {
        type: 'object',
        properties: {
          data: {
            oneOf: [
              { $ref: getSchemaPath(AuthTokensDto) },
              { $ref: getSchemaPath(TwoFactorChallengeDto) },
            ],
          },
        },
      },
    }),
  );
