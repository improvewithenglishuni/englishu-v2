import sys, numpy as np, mido, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
out, tmp = sys.argv[1], sys.argv[2]
rng=np.random.default_rng(17)
TPB=480; BPM=80; T=TPB//3          # triplet 8th
def N(s):
    n={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}; return 12*(int(s[-1])+1)+n[s[0]]+s.count('#')
_=None
# (left hand held notes, right-hand triplet line) - same composition as v1
prog=[(['D2','A3','D4'],['D5','F#4',_,'F#5','A4',_,'D5','F#4','D4','F#5','D4','F#4']),
      (['D2','A3','D4'],[_,'A4','D4','F#5','A4','G4','D5','F#4','D4','E5','D4','A4']),
      (['E2','B3','E4'],['E5','G4',_,'G5','B4',_,'D5','G4','E4','G5','E4','B4']),
      (['A2','E3','E4'],['C#5','A4',_,'E5','A4','G4','C#5','A4','E4','A5','E4','C#5']),
      (['D2','A3','D4'],['D5','F#4','A4','F#5',_,_,_,_,_,_,_,_])]
ev=[]  # (tick, msg)
start=60
for c,(lh,line) in enumerate(prog):
    st=start+c*12*T; last=c==len(prog)-1
    ev+= [(st-20,mido.Message('control_change',control=64,value=0)),(st-5,mido.Message('control_change',control=64,value=100))]
    hold=int(12*T*(1.5 if last else 1))-30
    for k,nm in enumerate(lh):                 # soft rolled left hand
        t=st+k*25; v=int(rng.integers(16,20)) if k==0 else int(rng.integers(34,40))
        ev+=[(t,mido.Message('note_on',note=N(nm),velocity=v)),(t+hold,mido.Message('note_off',note=N(nm)))]
    for i,nm in enumerate(line):
        if nm is None: continue
        t=st+i*T+int(rng.normal(0,6)); t=max(t,0)
        v=int((52 if i%3==0 else 42)*rng.uniform(0.88,1.08))
        dur=int((2.4 if last else 0.9)*TPB)
        ev+=[(t,mido.Message('note_on',note=N(nm),velocity=v)),(t+dur,mido.Message('note_off',note=N(nm)))]
    if c in (0,2):                              # high sparkle note, very soft
        nm='A6' if c==0 else 'B6'; t=st+6*T
        ev+=[(t,mido.Message('note_on',note=N(nm),velocity=28)),(t+TPB,mido.Message('note_off',note=N(nm)))]
endt=start+len(prog)*12*T+int(1.5*12*T)
ev.append((endt,mido.Message('control_change',control=64,value=0)))
ev.sort(key=lambda e:(e[0], e[1].type!='note_off'))
mf=mido.MidiFile(ticks_per_beat=TPB); tr=mido.MidiTrack(); mf.tracks.append(tr)
tr.append(mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(BPM)))
tr.append(mido.Message('program_change',program=0))
tr.append(mido.Message('control_change',control=91,value=0)); tr.append(mido.Message('control_change',control=93,value=0))
prev=0
for t,m in ev: tr.append(m.copy(time=t-prev)); prev=t
mf.save(tmp+'.mid')
subprocess.run(['fluidsynth','-ni','-q','-g','0.8','-r','48000','-R','0','-C','0','-F',tmp+'.wav','/usr/share/sounds/sf2/FluidR3_GM.sf2',tmp+'.mid'],check=True,capture_output=True)
SR,x=wavfile.read(tmp+'.wav'); x=x.astype(float)/32768
# warmth: tame highs (felt/soft-pedal feel), gentle low-mid lift, remove rumble
def shelf(x,f,g,kind):
    sos=butter(2,f,kind,fs=SR,output='sos'); return x+(10**(g/20)-1)*sosfilt(sos,x,axis=0)
x=sosfilt(butter(2,2400,'low',fs=SR,output='sos'),x,axis=0)*0.8+x*0.2   # roll off top
x=shelf(x,350,1.5,'low')
x=sosfilt(butter(2,45,'high',fs=SR,output='sos'),x,axis=0)
# small warm room reverb
n=int(1.8*SR); t=np.arange(n)/SR
irs=[sosfilt(butter(2,3500,'low',fs=SR,output='sos'),rng.normal(0,1,n)*np.exp(-t/0.38)) for _ in range(2)]
for ch in range(2):
    irs[ch][:int((0.018+0.004*ch)*SR)]=0
    w=fftconvolve(x[:,ch],irs[ch])[:len(x)]; x[:,ch]+=0.18*w*np.abs(x[:,ch]).max()/np.abs(w).max()
# trim, fade, normalize
nz=np.where(np.abs(x).max(1)>1e-4)[0]; x=x[max(nz[0]-int(0.05*SR),0):min(nz[-1],nz[0]+int(17.5*SR))]
f=int(1.2*SR); x[-f:]*=np.linspace(1,0,f)[:,None]
x*=10**(-1/20)/np.abs(x).max()
wavfile.write(out,SR,(x*32767).astype(np.int16)); print('len',round(len(x)/SR,2))
