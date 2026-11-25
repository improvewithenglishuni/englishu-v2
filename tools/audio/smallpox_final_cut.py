"""Final export: beat-aligned gap cuts + x1.11 + shortened tail. Usage: python3 tools/audio/smallpox_final_cut.py <audio.wav> <tail_trim_seconds_unsped> <out.mp4>  (needs out/base.mp4)"""
import sys, numpy as np, scipy.io.wavfile as w, subprocess
wav, trim, outp = sys.argv[1], float(sys.argv[2]), sys.argv[3]
sr,x=w.read(wav); x=x.astype(np.float32)/32768
SPD=1.1655  # 1.11 x 1.05
L=60/(240/2.3625)/2
cuts=[3.12,7.30,10.82,22.68,26.70,32.32,34.74,41.59,52.20]
n=int(0.012*sr); Ls=int(round(L*sr))
fo=np.linspace(1,0,n)[:,None] if x.ndim>1 else np.linspace(1,0,n); fi=1-fo
PRECUT = len(sys.argv) > 4 and sys.argv[4] == 'precut'   # audio already cut before ducking (smooth music)
if PRECUT: y=x
else:
    out=[];prev=0
    for c in cuts:
        i=int(round(c*sr)); out.append(x[prev:i]); out.append(x[i:i+n]*fo+x[i+Ls:i+Ls+n]*fi); prev=i+Ls+n
    out.append(x[prev:]); y=np.concatenate(out)
keep=59.6-len(cuts)*L-trim
y=y[:int(keep*sr)]
fl=int(0.7*sr); env=np.ones(len(y),np.float32); env[-fl:]=np.linspace(1,0,fl)**1.5
y=y*(env[:,None] if y.ndim>1 else env)
w.write('out/cut.wav',sr,(y*32767).astype(np.int16))
segs=[];p=0
for c in cuts: segs.append((p,c)); p=c+L
segs.append((p,keep+len(cuts)*L))
v=[f"[0:v]trim=start={a:.5f}:end={b:.5f},setpts=PTS-STARTPTS[v{i}]" for i,(a,b) in enumerate(segs)]
fc=";".join(v)+";"+"".join(f"[v{i}]" for i in range(len(segs)))+f"concat=n={len(segs)}:v=1:a=0,setpts=PTS/{SPD}[v];[1:a]atempo={SPD}[a]"
subprocess.run(["ffmpeg","-v","error","-y","-i","out/base.mp4","-i","out/cut.wav","-filter_complex",fc,"-map","[v]","-map","[a]","-r","30","-c:v","libx264","-preset","veryfast","-crf","16","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k",outp],check=True)
