import { Document } from "mongoose";

export interface IEnvFile {
  name: string;
  content: string;
}

export interface IEnvLink {
  id: string;
  encryptedData: string;
  passwordHash?: string;
  expiresAt: Date | null;
  filesCount: number;
  reference?: string;
  installCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnvLinkRequest {
  encryptedData: string;
  passwordHash?: string;
  expirationDuration?: string;
  reference?: string;
  filesCount: number;
}

export interface IUpdateEnvLinkRequest {
  encryptedData?: string;
  expirationDuration?: string;
  passwordHash?: string;
  currentPassword: string;
  reference?: string;
  filesCount?: number;
}

export interface IInstallEnvLinkRequest {
  id: string;
  password: string;
}

export interface IGetInfoEnvLinkRequest {
  id: string;
  password: string;
}

export interface IExpireEnvLinkRequest {
  id: string;
  password: string;
}

export interface IEnvLinkResponse {
  id: string;
  expiresAt: string;
  createdAt: string;
  reference?: string;
}

export interface IInstallResponse {
  encryptedData: string;
}

export interface IEnvLinkDocument extends IEnvLink, Document {}
