import numpy as np, scipy.io.wavfile as w
from scipy.signal import butter,sosfilt
from scipy.ndimage import uniform_filter1d
sr=48000; N=int(64.0*sr); rng=np.random.default_rng(11)
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
# ---------- continuous score: one tempo, one key, one bar grid, layers glide in and out ----------
from scipy.signal import fftconvolve
BPM=240/2.3625; BEAT=60/BPM; BAR=4*BEAT; G0=30.87-10*BAR          # bar 10 lands exactly on the dust moment (30.4 s); bar 16 on the stamp (46.4 s)
def bar_t(n): return G0+n*BAR
PAD={'Am':[110,164.8,220,261.6,329.6],'F':[87.3,130.8,174.6,220,261.6],'Dm':[73.4,110,146.8,174.6,220],
     'E':[82.4,123.5,164.8,207.7,246.9],'C':[65.4,130.8,196,261.6,329.6]}
ARP={'Am':[220,261.6,329.6,440],'F':[174.6,220,261.6,349.2],'Dm':[293.7,349.2,440,587.3],
     'E':[329.6,415.3,493.9,659.3],'C':[261.6,329.6,392,523.3]}
ROOT={'Am':55,'F':43.65,'Dm':73.4/2*1.0,'E':41.2,'C':65.4}
PROGD={-2:'Am',-1:'Am',0:'F',1:'Am',2:'E',3:'Am',4:'F',5:'Dm',6:'E',7:'Am',8:'Dm',9:'E',10:'Am',11:'F',12:'Dm',13:'E',14:'Am',15:'F',16:'Dm',17:'E',18:'F',19:'C',20:'E',21:'E'}
OLD=[0,3.4,15.0,19.5,24.2,28.4,32.25,34.3,41.0,44.0,52.7,55.6,59.9,70]
NEW=[0,3.4,14.10,18.5,22.96,27.01,30.87,32.72,38.9,41.74,49.77,52.57,56.89,67]
def W(t): return float(np.interp(t,OLD,NEW))
def curve(pts):
    tt=[W(p[0]) for p in pts]; vv=[p[1] for p in pts]
    c=np.interp(tb,tt,vv).astype(np.float32); return uniform_filter1d(c,int(0.6*sr))
def at(c,t): return float(c[min(N-1,max(0,int(t*sr)))])
c_pad=curve([(3.4,0),(6,.55),(30,.6),(31.5,.45),(32.25,.7),(35,.6),(52,.6),(52.7,.8),(57,.7),(59.5,.6),(62.0,0),(70,0)])
c_arp=curve([(3.6,0),(5,.5),(14.7,.55),(15.5,.8),(28.5,.7),(30,.35),(31.2,0),(33.5,0),(34.3,.4),(35.2,.8),(44,.7),(45.5,.45),(50,.35),(52.3,0),(53.0,.55),(57.5,.55),(58.7,0),(70,0)])
c_dens=curve([(0,0),(10,0),(12,1),(29.5,1),(30.5,0),(34,0),(35,1),(49,1),(50,0),(53.2,0),(54,1),(70,1)])
c_bass=curve([(0,0),(14.5,0),(15.3,.55),(30,.55),(31.6,.2),(32.1,.2),(33,.6),(52,.6),(52.7,.8),(58,.6),(60,0),(70,0)])
c_kick=curve([(0,0),(14.8,0),(15.6,.25),(29,.25),(30,.1),(31,0),(34.3,0),(35,.5),(43.6,.5),(44.6,.25),(52.3,.28),(52.6,0),(70,0)])
c_hat=curve([(0,0),(34.3,0),(35,.3),(43.6,.3),(44.6,.12),(49.5,.18),(52.3,.38),(52.6,0),(70,0)])
def tonebuf(f,dur,kind):
    t=T(dur)
    if kind=='pluck': s=np.sin(2*np.pi*f*t)+0.3*np.sin(4*np.pi*f*t)*np.exp(-t*8)+0.1*np.sin(6*np.pi*f*t)*np.exp(-t*14); return (s*np.exp(-t*4.5)*np.minimum(1,t/0.006)).astype(np.float32)
    if kind=='bass': return (np.sin(2*np.pi*f*t)*np.exp(-t*1.6)*np.minimum(1,t/0.015)).astype(np.float32)
