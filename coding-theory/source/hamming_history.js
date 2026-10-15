const hmPhotoButton=document.getElementById('hm-photo-open'),hmPhotoDialog=document.createElement('dialog');
hmPhotoDialog.className='hm-photo-zoom';hmPhotoDialog.setAttribute('aria-label','理查德·汉明历史照片');
hmPhotoDialog.innerHTML='<div class="dialog-head"><h2>理查德·汉明 · Richard W. Hamming</h2><button type="button">关闭</button></div>';
hmPhotoDialog.appendChild(hmPhotoButton.querySelector('img').cloneNode(true));const hmPhotoCaption=document.createElement('p');hmPhotoCaption.textContent='汉明在美国海军研究生院（NPS）的办公室，约20世纪80年代。照片来源：NPS官方纪念文章。';hmPhotoDialog.appendChild(hmPhotoCaption);
document.body.appendChild(hmPhotoDialog);hmPhotoDialog.querySelector('button').onclick=()=>hmPhotoDialog.close();hmPhotoButton.onclick=()=>hmPhotoDialog.showModal();
