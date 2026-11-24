import numpy as np, scipy.io.wavfile as w
from scipy.signal import butter,sosfilt
from scipy.ndimage import uniform_filter1d
sr=48000; N=int(56.0*sr); rng=np.random.default_rng(11)
tb=np.arange(N)/sr
def T(d): return np.arange(int(d*sr))/sr
def noise(d): return rng.standard_normal(int(d*sr)).astype(np.float32)
def bp(x,lo,hi,o=2): return sosfilt(butter(o,[lo,hi],'band',fs=sr,output='sos'),x)
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=sr,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=sr,output='sos'),x)
def put(buf,at,sig,g=1.0):
    i=int(at*sr)
    if i>=len(buf) or i<0: return
    sig=sig*g; j=min(len(buf),i+len(sig)); buf[i:j]+=sig[:j-i]
# ---------- instruments ----------
def pluck(f,dur=0.9,dec=5.0):
    t=T(dur); s=(np.sin(2*np.pi*f*t)+0.35*np.sin(4*np.pi*f*t)*np.exp(-t*9)+0.12*np.sin(6*np.pi*f*t)*np.exp(-t*14))
    return (s*np.exp(-t*dec)*np.minimum(1,t/0.004)).astype(np.float32)
def bass(f,dur=1.4):
    t=T(dur); return (np.sin(2*np.pi*f*t)*np.exp(-t*2.2)*np.minimum(1,t/0.01)).astype(np.float32)
def padn(f,dur):
    t=T(dur); s=sum(np.sin(2*np.pi*f*(1+d)*t+k) for k,d in enumerate([-0.004,0,0.004]))
    e=np.minimum(1,t/(0.35*dur))*np.minimum(1,(dur-t)/(0.4*dur)); return (s*e/3).astype(np.float32)
def hat(): return (hp(noise(0.05),6500)*np.exp(-T(0.05)*90)).astype(np.float32)
def kick():
    t=T(0.3); return (np.sin(2*np.pi*(50+70*np.exp(-t*30))*t)*np.exp(-t*12)).astype(np.float32)
def shaker(): return (bp(noise(0.09),4000,9000)*np.exp(-T(0.09)*45)).astype(np.float32)
CH={'Am':([110,220,261.6,329.6],[440,523.3,659.3,784]),'F':([87.3,174.6,220,261.6],[349.2,440,523.3,698.5]),
    'C':([130.8,261.6,329.6,392],[523.3,659.3,784,1046.5]),'G':([98,196,246.9,293.7],[392,493.9,587.3,784]),
    'Dm':([73.4,146.8,174.6,220],[293.7,349.2,440,587.3]),'Em':([82.4,164.8,196,246.9],[329.6,392,493.9,659.3])}
music=np.zeros(N,np.float32)
def section(t0,t1,bpm,prog,plucks,bassn,perc,amp=1.0,octave=0):
    beat=60/bpm; bar=4*beat; n=int(np.ceil((t1-t0)/bar)); buf=np.zeros(N,np.float32)
    for b in range(n):
        name=prog[b%len(prog)]; low,hi=CH[name]; bt=t0+b*bar
        put(buf,bt,padn(low[2],bar+0.4),0.16*amp)
        if bassn: put(buf,bt,bass(low[0]),0.5*amp); put(buf,bt+2*beat,bass(low[0]),0.32*amp)
        pat=[0,1.5,2,3,3.5][:plucks] if plucks<=5 else [0,0.5,1,1.5,2,2.5,3,3.5]
        for k,p in enumerate(pat):
            tone=hi[(k*2+b)%4]*(2 if octave else 1)
            put(buf,bt+p*beat,pluck(tone),(0.22 if k%2==0 else 0.15)*amp*rng.uniform(.8,1))
        if perc>=1:
            for k in range(8): put(buf,bt+k*beat/2,shaker(),(0.08 if k%2 else 0.12)*amp)
        if perc>=2:
            put(buf,bt,kick(),0.5*amp); put(buf,bt+2*beat,kick(),0.38*amp)
            for k in range(4): put(buf,bt+k*beat+beat/2,hat(),0.08*amp)
    m=(tb>=t0)&(tb<t1); out=np.zeros(N,np.float32); out[m]=buf[m]
    return out