pluck_l=np.zeros(N,np.float32); pad_l=np.zeros(N,np.float32); bass_l=np.zeros(N,np.float32); perc_l=np.zeros(N,np.float32)
NS=range(-2,22)
for n in NS:
    ch=PROGD[n]; t0=bar_t(n)
    # pad: each chord lives from half a second before its bar to half a second after, raised-cosine overlap
    pd=BAR+1.2; tt=T(pd); win=np.sin(np.pi*np.clip(tt/pd,0,1))**2
    s=sum(np.sin(2*np.pi*f*tt+k)*(0.9**k) for k,f in enumerate(PAD[ch]))*win/3
    put(pad_l,t0-0.6,s.astype(np.float32),1.0)
for n in NS:
    ch=PROGD[n]; t0=bar_t(n)
    for k,idx in enumerate([0,1,2,3,2,1,2,1]):
        t=t0+k*BEAT/2
        if k%2==1 and at(c_dens,t)<0.5: continue
        g=at(c_arp,t)*(1.0 if k%2==0 else 0.7)*(1.2 if k==0 else 1)
        if at(c_arp,t)<0.03: continue
        f=ARP[ch][idx]*(2 if (t>50.5 and t<55.2) else 1)
        put(pluck_l,t,tonebuf(f,0.9,'pluck'),g*0.5)
    for k in (0,2):
        t=t0+k*BEAT; g=at(c_bass,t)*(1 if k==0 else 0.6)
        if g>0.03: put(bass_l,t,tonebuf(ROOT[ch]*2 if ROOT[ch]<50 else ROOT[ch],1.5,'bass'),g*0.7)
    for k in range(4):
        t=t0+k*BEAT
        gk=at(c_kick,t)*(1 if k in (0,2) else (0.0 if at(c_kick,t)<0.4 else 0.6))
        if gk>0.03:
            kt=T(0.3); put(perc_l,t,(np.sin(2*np.pi*(48+60*np.exp(-kt*30))*kt)*np.exp(-kt*13)).astype(np.float32),gk*0.9)
    for k in range(8):
        t=t0+k*BEAT/2; gh=at(c_hat,t)*(0.7 if k%2 else 1.0)
        if gh>0.03: put(perc_l,t,(hp(noise(0.05),6500)*np.exp(-T(0.05)*90)).astype(np.float32),gh*0.18)
    if t0>=45.0 and t0<49.77:  # extra 16ths building toward the stamp
        for k in range(16):
            t=t0+k*BEAT/4
            if t>47.07 and t<49.77: put(perc_l,t,(hp(noise(0.03),7000)*np.exp(-T(0.03)*120)).astype(np.float32),0.05+0.07*(t-47.07)/2.7)
# risers: tension that builds, then releases
def riser(t0,t1,top=2400):
    d=t1-t0; tt=T(d); p=(tt/d)
    n=noise(d); sweep=np.zeros(len(tt),np.float32)
    for a,b in [(0,0.25),(0.25,0.5),(0.5,0.75),(0.75,1.0)]:
        i0,i1=int(a*len(tt)),int(b*len(tt)); fc=300+(top-300)*((a+b)/2)**2
        sweep[i0:i1]=bp(n[i0:i1],fc*0.6,min(fc*1.6,9000),2)
    glide=np.sin(2*np.pi*np.cumsum(180+900*p**2)/sr)*0.25
    env=(p**2)*np.minimum(1,(d-tt)/0.02)
    return ((sweep*0.9+glide)*env).astype(np.float32)
rise_l=np.zeros(N,np.float32)
put(rise_l,28.72,riser(28.72,30.87),0.9)
def boom(at_,dur=1.8):
    t=T(dur); b=np.sin(2*np.pi*(38+30*np.exp(-t*6))*t)*np.exp(-t*2.2)+bp(noise(dur),80,500)*np.exp(-t*6)*0.4
    put(rise_l,at_,b.astype(np.float32),0.9)
