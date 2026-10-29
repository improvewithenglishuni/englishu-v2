/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

// Cloud sandbox: remotion.media (Remotion's browser download) is blocked by the network
// policy, but Playwright's Chrome Headless Shell is preinstalled. Use it when present;
// on any other computer this path doesn't exist and Remotion downloads its own browser.
const SANDBOX_HEADLESS_SHELL =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(SANDBOX_HEADLESS_SHELL)) {
  Config.setBrowserExecutable(SANDBOX_HEADLESS_SHELL);
  Config.setConcurrency("100%");
}

Config.setRspack(true);
// PNG frames: lossless text edges and a standard (TV-range) yuv420p output
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Instagram Reels export: H.264 + AAC, broad-compatibility pixel format, high quality
Config.setCodec("h264");
Config.setCrf(20);
Config.setPixelFormat("yuv420p");
Config.setAudioCodec("aac");
Config.setAudioBitrate("320k");
