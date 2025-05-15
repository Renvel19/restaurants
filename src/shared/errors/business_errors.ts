/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
export function BusinessLogicException(message: string, type: number) {
  this.message = message;
  this.type = type;
}

export enum BusinessError {
  NOT_FOUND,
  PRECONDITION_FAILED,
  BAD_REQUEST,
}
