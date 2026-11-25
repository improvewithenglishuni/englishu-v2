# Builds the end card sound: paper crumple, marker swoops, pen scribble (timed from activity.npy), mouse click.
import numpy as np, wave
SR=48000; FPS=30; T=4.2; N=int(SR*T)
fr=lambda f:int(f/FPS*SR)
def band(x,lo,hi):
    X=np.fft.rfft(x); f=np.fft.rfftfreq(len(x),1/SR); X[(f<lo)|(f>hi)]=0; return np.fft.irfft(X,len(x))
def norm(x): return x/(np.abs(x).max()+1e-9)
def fade(n,a=.01,b=.03):
    t=np.arange(n)/SR; d=n/SR; return np.clip(t/a,0,1)*np.clip((d-t)/b,0,1)
def crumple(out):
    rs=np.random.default_rng(11); n=fr(17); cr=np.zeros(n)
    for k in range(480):
        i=int(min(n-500,abs(rs.normal(0,.2))*SR)); L=rs.integers(30,380)
        cr[i:i+L]+=rs.normal(0,1,L)*np.exp(-np.arange(L)/rs.uniform(10,80))*rs.uniform(.15,1)
    out[:n]+=norm(band(cr,700,11000))*fade(n,.005,.12)*.5

# drawing moments (frames): button sketch, cursor sketch, arrow body, arrow head, doodles
SEG=[(22,35,.9),(34,40,.8),(48,58,1),(58,62,.8),(58,111,.85)]

def crumple(out):
    # paper (not plastic): soft, low, rustling crunches in clusters, little high-end sparkle
    rs=np.random.default_rng(5); n=fr(17); t=np.arange(n)/SR; x=np.zeros(n)
    centres=np.sort(np.concatenate([rs.uniform(0,.22,10),rs.uniform(.22,.5,6)]))
    for c in centres:                                   # each crunch = a cluster of soft folds
        for k in range(rs.integers(6,16)):
            i=int((c+abs(rs.normal(0,.018)))*SR); L=int(rs.uniform(.008,.06)*SR)
            if i+L>=n: continue
            e=np.exp(-np.arange(L)/(L*rs.uniform(.15,.4)))*np.clip(np.arange(L)/(SR*.0015),0,1)
            x[i:i+L]+=rs.normal(0,1,L)*e*rs.uniform(.3,1)*(1.0 if c<.22 else .55)
    crunch=band(x,250,5200)
    rustle=band(rs.normal(0,1,n),200,2200)*(.6+.4*np.abs(np.sin(2*np.pi*2.2*t)))*np.exp(-t/.4)
    body=band(rs.normal(0,1,n),80,300)*np.exp(-((t-.12)/.1)**2)
    cr2=np.zeros(n)
    for k in range(90):
        i=int(abs(rs.normal(0,.17))*SR); L=rs.integers(40,200)
        if i+L<n: cr2[i:i+L]+=rs.normal(0,1,L)*np.exp(-np.arange(L)/rs.uniform(15,50))
    y=norm(crunch)+norm(rustle)*.24+norm(body)*.14+norm(band(cr2,2200,6500))*.12
    out[:n]+=norm(y)*fade(n,.008,.16)*.5
act=np.load('activity.npy').astype(float)
act[:48]=0  # ignore the faint pencil sketch of the button; sound only for the visible pen drawings
g=np.where(act>8,np.clip(np.log1p(act)/np.log1p(220),.45,1),0.0)
# a frame is "drawing" only while lines are visibly being added on screen
t=np.arange(N)/SR; fpos=t*FPS
env=np.interp(fpos,np.arange(len(g))+.5,g,left=0,right=0)   # value held across each frame
env=np.where(np.floor(fpos).astype(int)<len(g),g[np.minimum(np.floor(fpos).astype(int),len(g)-1)],0)
k=int(.02*SR); env=np.convolve(env,np.ones(k)/k,'full')[:N]  # causal: never starts before the line appears
r=np.random.default_rng(7)
x=norm(band(r.normal(0,1,N),1500,7000))
ph=np.cumsum(9*(1+.3*np.sin(2*np.pi*.8*t))/SR)
stroke=.15+.85*np.abs(np.sin(np.pi*ph))**1.4
out=np.zeros(N); crumple(out)
out+=x*stroke*env*.21
# mouse click when the cursor presses Follow (frame 62) and a softer release (frame 65)
def click(f,seed,g,L):
    rr=np.random.default_rng(seed); n=int(SR*.04); tt=np.arange(n)/SR
    c=band(rr.normal(0,1,n),1800,12000)*np.exp(-tt/L)+np.sin(2*np.pi*2300*tt)*np.exp(-tt/(L*.9))*.5
    i=int(f/FPS*SR); out[i:i+n]+=norm(c)*g
# marker swoops: one smooth felt-tip swipe per highlight, exactly while each yellow bar sweeps
def swoop(f0,f1,seed,g):
    rr=np.random.default_rng(seed); n=int((f1-f0)/FPS*SR); x=rr.normal(0,1,n+2048); y=np.zeros(n+2048)
    B=1024; H=512; w=np.hanning(B)
    for s0 in range(0,n,H):
        p=s0/n; c=1150+2300*p**.8; bw=c*.7
        seg=np.fft.rfft(x[s0:s0+B]*w); fq=np.fft.rfftfreq(B,1/SR)
        seg*=np.exp(-((fq-c)/bw)**2)
        y[s0:s0+B]+=np.fft.irfft(seg,B)
    y=y[:n]; tt=np.arange(n)/SR; d=n/SR
    env=np.sin(np.pi*np.clip(tt/d,0,1))**.7*(1+.12*np.sin(2*np.pi*5*tt))
    sq=np.sin(2*np.pi*np.cumsum(1500+900*(tt/d))/SR)*.04
    i=int(f0/FPS*SR); out[i:i+n]+=(norm(y)+sq)*env*g
swoop(31,40.5,11,.19); swoop(38,47.5,12,.19)
click(84,1,.6,.003); click(87,2,.35,.002)
out=out/max(1,np.abs(out).max()/.9)
with wave.open('sound.wav','wb') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out*32767).astype(np.int16).tobytes())
first=np.argmax(env>1e-3)/SR; print('drawing sound starts at %.3fs (frame %.1f)'%(first,first*FPS))
