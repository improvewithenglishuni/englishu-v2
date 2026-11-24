import numpy as np, scipy.io.wavfile as w, json
from scipy.signal import butter,sosfiltfilt
from scipy.ndimage import uniform_filter1d, maximum_filter1d, minimum_filter1d
sr,x=w.read('raw.wav'); x=x.astype(np.float32)/(32768 if x.dtype==np.int16 else 1)
segs=[('hook',1.94,5.15,0.0),('why',5.6,9.68,0.40),('killed',10.52,13.81,0.30),('today',14.63,17.41,0.32),
('jenner_milk',31.67,40.39,0.55),('vacc',42.16,45.94,0.45),('eng',48.72,54.0,0.45),('notall',56.34,58.53,0.50),
('outbreak_circle',59.81,66.54,0.45),('thousands',103.94,115.16,0.55),('end',122.8,126.47,0.50)]
# quietest 2 s window for room tone
win=2*sr; best=None
for s in range(0,len(x)-win,sr//2):
    r=np.sqrt(np.mean(x[s:s+win]**2))
    if best is None or r<best[0]: best=(r,s)
rt=x[best[1]:best[1]+win].copy(); print('room tone at',best[1]/sr,'rms',best[0])
fade=int(0.012*sr)
def tone(n): return np.tile(rt,int(n/len(rt))+2)[:n].copy()
out=tone(int(0.2*sr)); marks={}
for name,a,b,g in segs:
    seg=x[int(a*sr):int(b*sr)].copy()
    seg[:fade]*=np.linspace(0,1,fade); seg[-fade:]*=np.linspace(1,0,fade)
    if g>0: out=np.concatenate([out,tone(int(g*sr))])
    marks[name]=(round(len(out)/sr,3),round(len(out)/sr+(b-a),3),a)
    out=np.concatenate([out,seg])
out=np.concatenate([out,tone(int(0.3*sr))])
json.dump(marks,open('marks.json','w'),indent=1); print(marks,len(out)/sr)
# cleanup: plosive rumble, then de-ess/de-air (same recipe as v34/v35)
r=out
F=lambda s,t,fr,o=4: sosfiltfilt(butter(o,fr,t,fs=sr,output='sos'),s)
lf=F(r,'band',[20,160]); mid=F(r,'band',[300,3000]); h=int(0.01*sr)
env=lambda s,win: np.sqrt(np.maximum(uniform_filter1d(s**2,win),0))
ratio=env(lf,h)/(env(mid,h)+2e-3); wgt=np.clip((ratio-0.45)/0.5,0,1)
wgt=uniform_filter1d(maximum_filter1d(wgt,int(0.04*sr)),int(0.03*sr))
c=r*(1-wgt)+F(r,'high',230)*wgt; c=F(c,'high',90,2)
hi=F(c,'high',3200); lo=c-hi
e2=lambda s,ms: np.sqrt(np.maximum(uniform_filter1d(s**2,int(ms*sr/1000)),0))+1e-6
eh=e2(hi,4); em=e2(F(c,'band',[250,2500]),12); ratio=eh/em; voiced=em>0.01
thr=np.percentile(ratio[voiced],85); g=np.clip(thr/ratio,0.25,1.0)
g=uniform_filter1d(minimum_filter1d(g,int(0.012*sr)),int(0.008*sr))
air=(em<0.01)&(eh>0.004); g=np.where(air,np.minimum(g,0.25),g)
res=lo+hi*g
w.write('vo_clean_raw.wav',sr,(np.clip(res,-1,1)*32767).astype(np.int16))