# arrangement (starts after the hook question, as in the reference)
A=section(3.5,13.8,92,['Am','F','C','G'],3,True,0,0.9)          # curious, sparse
B=section(13.8,26.9,100,['C','G','Am','F'],5,True,1,1.0)         # history: Jenner / vaccination, light shaker
C=section(26.9,32.7,84,['Dm','Am'],2,False,0,0.9)               # eradicate: sparse, tense
D=section(32.7,41.9,116,['Am','F','C','G'],8,True,2,1.0)         # outbreak + chart: driving
E=section(41.9,46.4,92,['Dm','Am','F','G'],3,True,0,0.85)        # map / Somalia
F=section(46.4,49.9,100,['C','G','Am','F'],5,True,0,1.0,1)       # victory: warm, brighter
fadein=lambda t0,d:np.clip((tb-t0)/d,0,1)
def dip(x,c,w,depth=1.0): return x*(1-depth*np.exp(-((tb-c)/w)**2))
mus=(A+B+C+D+E+F)
# dropouts: transitions and dramatic pauses (silence/hole in the music)
env=np.ones(N,np.float32)
def hole(t0,t1,r=0.06):
    global env
    env*= 1-np.clip(np.minimum((tb-t0)/r,(t1-tb)/r),0,1)*((tb>=t0-r)&(tb<=t1+r))
hole(13.55,13.85)      # into Jenner
hole(26.75,27.05)      # into the English sentence
hole(30.05,30.75,0.05) # dust: music drops out, ERADICATE vanishes into silence
hole(32.45,32.9)       # switch to the driving track
hole(41.75,42.0)       # into the map
hole(45.95,46.5,0.05)  # hold before the stamp thud
mus*=env*fadein(3.4,0.6)
mus*=np.clip((52.4-tb)/1.0,0,1)*np.where(tb<49.9,1.0,np.clip(1-(tb-49.9)/2.4,0,1))  # hand over to the outro
mus=lp(mus,6000)
# ---------- SFX (sparse, tied to visuals) ----------
sfx=np.zeros(N,np.float32)
d=0.8;tt=T(d);e=np.minimum(1,tt/0.06)*np.minimum(1,(d-tt)/0.1)
put(sfx,1.28,bp(noise(d),1800,6500)*e*(0.6+0.4*np.sin(2*np.pi*9*tt)),0.55)           # marker circle
for a in [14.70,14.833,14.967,15.10]:                                                   # typewriter
    tt=T(0.05);put(sfx,a,bp(noise(0.05),1500,5000)*np.exp(-tt*140)+np.sin(2*np.pi*180*tt)*np.exp(-tt*90)*0.5,0.5)
tt=T(0.18);put(sfx,14.30,bp(noise(0.18),700,4000)*np.exp(-tt*38)+np.sin(2*np.pi*140*tt)*np.exp(-tt*30)*0.6,0.7)  # name plate
def shutter(at,g):
    for k,dl in enumerate([0,0.045]):
        tt=T(0.03);put(sfx,at+dl,bp(noise(0.03),1200,6000)*np.exp(-tt*160),g*(1 if k==0 else 0.7))
shutter(13.80,0.35); shutter(18.30,0.35)                                               # new photo appears
for k in range(11):                                                                     # stopwatch ticks under the 300M count
    tt=T(0.025);put(sfx,7.62+k*0.125,bp(noise(0.025),2500,7000)*np.exp(-tt*260),0.22)
tt=T(0.2);put(sfx,24.30,np.sin(2*np.pi*(320*np.exp(-tt*9)+120)*tt)*np.exp(-tt*22),0.7)  # VACCINATION pop
tt=T(0.7);put(sfx,24.95,sum(np.sin(2*np.pi*f*tt)*np.exp(-tt*(5+i)) for i,f in enumerate([2093,2637,3136,3951]))*0.12,0.6)
d=1.2;tt=T(d);cr=bp(noise(d),500,7000)*np.minimum(1,tt/0.05)*np.exp(-tt*2.6)
gr=np.zeros(int(d*sr),np.float32)
for _ in range(60):
    a=int(rng.random()**1.6*d*sr*0.85);g=bp(noise(0.02),2500,9000)*np.exp(-T(0.02)*180);gr[a:a+len(g)]+=g[:len(gr)-a]*rng.uniform(.3,1)
