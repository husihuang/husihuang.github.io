const shPaperButton=document.getElementById('sh-paper-open'),shPaperDialog=document.createElement('dialog');
shPaperDialog.className='sh-paper-zoom';shPaperDialog.setAttribute('aria-label','香农1948年论文原刊首页题名区域');
shPaperDialog.innerHTML='<div class="dialog-head"><h2>《通信的数学理论》· 1948年7月</h2><button type="button">关闭</button></div>';
const shPaperImage=shPaperButton.querySelector('img').cloneNode(true);shPaperDialog.appendChild(shPaperImage);
const shPaperCaption=document.createElement('p');shPaperCaption.textContent='原刊：《贝尔系统技术杂志》第27卷第3期。作者：克劳德·香农。论文分两次发表于1948年7月和10月。';shPaperDialog.appendChild(shPaperCaption);
document.body.appendChild(shPaperDialog);shPaperDialog.querySelector('button').onclick=()=>shPaperDialog.close();shPaperButton.onclick=()=>shPaperDialog.showModal();
