import json,hashlib,subprocess,os,soundfile as sf
from kokoro_onnx import Kokoro
k=Kokoro('kokoro-v1.0.onnx','voices-v1.0.bin'); T=json.load(open('texts.json')); man={}
for t in T:
  h=hashlib.sha1(t.encode()).hexdigest()[:10]; fn=f'{h}.mp3'; man[t]=fn
  if os.path.exists('out/'+fn): continue
  a,sr=k.create(t,voice='bm_george',speed=0.9,lang='en-gb'); sf.write(f'wav/{h}.wav',a,sr)
  subprocess.run(['ffmpeg','-loglevel','error','-y','-i',f'wav/{h}.wav','-af','silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.08','-ac','1','-ar','24000','-c:a','libmp3lame','-b:a','40k',f'out/{fn}'],check=True)
json.dump(man,open('out/manifest.json','w'),ensure_ascii=False,indent=0); print(len(man))
