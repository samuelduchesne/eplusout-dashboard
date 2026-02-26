export class AppError extends Error {
  readonly context?: Record<string, unknown>;

  constructor(message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.context = context;
  }
}

export class DataLoadError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = 'DataLoadError';
  }
}

export class QueryError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = 'QueryError';
  }
}

export class RenderError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, context);
    this.name = 'RenderError';
  }
}
