import sys; sys.path.insert(0,sys.argv[1])
from pianolib import Song, render, N
S=sys.argv[1]; O=S+'/out/'

def chordbars(song,bpm,bars,pattern,sub,rhv,lh,t0=0.1,lhv=34,final=None,accent=None):
    """bars: list of (lh_notes, rh_voicing). pattern: indexes into voicing per subdivision (None=rest)."""
    beat=60/bpm; step=beat*4/sub; bar=beat*4
    for b,(L,V) in enumerate(bars):
        st=t0+b*bar
        song.pedal(st-0.03,False); song.pedal(st+0.01,True)
        for k,nm in enumerate(L): song.note(st+k*0.03,nm,(lhv-10 if k==0 else lhv),bar+0.1)
        for i,p in enumerate(pattern[b%len(pattern)]):
            if p is None: continue
            v=rhv*(1.15 if (accent and i in accent) or i%(sub//4)==0 else 0.85)
            song.note(st+i*step,V[p],v,beat*1.5)
    st=t0+len(bars)*bar
    if final:
        L,V=final; song.pedal(st-0.03,False); song.pedal(st+0.01,True)
        for k,nm in enumerate(L): song.note(st+k*0.03,nm,lhv,bar*1.6)
        for k,nm in enumerate(V): song.note(st+0.06+k*0.07,nm,rhv*0.9,bar*1.6)
        song.pedal(st+bar*1.7,False)
    return st+bar*1.7

# ---- rec16: G major, ~107 BPM, 8ths, bright sustained, bell-like top
s=Song(16)
bars=[(['G2','D3','G3'],['B3','D4','G4','B4','D5','G5']),
      (['G2','D3','F#3'],['B3','D4','F#4','B4','D5','F#5']),
      (['B2','F#3','B3'],['B3','D4','F#4','B4','D5','F#5']),
      (['B2','F#3','A3'],['A3','D4','F#4','A4','D5','F#5']),
      (['E2','B2','D3'],['B3','D4','G4','B4','D5','G5']),
      (['D2','A2','D3'],['A3','D4','F#4','A4','E5','F#5'])]
pat=[[0,2,4,3,5,3,4,2],[1,2,4,3,5,4,3,2],[0,2,4,3,5,3,4,1],[1,3,4,2,5,4,3,2]]
end=chordbars(s,107,bars,pat,8,44,True,lhv=26,final=(['G2','D3','G3'],['B3','D4','G4','B4','D5']))
print('16',render(s,O+'B_new_track_16_piano.wav',S+'/t16',lp=3200,lpmix=0.7,verb=0.22,maxlen=end+0.5))

# ---- rec18: A minor, A bass pedal, ~112 BPM, 8ths + 16th pickups, strong bass
s=Song(18); bpm=112; beat=60/bpm
bars=[(['A1','E2','A2'],['A3','C4','E4','A4','C5','E5']),
      (['G1','D2','G2'],['G3','C4','E4','G4','C5','E5']),
      (['F1','C2','F2'],['A3','C4','E4','F4','A4','C5']),
      (['G1','D2','G2'],['G3','B3','D4','G4','B4','D5']),
      (['A1','E2','A2'],['A3','C4','E4','A4','C5','E5']),
      (['D2','A2','D3'],['A3','D4','F4','A4','C5','D5']),
      (['E2','B2','E3'],['G#3','B3','E4','G#4','B4','D5'])]
pat=[[0,2,4,3,None,4,5,4,3,2,None,3,4,3,2,1],[0,2,3,4,None,3,5,3,2,1,None,2,4,2,3,1]]
end=chordbars(s,bpm,bars,pat,16,42,True,lhv=44,final=(['A1','E2','A2'],['A3','C4','E4','A4','C5']))
# bass pulse on beats 1 and 3 (original has strong low A pedal)
for b,(L,V) in enumerate(bars): 
    for q in (0,2): s.note(0.1+b*4*beat+q*beat,L[0] if q==0 else L[1],40,beat*0.9)
print('18',render(s,O+'B_new_track_18_piano.wav',S+'/t18',lp=2600,lpmix=0.75,low_shelf=2.5,verb=0.18,maxlen=end+0.5))

# ---- rec19: C major with borrowed Ab, ~92 BPM, rhythmic 16th staccato chords + soft shaker
s=Song(19); bpm=92; beat=60/bpm; bar=4*beat; st0=0.1
chords=[('C2',['E4','G4','C5']),('C2',['E4','G4','C5']),('Ab1',['Eb4','Ab4','C5']),('C2',['E4','G4','C5']),
        ('F1',['F4','A4','C5']),('Ab1',['Eb4','Ab4','C5']),('G1',['D4','G4','B4'])]
hits=[0,3,6,8,11,14]          # 3-3-2 syncopation on 16ths
shk=[]
for b,(bs,ch) in enumerate(chords):
    st=st0+b*bar
    for h in hits:
        for k,nm in enumerate(ch): s.note(st+h*beat/4+k*0.008,nm,(50 if h in (0,8) else 40),beat/4*0.8,jit=0.004)
    for q in (0,6,8,11): s.note(st+q*beat/4,bs if q!=11 else N(bs)+12,34 if q in (0,8) else 26,beat*0.45)
    if b%2==1: s.note(st+14*beat/4,ch[-1].replace('4','5') if '4' in ch[-1] else 'C6',34,beat*0.5)
    shk+=[(st+i*beat/2,0.8 if i%2==0 else 0.5) for i in range(8)]
st=st0+len(chords)*bar
s.pedal(st-0.03,False); s.pedal(st+0.01,True)
for k,nm in enumerate(['C2','G2','C3','E4','G4','C5','E5']): s.note(st+k*0.05,nm,44,bar*1.5)
s.pedal(st+bar*1.6,False)
print('19',render(s,O+'B_new_track_19_piano.wav',S+'/t19',lp=3000,lpmix=0.7,verb=0.14,maxlen=st+bar*1.7+0.5,noise_hits=shk))

# ---- rec20: G major, ~112 BPM, 8ths, bright with long high top notes
s=Song(20); bpm=112; beat=60/bpm; bar=4*beat
bars=[(['G2','D3','G3'],['D4','G4','B4','D5']),(['E2','B2','D3'],['D4','G4','B4','E5']),
      (['C2','G2','C3'],['E4','G4','C5','D5']),(['B1','G2','B2'],['D4','G4','B4','D5']),
      (['C2','G2','C3'],['E4','G4','C5','E5']),(['G2','D3','G3'],['D4','G4','B4','D5']),
      (['D2','A2','D3'],['D4','F#4','A4','D5'])]
pat=[[0,1,2,3,2,1,2,3],[0,2,1,3,2,3,1,2]]
end=chordbars(s,bpm,bars,pat,8,40,True,lhv=28,final=(['G2','D3','G3'],['D4','G4','B4','D5','G5']))
tops=['G5','E5','G5','D5','E5','B5','F#5']
for b,nm in enumerate(tops): s.note(0.1+b*bar+0.01,nm,54,bar*0.95)   # long melody notes on top
print('20',render(s,O+'B_new_track_20_piano.wav',S+'/t20',lp=3200,lpmix=0.7,verb=0.2,maxlen=end+0.5))
