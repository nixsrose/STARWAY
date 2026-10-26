"""Prepare dklon's CC-BY 3.0 jet recording as a compact, seamless loop."""
from pathlib import Path
import wave,io,base64
import numpy as np
from scipy.signal import butter,sosfilt,resample_poly
with wave.open('assets/audio/dklon-engine-takeoff-original.wav') as w:
 rate=w.getframerate();a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
# Keep the stable thrust before the Doppler tail.
a=a[int(.3*rate):int(1.9*rate)]
a=sosfilt(butter(2,[100,5000],btype='bandpass',fs=rate,output='sos'),a)
a=resample_poly(a,320,441);rate=32000
n=int(.18*rate);t=np.linspace(0,1,n)
# Join tail to head with equal-power overlap, then continue the original interior.
join=a[-n:]*np.cos(t*np.pi/2)+a[:n]*np.sin(t*np.pi/2)
a=np.concatenate([join,a[n:-n]])
a*=min(.22/np.sqrt(np.mean(a*a)),.9/max(abs(a)))
b=io.BytesIO()
with wave.open(b,'wb') as w:
 w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes((a*32767).astype('<i2').tobytes())
Path('assets/audio/jet-loop.wav').write_bytes(b.getvalue())
Path('dist/jet-sample.js').write_text('// Jet Engine Takeoff by dklon, CC BY 3.0. Trimmed, filtered, crossfaded and normalized.\nconst JET_ENGINE_WAV="'+base64.b64encode(b.getvalue()).decode()+'";\n')
print('Jet loop:',len(a)/rate,'seconds;',len(b.getvalue()),'bytes')
