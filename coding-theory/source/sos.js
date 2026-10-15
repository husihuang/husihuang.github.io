const sosAudio=document.getElementById('sos-audio'),sosNormal=sosAudio.getAttribute('src'),sosSlow='@@SOS_SLOW@@';
let sosRevealed=false;
async function playSos(slow){
 sosAudio.pause();sosAudio.src=slow?sosSlow:sosNormal;sosAudio.currentTime=0;
 try{await sosAudio.play();document.getElementById('sos-status').textContent=slow?'慢速播放：听清短声与长声，写下点划。':'正在播放：请先听，再写下点划。';}
 catch(e){document.getElementById('sos-status').textContent='请点击播放器的播放按钮重试。';}
}
document.getElementById('sos-play').onclick=()=>playSos(false);
document.getElementById('sos-slow').onclick=()=>playSos(true);
document.getElementById('sos-reveal').onclick=()=>{
 sosRevealed=!sosRevealed;document.getElementById('sos-answer').hidden=!sosRevealed;document.getElementById('sos-prompt').hidden=sosRevealed;
 document.getElementById('sos-reveal').textContent=sosRevealed?'隐藏答案':'揭晓答案';
};
document.getElementById('sos-reset').onclick=()=>{
 sosAudio.pause();sosAudio.src=sosNormal;sosAudio.currentTime=0;sosRevealed=false;
 document.getElementById('sos-answer').hidden=true;document.getElementById('sos-prompt').hidden=false;document.getElementById('sos-reveal').textContent='揭晓答案';
 document.getElementById('sos-status').textContent='每次播放同一个信号三遍；可重复收听。';
};
sosAudio.onended=()=>document.getElementById('sos-status').textContent='播放结束。写好点划后，查码表并说出你的答案。';
