import numpy as np, scipy.io.wavfile as w, json
from scipy.signal import butter,sosfiltfilt
from scipy.ndimage import uniform_filter1d, maximum_filter1d, minimum_filter1d
sr,x=w.read('raw.wav'); x=x.astype(np.float32)/(32768 if x.dtype==np.int16 else 1)
INT=0.14
# (name, gap_before, [raw pieces])  pieces are speech chunks cut in the middle of the natural pauses
takes=[('hook',0.0,[(1.94,5.15)]),
('why',0.16,[(5.60,9.68)]),
('killed',0.14,[(10.52,13.81)]),
('today',0.20,[(14.63,17.41)]),
('jenner',0.32,[(31.67,35.94),(36.03,40.39)]),
('vacc',0.20,[(42.16,45.94)]),
('eng',0.30,[(48.72,54.0)]),
('notall',0.34,[(56.34,58.53)]),
('outbreak',0.16,[(59.81,61.34),(61.44,63.77),(63.86,66.54)]),
('thousands',0.32,[(103.94,107.56),(107.91,110.36),(110.67,113.00),(113.11,115.16)]),
('end',0.50,[(122.8,126.47)])]
win=2*sr; best=None
for s in range(0,len(x)-win,sr//2):
    r=np.sqrt(np.mean(x[s:s+win]**2))
    if best is None or r<best[0]: best=(r,s)
rt=x[best[1]:best[1]+win].copy()
fade=int(0.012*sr)
def tone(n): return np.tile(rt,int(n/len(rt))+2)[:n].copy()
def lead_trim(a,b,first,last):
    # remove only silence inside the piece edges: keep 0.07 s of silence on pieces that touch a cut
    return a,b
out=tone(int(0.05*sr)); pieces=[]  # (raw_a, raw_b, out_a)
anch={}
for name,g,pcs in takes:
    if g>0: out=np.concatenate([out,tone(int(g*sr))])
    for k,(a,b) in enumerate(pcs):
        # inside a take: trim silence at the cut points to INT total
        aa=a; bb=b
        seg=x[int(aa*sr):int(bb*sr)].copy()
        seg[:fade]*=np.linspace(0,1,fade); seg[-fade:]*=np.linspace(1,0,fade)
        if k>0: pass
        pieces.append((aa,bb,len(out)/sr,name,k))
        out=np.concatenate([out,seg])
    anch[name]=pieces[-len(pcs)][2]
out=np.concatenate([out,tone(int(0.3*sr))])
dur=len(out)/sr
def f(raw):
    # raw time -> output (unsped) time
    for i,(a,b,o,n,k) in enumerate(pieces):
        if a-0.3<=raw<=b+0.0 or (raw<a and i==0): 
            if raw<a: 
                return o-(a-raw) if raw>=a-0.07 else o
            return o+(raw-a)
    # inside a removed gap: snap to start of the next piece
    for (a,b,o,n,k) in pieces:
        if raw<a: return o
    return pieces[-1][2]+(pieces[-1][1]-pieces[-1][0])
json.dump({'pieces':pieces,'dur':dur},open('pieces.json','w'))
# cleanup (same as v34/v35 recipe)
F=lambda s,t,fr,o=4: sosfiltfilt(butter(o,fr,t,fs=sr,output='sos'),s)
r=out
lf=F(r,'band',[20,160]); mid=F(r,'band',[300,3000]); h=int(0.01*sr)
env=lambda s,wn: np.sqrt(np.maximum(uniform_filter1d(s**2,wn),0))
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
w.write('vo_clean_raw2.wav',sr,(np.clip(res,-1,1)*32767).astype(np.int16))
A={}
def S(n): return [p for p in pieces if p[3]==n][0][2]
def E(n): p=[p for p in pieces if p[3]==n][-1]; return p[2]+p[1]-p[0]
A.update(dict(hook_s=S('hook'),hook_e=E('hook'),why_s=S('why'),why_e=E('why'),killed_s=S('killed'),killed_e=E('killed'),today_s=S('today'),today_e=E('today'),
 jenner_s=S('jenner'),jenner_a_e=[p for p in pieces if p[3]=='jenner'][0][2]+[p for p in pieces if p[3]=='jenner'][0][1]-[p for p in pieces if p[3]=='jenner'][0][0],
 milk_s=[p for p in pieces if p[3]=='jenner'][1][2],jenner_e=E('jenner'),vacc_s=S('vacc'),vacc_e=E('vacc'),eng_s=S('eng'),eng_e=E('eng'),notall_s=S('notall'),notall_e=E('notall'),
 outb_s=S('outbreak'),ring_s=[p for p in pieces if p[3]=='outbreak'][1][2],circle_s=[p for p in pieces if p[3]=='outbreak'][2][2],outb_e=E('outbreak'),
 th_s=S('thousands'),th_a_e=[p for p in pieces if p[3]=='thousands'][0][2]+[p for p in pieces if p[3]=='thousands'][0][1]-[p for p in pieces if p[3]=='thousands'][0][0],
 som_s=[p for p in pieces if p[3]=='thousands'][1][2],y1980_s=[p for p in pieces if p[3]=='thousands'][2][2],dis_s=[p for p in pieces if p[3]=='thousands'][3][2],th_e=E('thousands'),
 end_s=S('end'),end_e=E('end'),
 vaccword=f(43.66),dust=f(52.45),somword=f(109.7),stampland=f(112.4),dur=dur))
A={k:round(float(v),3) for k,v in A.items()}
json.dump(A,open('anchors.json','w'),indent=1); print(A)
