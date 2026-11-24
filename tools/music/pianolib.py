import numpy as np, mido, subprocess
from scipy.io import wavfile
from scipy.signal import butter, sosfilt, fftconvolve
SF='/usr/share/sounds/sf2/FluidR3_GM.sf2'
def N(s):
    n={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}; return 12*(int(s[-1])+1)+n[s[0]]+s.count('#')-s[1:].count('b')
class Song:
    def __init__(s,seed): s.ev=[]; s.ped=[]; s.rng=np.random.default_rng(seed); s.extra=[]
    def note(s,t,nm,vel,dur,jit=0.006):
        t=max(0,t+s.rng.normal(0,jit)); v=int(np.clip(vel*s.rng.uniform(0.9,1.07),1,127))
        s.ev.append((t,nm if isinstance(nm,int) else N(nm),v,dur))
    def pedal(s,t,on): s.ped.append((t,on))
def render(song,out,tmp,lp=2400,lpmix=0.8,low_shelf=1.5,verb=0.18,maxlen=None,noise_hits=None):
    TPB=480; TPS=TPB*2   # 120 BPM -> 960 ticks/s
    msgs=[]
    for t,n,v,d in song.ev:
        msgs+=[(int(t*TPS),1,mido.Message('note_on',note=n,velocity=v)),(int((t+d)*TPS),0,mido.Message('note_off',note=n))]
    for t,on in song.ped: msgs.append((int(t*TPS),0 if not on else 2,mido.Message('control_change',control=64,value=100 if on else 0)))
    msgs.sort(key=lambda m:(m[0],m[1]))
    mf=mido.MidiFile(ticks_per_beat=TPB); tr=mido.MidiTrack(); mf.tracks.append(tr)
    tr.append(mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(120)))
    tr+= [mido.Message('program_change',program=0),mido.Message('control_change',control=91,value=0),mido.Message('control_change',control=93,value=0)]
    prev=0
    for t,_,m in msgs: tr.append(m.copy(time=t-prev)); prev=t
    mf.save(tmp+'.mid')
    subprocess.run(['fluidsynth','-ni','-q','-g','0.8','-r','48000','-R','0','-C','0','-F',tmp+'.wav',SF,tmp+'.mid'],check=True,capture_output=True)
    SR,x=wavfile.read(tmp+'.wav'); x=x.astype(float)/32768
    rng=song.rng
    if noise_hits:   # soft shaker ticks: list of (time, vel)
        for t,v in noise_hits:
            n=int(0.12*SR); tt=np.arange(n)/SR
            h=sosfilt(butter(2,[5000,12000],'band',fs=SR,output='sos'),rng.normal(0,1,n))*np.minimum(1,tt/0.008)*np.exp(-tt/0.03)*v*0.05
            i=int(t*SR)
            if i+n<len(x): x[i:i+n,0]+=h*0.9; x[i:i+n,1]+=h*1.1
    x=sosfilt(butter(2,lp,'low',fs=SR,output='sos'),x,axis=0)*lpmix+x*(1-lpmix)
    x=x+(10**(low_shelf/20)-1)*sosfilt(butter(2,350,'low',fs=SR,output='sos'),x,axis=0)
    x=sosfilt(butter(2,45,'high',fs=SR,output='sos'),x,axis=0)
    n=int(1.8*SR); t=np.arange(n)/SR
    for ch in range(2):
        ir=sosfilt(butter(2,3500,'low',fs=SR,output='sos'),rng.normal(0,1,n)*np.exp(-t/0.38)); ir[:int((0.018+0.004*ch)*SR)]=0
        w=fftconvolve(x[:,ch],ir)[:len(x)]; x[:,ch]+=verb*w*np.abs(x[:,ch]).max()/np.abs(w).max()
    nz=np.where(np.abs(x).max(1)>1e-4)[0]; a=max(nz[0]-int(0.05*SR),0); b=nz[-1]
    if maxlen: b=min(b,a+int(maxlen*SR))
    x=x[a:b]; f=int(1.2*SR); x[-f:]*=np.linspace(1,0,f)[:,None]
    x*=10**(-1/20)/np.abs(x).max()
    wavfile.write(out,SR,(x*32767).astype(np.int16)); return len(x)/SR
