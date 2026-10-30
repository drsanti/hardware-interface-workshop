import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vite-plus";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Beginner HTML / CSS / TS multi-page track (no React). */
export default defineConfig({
  resolve: {
    alias: {
      "@sdk": path.resolve(root, "sdk"),
    },
  },
  server: {
    port: 5174,
    open: "/",
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(root, "index.html"),
        ex00: path.resolve(root, "ex00-hello/index.html"),
        ex01: path.resolve(root, "ex01-dynamic-elements/index.html"),
        ex02: path.resolve(root, "ex02-dynamic-style/index.html"),
        ex03: path.resolve(root, "ex03-form-events/index.html"),
        ex04: path.resolve(root, "ex04-keyboard-pointer/index.html"),
        ex05: path.resolve(root, "ex05-svg-draw/index.html"),
        ex06: path.resolve(root, "ex06-canvas-draw/index.html"),
        ex07: path.resolve(root, "ex07-web-audio-mic/index.html"),
        ex08: path.resolve(root, "ex08-web-audio-speaker/index.html"),
        ex09: path.resolve(root, "ex09-web-video-camera/index.html"),
        ex10: path.resolve(root, "ex10-web-serial/index.html"),
        ex11: path.resolve(root, "ex11-web-bluetooth/index.html"),
        ex12: path.resolve(root, "ex12-led-writeacked/index.html"),
        ex13: path.resolve(root, "ex13-wave-cmd/index.html"),
        ex14: path.resolve(root, "ex14-led-sliders/index.html"),
        ex15: path.resolve(root, "ex15-sfx-play/index.html"),
        ex16: path.resolve(root, "ex16-sfx-volume/index.html"),
        ex17: path.resolve(root, "ex17-sfx-params/index.html"),
        ex18: path.resolve(root, "ex18-mic-hello/index.html"),
        ex19: path.resolve(root, "ex19-mic-vu/index.html"),
        ex20: path.resolve(root, "ex20-mic-wave/index.html"),
      },
    },
  },
  fmt: {},
  lint: {
    plugins: ["typescript"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
