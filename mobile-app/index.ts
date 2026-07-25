// Safe DOM Event Polyfill Proxy Guard for React Native JS engine
// Traps read-only property assignments like Event.NONE = 0 from third-party event-target polyfills
if (typeof globalThis !== 'undefined') {
  const g = globalThis as any;
  if (g.Event) {
    try {
      const createProxy = (target: any) => {
        return new Proxy(target, {
          set(t, prop, val, receiver) {
            try {
              return Reflect.set(t, prop, val, receiver);
            } catch (e) {
              return true; // Trap read-only property error silently
            }
          },
          defineProperty(t, prop, desc) {
            try {
              return Reflect.defineProperty(t, prop, desc);
            } catch (e) {
              return true;
            }
          }
        });
      };
      g.Event = createProxy(g.Event);
      if (g.Event.prototype) {
        g.Event.prototype = createProxy(g.Event.prototype);
      }
    } catch (e) {}
  }
}

import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
