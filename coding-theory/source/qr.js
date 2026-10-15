const qrZoom=document.createElement('dialog');qrZoom.id='qr-zoom';
qrZoom.innerHTML='<div class="qr-zoom-head"><h2 id="qr-zoom-title"></h2><button id="qr-zoom-close">关闭</button></div><img id="qr-zoom-image" alt="放大的二维码扫码样例"><p>用微信扫一扫；按 Esc 或点击“关闭”返回。</p>';
document.body.append(qrZoom);
document.getElementById('qr-zoom-close').onclick=()=>qrZoom.close();
document.querySelectorAll('.qr-enlarge').forEach(button=>button.onclick=()=>{
 const label=button.dataset.qrLabel,img=button.querySelector('img');
 document.getElementById('qr-zoom-title').textContent=label;
 document.getElementById('qr-zoom-image').src=img.src;document.getElementById('qr-zoom-image').alt=label;
 qrZoom.showModal();
});
