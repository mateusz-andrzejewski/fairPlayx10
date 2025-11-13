/**
 * Vite plugin to inject polyfills for Cloudflare Workers compatibility
 * Specifically adds MessageChannel polyfill required by React 19
 */
import type { Plugin } from 'vite';

export function cloudflarePolyfills(): Plugin {
  return {
    name: 'cloudflare-polyfills',
    enforce: 'pre',
    
    // Inject polyfills into the SSR build
    transform(code, id) {
      // Only inject into the main worker entrypoint
      if (id.includes('dist/_worker.js') || id.includes('@astrojs-ssr-adapter')) {
        const polyfill = `
// Polyfill for MessageChannel API required by React 19 in Cloudflare Workers
if (typeof MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      const channel = {
        port1: null,
        port2: null
      };
      
      const createPort = (other) => ({
        postMessage: (message) => {
          if (other && other.onmessage) {
            // Simulate async message passing
            queueMicrotask(() => {
              other.onmessage({ data: message });
            });
          }
        },
        onmessage: null,
        start: () => {},
        close: () => {}
      });
      
      channel.port1 = createPort(channel.port2 || {});
      channel.port2 = createPort(channel.port1);
      
      this.port1 = channel.port1;
      this.port2 = channel.port2;
    }
  };
}
`;
        return {
          code: polyfill + '\n' + code,
          map: null
        };
      }
      return null;
    },
    
    // Also add to generated output
    generateBundle(_, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (chunk.type === 'chunk' && fileName.includes('index.js') && chunk.code) {
          const polyfill = `
// Polyfill for MessageChannel API required by React 19
if (typeof MessageChannel === 'undefined') {
  globalThis.MessageChannel = class MessageChannel {
    constructor() {
      const channel = { port1: null, port2: null };
      const createPort = (other) => ({
        postMessage: (message) => {
          if (other && other.onmessage) {
            queueMicrotask(() => other.onmessage({ data: message }));
          }
        },
        onmessage: null,
        start: () => {},
        close: () => {}
      });
      channel.port1 = createPort(channel.port2 || {});
      channel.port2 = createPort(channel.port1);
      this.port1 = channel.port1;
      this.port2 = channel.port2;
    }
  };
}
`;
          chunk.code = polyfill + '\n' + chunk.code;
        }
      }
    }
  };
}