boom(30.87)                                                    # the word disintegrates; the pad opens up after it
# gently blend with a short synthetic room (no hard digital edge)
ir=(noise(1.1)*np.exp(-T(1.1)*3.6)); ir[:int(0.012*sr)]=0
def wet(x,mix=0.28): 
    y=fftconvolve(x,ir/np.abs(ir).sum()*4.0)[:len(x)]; return x*(1-mix)+y*mix
pad_l*=c_pad; bass_l*=1.0
mus=wet(pad_l*0.9+pluck_l*1.0)+bass_l*0.7+perc_l*0.8+rise_l*0.6
mus=lp(mus,5500)

mus*=fadein(3.3,0.9) if False else np.clip((tb-3.2)/1.0,0,1)
mus*=np.where(tb<54.5,1.0,np.clip(1-(tb-54.5)/2.4,0,1))*np.clip((56.89-tb)/0.8,0,1)

# ---------- SFX (sparse, tied to visuals) ----------
sfx=np.zeros(N,np.float32)
d=0.9;tt=T(d);p=tt/d
th=2*np.pi*1.283*p                              # angle travelled round the oval (counterclockwise)
speedv=0.75+0.25*np.abs(np.cos(th))                  # a marker moves fastest on the sides of the loop, slower at the turns
fc=2600+1500*np.sin(th)                              # brightness follows the direction of travel
rub=np.zeros(len(tt),np.float32); n_=noise(d); blk=480
for i in range(0,len(tt),blk):
    c=float(fc[i:i+blk].mean()); rub[i:i+blk]=bp(n_[i:i+blk],max(900,c*0.55),min(9000,c*1.5),2)
over=np.where(p>0.78,1.35,1.0)                      # second pass over the start of the loop: darker, louder
env=np.minimum(1,tt/0.03)*np.minimum(1,(d-tt)/0.07)*speedv*over
tap=np.sin(2*np.pi*170*T(0.04))*np.exp(-T(0.04)*120)           # pen touches the paper
put(sfx,1.28,rub*env,0.55); put(sfx,1.28,tap,0.5)
lift=bp(noise(0.06),2500,7000)*np.exp(-T(0.06)*60); put(sfx,1.28+d-0.02,lift,0.25)   # pen lifts off
for a in [15.00,15.133,15.267,15.40]:                                                   # typewriter
    tt=T(0.05);put(sfx,a,bp(noise(0.05),1500,5000)*np.exp(-tt*140)+np.sin(2*np.pi*180*tt)*np.exp(-tt*90)*0.5,0.5)
tt=T(0.18);put(sfx,14.60,bp(noise(0.18),700,4000)*np.exp(-tt*38)+np.sin(2*np.pi*140*tt)*np.exp(-tt*30)*0.6,0.7)  # name plate
def shutter(at,g):
    for k,dl in enumerate([0,0.045]):
        tt=T(0.03);put(sfx,at+dl,bp(noise(0.03),1200,6000)*np.exp(-tt*160),g*(1 if k==0 else 0.7))
shutter(14.10,0.35); shutter(18.50,0.35)                                               # new photo appears
for k in range(11):                                                                     # stopwatch ticks under the 300M count
    tt=T(0.025);put(sfx,7.69+k*0.125,bp(noise(0.025),2500,7000)*np.exp(-tt*260),0.22)
tt=T(0.2);put(sfx,24.56,np.sin(2*np.pi*(320*np.exp(-tt*9)+120)*tt)*np.exp(-tt*22),0.7)  # VACCINATION pop
tt=T(0.7);put(sfx,25.21,sum(np.sin(2*np.pi*f*tt)*np.exp(-tt*(5+i)) for i,f in enumerate([2093,2637,3136,3951]))*0.12,0.6)
d=1.2;tt=T(d);cr=bp(noise(d),500,7000)*np.minimum(1,tt/0.05)*np.exp(-tt*2.6)
gr=np.zeros(int(d*sr),np.float32)
for _ in range(60):
    a=int(rng.random()**1.6*d*sr*0.85);g=bp(noise(0.02),2500,9000)*np.exp(-T(0.02)*180);gr[a:a+len(g)]+=g[:len(gr)-a]*rng.uniform(.3,1)
