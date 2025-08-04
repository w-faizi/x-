import { type Download, type InsertDownload } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getDownload(id: string): Promise<Download | undefined>;
  createDownload(download: InsertDownload & { platform: string }): Promise<Download>;
  updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined>;
  getDownloadsByStatus(status: string): Promise<Download[]>;
}

export class MemStorage implements IStorage {
  private downloads: Map<string, Download>;

  constructor() {
    this.downloads = new Map();
  }

  async getDownload(id: string): Promise<Download | undefined> {
    return this.downloads.get(id);
  }

  async createDownload(insertDownload: InsertDownload & { platform: string }): Promise<Download> {
    const id = randomUUID();
    const download: Download = {
      ...insertDownload,
      id,
      status: "pending",
      filename: null,
      filesize: null,
      downloadUrl: null,
      metadata: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.downloads.set(id, download);
    return download;
  }

  async updateDownload(id: string, updates: Partial<Download>): Promise<Download | undefined> {
    const existing = this.downloads.get(id);
    if (!existing) return undefined;

    const updated: Download = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.downloads.set(id, updated);
    return updated;
  }

  async getDownloadsByStatus(status: string): Promise<Download[]> {
    return Array.from(this.downloads.values()).filter(
      (download) => download.status === status,
    );
  }
}

export const storage = new MemStorage();
