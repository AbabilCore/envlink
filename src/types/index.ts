export interface IEnvFile {
  name: string;
  content: string;
}

export interface ICreateEnvLinkRequest {
  encryptedData: string;
  passwordHash?: string;
  accessKey?: string;
  expirationDuration?: string;
  reference?: string;
}

export interface ICreateEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    expiresAt: string;
    filesCount: number;
    reference?: string;
    createdAt: string;
    accessKey?: string;
    baseId?: string;
  };
}

export interface IGetEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    files?: IEnvFile[];
    status: "active" | "expired";
    filesCount: number;
    expiresAt: string | null;
    expiredAt?: string | null;
    installCount: number;
    reference: string | null;
    createdAt: string;
  };
}

export interface IEnvLinkInfoResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    filesCount: number;
    expiresAt: string;
    createdAt: string;
  };
}

export interface IInstallEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    encryptedData: string;
  };
}

export interface IInstallResponse {
  success: boolean;
  message: string;
  data: {
    encryptedData: string;
  };
}

export interface IExpireEnvLinkResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface IUpdateEnvLinkRequest {
  encryptedData?: string;
  expirationDuration?: string;
  passwordHash?: string;
  currentPassword: string;
  reference?: string;
}

export interface IUpdateEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    expiresAt: string;
    filesCount?: number;
  };
}

export interface ICommandOptions {
  exp?: string;
  pass?: string | boolean;
  ref?: string;
  selectFiles?: boolean;
  currentPassword?: string;
  currentPass?: string;
  files?: boolean;
  optionalPass?: boolean;
}

export interface IErrorWithMessage {
  message: string;
}

export interface ApiErrorResponse {
  message?: string;
}

export type TMethod = (
  message: string,
  config?: { terminate: boolean; code: 1 | 0 },
) => void;

export type TLogMethod = (message: string) => void;
