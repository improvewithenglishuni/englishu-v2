import { Composition, Folder } from "remotion";
import { demoScenes } from "./reels/demo/scenes";
import { demoSpec } from "./reels/demo/spec";
import { smallpoxScenes } from "./reels/smallpox/scenes";
import { smallpoxSpec } from "./reels/smallpox/spec";
import { RenderTest } from "./tests/RenderTest";
import { calculateReelMetadata, VoxReel } from "./vox/Reel";
import { REEL } from "./vox/theme";
import type { ReelProps } from "./vox/timeline";

const DemoReel: React.FC<ReelProps> = (props) => <VoxReel {...props} scenes={demoScenes} />;
const SmallpoxReel: React.FC<ReelProps> = (props) => <VoxReel {...props} scenes={smallpoxScenes} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reels">
        <Composition
          id="SmallpoxReel"
          component={SmallpoxReel}
          durationInFrames={REEL.fps * 15}
          fps={REEL.fps}
          width={REEL.width}
          height={REEL.height}
          defaultProps={{ spec: smallpoxSpec, showSafeZones: false } satisfies ReelProps}
          calculateMetadata={calculateReelMetadata}
        />
      </Folder>
      <Folder name="Kit">
        <Composition
          id="VoxKitDemo"
          component={DemoReel}
          durationInFrames={REEL.fps * 12}
          fps={REEL.fps}
          width={REEL.width}
          height={REEL.height}
          defaultProps={{ spec: demoSpec, showSafeZones: false } satisfies ReelProps}
          calculateMetadata={calculateReelMetadata}
        />
      </Folder>
      <Folder name="Tests">
        <Composition
          id="RenderTest"
          component={RenderTest}
          durationInFrames={REEL.fps * 3}
          fps={REEL.fps}
          width={REEL.width}
          height={REEL.height}
        />
      </Folder>
    </>
  );
};
