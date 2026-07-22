import { vi, beforeEach } from 'vitest';

/**
 * jsdom ships no canvas implementation. Rather than pull in `node-canvas`, we
 * install a recording stub: every 2d context call is a spy, so tests assert on
 * the drawing commands the renderer issues.
 */
export type TFakeCtx = ReturnType<typeof createFakeCtx>;

export function createFakeCtx() {
  return {
    canvas: null as unknown as HTMLCanvasElement,
    strokeStyle: '',
    fillStyle: '',
    lineWidth: 0,
    lineCap: 'butt',
    scale: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) }) as ImageData),
    putImageData: vi.fn(),
  };
}

let currentCtx = createFakeCtx();

/** The 2d context handed to the most recently constructed renderer. */
export const getFakeCtx = (): TFakeCtx => currentCtx;

HTMLCanvasElement.prototype.getContext = function getContext(
  this: HTMLCanvasElement,
) {
  currentCtx.canvas = this;
  return currentCtx as unknown as CanvasRenderingContext2D;
} as HTMLCanvasElement['getContext'];

beforeEach(() => {
  currentCtx = createFakeCtx();
  // keep devicePixelRatio deterministic; individual tests override it
  Object.defineProperty(window, 'devicePixelRatio', {
    value: 1,
    configurable: true,
    writable: true,
  });
});
