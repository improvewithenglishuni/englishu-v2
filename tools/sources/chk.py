import sys,base64
for n in sys.argv[1:]:
    ok=True;data=''
    for i,l in enumerate(open('b64/%s.txt'%n).read().split('\n')):
        if not l.strip(): continue
        d,c=l.rsplit(' ',1)
        if '%02x'%(sum(d.encode())%256)!=c: print(n,'BAD line',i+1); ok=False
        data+=d
    if ok:
        open('%s.jpg'%n,'wb').write(base64.b64decode(data)); print(n,'OK',len(data))
