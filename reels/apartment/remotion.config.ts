import {Config} from '@remotion/cli/config';
import fs from 'fs';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setConcurrency(2);
Config.setEntryPoint('src/index.ts');
// Shared repo-level public folder: brand end card, sound library (sfx), photos.
Config.setPublicDir('../../public');

// In the cloud container Remotion cannot download its own headless shell; use the pre-installed one.
const preinstalled =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(preinstalled)) {
  Config.setBrowserExecutable(preinstalled);
}
