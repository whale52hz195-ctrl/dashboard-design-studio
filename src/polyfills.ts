// Polyfills for Firebase Admin SDK in browser environment

// Define process for browser compatibility
if (typeof window !== 'undefined' && typeof window.process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: 'development',
    },
    // Add any other process properties if needed
  };
}

// Define Buffer for browser compatibility
if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = {
    isBuffer: (obj: any) => obj && obj.constructor && obj.constructor.isBuffer(obj),
    from: (str: string) => {
      const encoded = typeof str === 'string' ? str : String(str);
      const bytes = new Uint8Array(encoded.length);
      for (let i = 0; i < encoded.length; i++) {
        bytes[i] = encoded.charCodeAt(i);
      }
      return bytes;
    },
    alloc: (size: number) => new Uint8Array(size),
    allocUnsafe: (size: number) => new Uint8Array(size),
    isEncoding: (encoding: string) => ['utf8', 'utf16le', 'ascii', 'base64', 'binary', 'hex'].includes(encoding),
    concat: (list: Uint8Array[], totalLength?: number) => {
      if (list.length === 0) return new Uint8Array(0);
      if (totalLength === undefined) totalLength = list.reduce((sum, arr) => sum + arr.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const arr of list) {
        result.set(arr, offset);
        offset += arr.length;
      }
      return result;
    },
    toString: (buf: Uint8Array) => {
      let result = '';
      for (let i = 0; i < buf.length; i++) {
        result += String.fromCharCode(buf[i]);
      }
      return result;
    }
  };
}

// Define EventEmitter for browser compatibility
class EventEmitter {
  private listeners: Record<string, Function[]> = {};
  private maxListeners: number = 10;

  on(event: string, listener: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(listener);
    return this;
  }

  off(event: string, listener: Function) {
    if (this.listeners[event]) {
      const index = this.listeners[event].indexOf(listener);
      if (index > -1) {
        this.listeners[event].splice(index, 1);
      }
    }
    return this;
  }

  emit(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
    return this;
  }

  once(event: string, listener: Function) {
    const onceWrapper = (...args: any[]) => {
      this.off(event, onceWrapper);
      listener(...args);
    };
    this.on(event, onceWrapper);
    return this;
  }

  addListener(event: string, listener: Function) {
    return this.on(event, listener);
  }

  removeListener(event: string, listener: Function) {
    return this.off(event, listener);
  }

  setMaxListeners(n: number) {
    this.maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this.maxListeners;
  }

  listenerCount(event: string) {
    return this.listeners[event]?.length || 0;
  }
}

// Make EventEmitter available globally
if (typeof window !== 'undefined') {
  (window as any).EventEmitter = EventEmitter;
}

export default {
  process: typeof process,
  Buffer: typeof Buffer,
};

// Export the EventEmitter class for direct use
export { EventEmitter };
