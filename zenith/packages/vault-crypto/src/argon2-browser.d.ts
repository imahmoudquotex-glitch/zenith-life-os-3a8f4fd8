declare module 'argon2-browser' {
  export interface ArgonHashResult {
    hash: Uint8Array<ArrayBuffer>;
    hashHex: string;
    encoded: string;
  }

  export interface ArgonHashParams {
    pass: string | Uint8Array;
    salt: string | Uint8Array;
    time?: number;
    mem?: number;
    hashLen?: number;
    parallelism?: number;
    secret?: Uint8Array;
    ad?: Uint8Array;
    type?: ArgonType;
  }

  export enum ArgonType {
    Argon2d = 0,
    Argon2i = 1,
    Argon2id = 2,
  }

  export function hash(params: ArgonHashParams): Promise<ArgonHashResult>;
  export function verify(params: ArgonHashParams & { encoded: string }): Promise<void>;
}
