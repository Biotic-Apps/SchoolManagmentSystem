import {
  ArgumentsHost,
  BadRequestException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { ErrorCode } from '../errors/error-code.enum';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getResponse: () => ({ status }),
      getRequest: () => ({ method: 'GET', url: '/api/v1/test' }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

function prismaError(code: string): Error {
  const error = new Error('db failure');
  error.name = 'PrismaClientKnownRequestError';
  return Object.assign(error, { code });
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  beforeAll(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('renders AppError with its code, status and details', () => {
    const { host, status, json } = createHost();

    filter.catch(
      new AppError(ErrorCode.FORBIDDEN_SCOPE, 'Out of scope', { id: 'x' }),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.FORBIDDEN_SCOPE,
        message: 'Out of scope',
        details: { id: 'x' },
      },
    });
  });

  it('maps ValidationPipe errors to VALIDATION_FAILED with details', () => {
    const { host, status, json } = createHost();
    const messages = ['name should not be empty'];

    filter.catch(new BadRequestException(messages), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Validation failed',
        details: messages,
      },
    });
  });

  it('maps HttpException status to a stable code', () => {
    const { host, status, json } = createHost();

    filter.catch(new NotFoundException('Student not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith({
      error: { code: ErrorCode.NOT_FOUND, message: 'Student not found' },
    });
  });

  it('maps Prisma unique violations to CONFLICT', () => {
    const { host, status, json } = createHost();

    filter.catch(prismaError('P2002'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(json).toHaveBeenCalledWith({
      error: { code: ErrorCode.CONFLICT, message: 'Record already exists' },
    });
  });

  it.each([
    new Error('secret internal detail'),
    new InternalServerErrorException('db password leaked'),
  ])('hides internal details for %p', (exception) => {
    const { host, status, json } = createHost();

    filter.catch(exception, host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith({
      error: {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Something went wrong',
      },
    });
  });
});
