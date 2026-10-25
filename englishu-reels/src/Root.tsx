import { Composition, Folder } from "remotion";
import { demoScenes } from "./reels/demo/scenes";
import { demoSpec } from "./reels/demo/spec";
import { calculateReelMetadata, VoxReel } from "./vox/Reel";
import { REEL } from "./vox/theme";
import type { ReelProps } from "./vox/timeline";

const DemoReel: React.FC<ReelProps> = (props) => <VoxReel {...props} scenes={demoScenes} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
    </>
  );
};
