export interface IEnvFile {
  name: string;
  content: string;
}

export interface ICreateEnvLinkRequest {
  files: IEnvFile[];
  expirationDuration?: string;
  expirationPassword?: string;
}

export interface ICreateEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    expiresAt: string | null;
    filesCount: number;
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
    createdAt: string;
  };
}

export interface IEnvLinkInfoResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    status: "active" | "expired";
    filesCount: number;
    fileNames: string[];
    expiresAt: string | null;
    createdAt: string;
  };
}

export interface IInstallEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    files: IEnvFile[];
  };
}

export interface IInstallResponse {
  success: boolean;
  message: string;
  data: {
    files: IEnvFile[];
  };
}

export interface IExpireEnvLinkResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface IUpdateEnvLinkRequest {
  files?: IEnvFile[];
  expirationDuration?: string;
  expirationPassword?: string;
  currentPassword?: string;
}

export interface IUpdateEnvLinkResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    expiresAt: string | null;
    filesCount?: number;
  };
}

export interface ICommandOptions {
  exp?: string;
  expPass?: string;
  selectFiles?: boolean;
  currentPassword?: string;
  currentPass?: string;
  files?: boolean;
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