put(sfx,30.87,cr*0.5+gr*0.9,0.5)                                                       # ERADICATE dust
t0=36.59
for n in range(14):                                                                     # relay clicks, varied, as each person is vaccinated
    f=rng.uniform(900,1700);tt=T(0.04);put(sfx,t0+n*5/30+0.07,(np.sin(2*np.pi*f*tt)*np.exp(-tt*110)+bp(noise(0.04),2000,6000)*np.exp(-tt*150)*0.6),rng.uniform(.25,.4))
def shimmer(d):
    tt=T(d);e=np.sin(np.pi*np.minimum(1,tt/d))**2
    return (sum(np.sin(2*np.pi*f*tt+i)*0.2 for i,f in enumerate([523,659,784,1047]))*e)
put(sfx,37.46,shimmer(0.9),0.35); put(sfx,52.72,shimmer(1.3),0.4)
for at,r_ in [(46.83,1),(47.93,0)]:
    tt=T(0.7);put(sfx,at,bp(noise(0.7),500,3500)*np.sin(np.pi*tt/0.7)**2,0.35 if r_ else 0.3)  # two soft whooshes
tt=T(0.5);put(sfx,49.77,np.sin(2*np.pi*(95*np.exp(-tt*5)+45)*tt)*np.exp(-tt*9)+bp(noise(0.5),300,2500)*np.exp(-tt*35)*0.5,0.9)  # stamp
sfx=lp(sfx,12000); sfx*=0.22/(np.abs(sfx).max()+1e-9)
# ---------- outro ----------
def tone(f,t0,dur,amp,dec=2.2):
    t=T(dur);s=(np.sin(2*np.pi*f*t)+0.25*np.sin(4*np.pi*f*t)*np.exp(-t*3))*np.exp(-t*dec)*np.minimum(1,t/0.02)*amp
    o=np.zeros(N,np.float32);i=int(t0*sr);o[i:i+len(s)]=s[:N-i];return o
out=np.zeros(N,np.float32)
for f,t0 in [(330,54.57),(415.3,54.92),(493.9,55.27),(659.3,55.62),(880,55.97)]: out+=tone(f,t0,2.0,0.055)
ch=np.zeros(N,np.float32)
for f,a in [(110,.5),(220,.4),(277.2,.28),(329.6,.28),(440,.22),(554.4,.14),(659.3,.1)]: ch+=np.sin(2*np.pi*f*tb)*a
a0,pk=55.0,56.89
oenv=np.where(tb<a0,0,np.where(tb<pk,((tb-a0)/(pk-a0))**2,np.exp(-(tb-pk)*1.1)))*np.clip((59.65-tb)/1.0,0,1)
ch=lp(ch*oenv,1800)*0.05
spk=sum(tone(f,56.89+0.05*i,1.6,0.05,3.0) for i,f in enumerate([659.3,830.6,987.8]))
# ---------- mix ----------
sr_,v=w.read('/home/claude/vo2/vo_final_new2.wav'); v=v.astype(np.float32)/32768
vo=np.zeros(N,np.float32); vo[:len(v)]=v
rms=lambda x:np.sqrt(np.mean(x[np.abs(x)>1e-4]**2))
mus*=0.05/rms(mus)
ve=uniform_filter1d(np.abs(vo),int(0.05*sr)); duck=1-0.62*np.clip(ve/0.07,0,1); duck=uniform_filter1d(duck,int(0.25*sr))
mix=vo+sfx+mus*duck+out+ch+spk
mix/=max(1,np.abs(mix).max()/0.95)
w.write('/home/claude/vo2/mix11.wav',sr,(mix*32767).astype(np.int16))
print('music rms',rms(mus),'voice rms',rms(vo))
