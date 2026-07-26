// Safe DOM Event Polyfill Guard for React Native / Hermes JS engine
// Fixes "Cannot assign to read-only property 'NONE'" caused by React Native 0.81+ defining Event phase constants as non-writable via Object.defineProperty

if (typeof globalThis !== 'undefined') {
  const g = globalThis as any;

  // Polyfill missing window object if running in pure JS context
  if (typeof g.window === 'undefined') {
    g.window = g;
  }

  // Intercept Object.defineProperty to ensure Event phase constants are ALWAYS writable & configurable
  const originalDefineProperty = Object.defineProperty;
  const targetProps = new Set(['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE']);

  try {
    Object.defineProperty = function (obj: any, prop: PropertyKey, descriptor: PropertyDescriptor & { writable?: boolean; configurable?: boolean }) {
      if (typeof prop === 'string' && targetProps.has(prop) && descriptor) {
        descriptor = {
          ...descriptor,
          writable: true,
          configurable: true,
        };
      }
      return originalDefineProperty.call(Object, obj, prop, descriptor);
    };
  } catch (e) {}

  // Helper to make properties on Event & Event.prototype writable if already defined
  const fixEventProps = (target: any) => {
    if (!target) return;
    targetProps.forEach((prop) => {
      try {
        const desc = Object.getOwnPropertyDescriptor(target, prop);
        if (desc && (!desc.writable || !desc.configurable)) {
          originalDefineProperty.call(Object, target, prop, {
            ...desc,
            writable: true,
            configurable: true,
          });
        }
      } catch (e) {}
    });
  };

  if (g.Event) {
    fixEventProps(g.Event);
    fixEventProps(g.Event.prototype);
  }
}
