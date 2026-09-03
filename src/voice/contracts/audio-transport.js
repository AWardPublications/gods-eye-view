/**
 * Audio Transport Provider Contract
 * Formal interface for WebRTC, WebSocket, and In-Memory audio stream management.
 */

export class AudioTransport {
  constructor(options = {}) {
    this.name = options.name || "BaseAudioTransport";
    this.version = options.version || "1.0.0";
    this.protocol = options.protocol || "MEMORY_BUFFER";
    this.isConnected = false;
  }

  async connect(connectionConfig = {}) {
    this.isConnected = true;
    return { ok: true, transport: this.name, protocol: this.protocol };
  }

  async sendAudio(audioChunk, metadata = {}) {
    throw new Error(`[${this.name}] sendAudio() must be implemented by subclass.`);
  }

  async disconnect() {
    this.isConnected = false;
    return { ok: true, transport: this.name };
  }

  getMetadata() {
    return {
      transport: this.name,
      version: this.version,
      protocol: this.protocol,
      connected: this.isConnected
    };
  }
}