put(sfx,30.40,cr*0.5+gr*0.9,0.5)                                                       # ERADICATE dust
t0=32.7+3.4
for n in range(14):                                                                     # relay clicks, varied, as each person is vaccinated
    f=rng.uniform(900,1700);tt=T(0.04);put(sfx,t0+n*5/30+0.07,(np.sin(2*np.pi*f*tt)*np.exp(-tt*110)+bp(noise(0.04),2000,6000)*np.exp(-tt*150)*0.6),rng.uniform(.25,.4))
def shimmer(d):
    tt=T(d);e=np.sin(np.pi*np.minimum(1,tt/d))**2
    return (sum(np.sin(2*np.pi*f*tt+i)*0.2 for i,f in enumerate([523,659,784,1047]))*e)
put(sfx,36.97,shimmer(0.9),0.35); put(sfx,50.05,shimmer(1.3),0.4)
for at,r_ in [(43.65,1),(44.55,0)]:
    tt=T(0.7);put(sfx,at,bp(noise(0.7),500,3500)*np.sin(np.pi*tt/0.7)**2,0.35 if r_ else 0.3)  # two soft whooshes
tt=T(0.5);put(sfx,46.40,np.sin(2*np.pi*(95*np.exp(-tt*5)+45)*tt)*np.exp(-tt*9)+bp(noise(0.5),300,2500)*np.exp(-tt*35)*0.5,0.9)  # stamp
sfx=lp(sfx,12000); sfx*=0.22/(np.abs(sfx).max()+1e-9)
# ---------- outro ----------
def tone(f,t0,dur,amp,dec=2.2):
    t=T(dur);s=(np.sin(2*np.pi*f*t)+0.25*np.sin(4*np.pi*f*t)*np.exp(-t*3))*np.exp(-t*dec)*np.minimum(1,t/0.02)*amp
    o=np.zeros(N,np.float32);i=int(t0*sr);o[i:i+len(s)]=s[:N-i];return o
out=np.zeros(N,np.float32)
for f,t0 in [(440,51.3),(554.4,51.65),(659.3,52.0),(880,52.35),(1108.7,52.7)]: out+=tone(f,t0,2.0,0.055)
ch=np.zeros(N,np.float32)
for f,a in [(110,.5),(220,.4),(277.2,.28),(329.6,.28),(440,.22),(554.4,.14),(659.3,.1)]: ch+=np.sin(2*np.pi*f*tb)*a
a0,pk=51.6,53.2
oenv=np.where(tb<a0,0,np.where(tb<pk,((tb-a0)/(pk-a0))**2,np.exp(-(tb-pk)*1.1)))*np.clip((55.95-tb)/0.9,0,1)
ch=lp(ch*oenv,1800)*0.05
spk=sum(tone(f,53.2+0.05*i,1.6,0.05,3.0) for i,f in enumerate([1760,2217,2637]))
# ---------- mix ----------
sr_,v=w.read('/home/claude/vo/vo_final3.wav'); v=v.astype(np.float32)/32768
vo=np.zeros(N,np.float32); vo[:len(v)]=v
rms=lambda x:np.sqrt(np.mean(x[np.abs(x)>1e-4]**2))
mus*=0.05/rms(mus)
ve=uniform_filter1d(np.abs(vo),int(0.05*sr)); duck=1-0.62*np.clip(ve/0.07,0,1); duck=uniform_filter1d(duck,int(0.25*sr))
mix=vo+sfx+mus*duck+out+ch+spk
mix/=max(1,np.abs(mix).max()/0.95)
w.write('/home/claude/vo/mix5.wav',sr,(mix*32767).astype(np.int16))
print('music rms',rms(mus),'voice rms',rms(vo))
