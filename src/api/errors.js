export const ApiError = class ApiError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
  }
}

export const ApiErrorInternalServerError = class ApiErrorInternalServerError extends ApiError {
  constructor() {
    super('Внутрення ошибка на сервере магазина')
  }
}