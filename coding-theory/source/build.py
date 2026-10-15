"""Build the offline HTML course with Python standard library: python build.py."""
from pathlib import Path
import json,base64,sys
sys.path.insert(0,str(Path(__file__).parent))
from content import slides,SOURCES
root=Path(__file__).resolve().parent
out=root.parent
def uri(p,mime):return 'data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode('ascii')
photo=uri(root/'assets/shannon.png','image/png')
images={'HAMMING_PHOTO':uri(root/'assets/richard-hamming-nps.jpg','image/jpeg'),'SHANNON_TITLE':uri(root/'assets/shannon-1948-title.png','image/png'),'SHANNON':photo,'REPEAT_MEME':uri(root/'assets/important-three-times.png','image/png')}
for key,name,mime in [('MORSE_CODE','morse-code.png','image/png'),('BELL_PORTRAIT','bell-1876.jpg','image/jpeg'),('BELL_SKETCH','bell-sketch.jpg','image/jpeg'),('ENIAC','eniac-1946.jpg','image/jpeg'),('QR_COMPLETE','sdu-qr-complete.png','image/png'),('QR_LIGHT','sdu-qr-light.png','image/png'),('QR_HEAVY','sdu-qr-heavy.png','image/png')]:images[key]=uri(root/'assets'/name,mime)
images['ARIKAN_PHOTO']=uri(root/'assets/arikan-bilkent.jpg','image/jpeg')
images['HUAWEI_LOGO']=uri(root/'assets/huawei-official-logo.png','image/png')
images['ARIKAN_AWARD']=uri(root/'assets/huawei-arikan-award-2018.jpg','image/jpeg')
images['SOS_NORMAL']=uri(root/'assets/sos-normal.wav','audio/wav')
images['SOS_SLOW']=uri(root/'assets/sos-slow.wav','audio/wav')
for s in slides:
    for key,value in images.items():s['body']=s['body'].replace('@@'+key+'@@',value)
template=(root/'template.html').read_text(encoding='utf8')
html=template.replace('@@COURSE@@',json.dumps(slides,ensure_ascii=False).replace('</',r'<\/')).replace('@@SOURCES@@',json.dumps(SOURCES,ensure_ascii=False)).replace('@@LOGO@@',uri(root/'assets/sdu_logo.jpeg','image/jpeg')).replace('@@DEMOS_JS@@',(root/'demos.js').read_text(encoding='utf8')).replace('@@DEMOS_CSS@@',(root/'demos.css').read_text(encoding='utf8')).replace('@@GEOMETRY_JS@@',(root/'geometry.js').read_text(encoding='utf8')).replace('@@GEOMETRY_CSS@@',(root/'geometry.css').read_text(encoding='utf8')).replace('@@QR_JS@@',(root/'qr.js').read_text(encoding='utf8')).replace('@@QR_CSS@@',(root/'qr.css').read_text(encoding='utf8')).replace('@@SOS_JS@@',(root/'sos.js').read_text(encoding='utf8')).replace('@@SOS_SLOW@@',images['SOS_SLOW']).replace('@@MATH_JS@@',(root/'math.js').read_text(encoding='utf8')).replace('@@MATH_CSS@@',(root/'math.css').read_text(encoding='utf8'))
html=html.replace('@@STORAGE_JS@@',(root/'storage.js').read_text(encoding='utf8')).replace('@@STORAGE_CSS@@',(root/'storage.css').read_text(encoding='utf8'))
html=html.replace('@@LDPC_JS@@',(root/'ldpc.js').read_text(encoding='utf8')).replace('@@LDPC_CSS@@',(root/'ldpc.css').read_text(encoding='utf8'))
html=html.replace('@@POLAR_JS@@',(root/'polar.js').read_text(encoding='utf8')).replace('@@POLAR_CSS@@',(root/'polar.css').read_text(encoding='utf8'))
html=html.replace('@@AI_JS@@',(root/'ai.js').read_text(encoding='utf8')).replace('@@AI_CSS@@',(root/'ai.css').read_text(encoding='utf8'))
html=html.replace('@@LEARN_DECODER_CSS@@',(root/'learn_decoder.css').read_text(encoding='utf8'))
html=html.replace('@@QUANTUM_CSS@@',(root/'quantum.css').read_text(encoding='utf8')).replace('@@QUANTUM_JS@@',(root/'quantum.js').read_text(encoding='utf8'))
html=html.replace('@@PROJECTION_CSS@@',(root/'projection.css').read_text(encoding='utf8'))
html=html.replace('@@PROJECTION_JS@@',(root/'projection.js').read_text(encoding='utf8'))
html=html.replace('@@IMAGE_FORMATS_CSS@@',(root/'image_formats.css').read_text(encoding='utf8')).replace('@@IMAGE_FORMATS_JS@@',(root/'image_formats.js').read_text(encoding='utf8'))
html=html.replace('@@DECODE_VENN_CSS@@',(root/'decode_venn.css').read_text(encoding='utf8')).replace('@@SPACE_CSS@@',(root/'space.css').read_text(encoding='utf8')).replace('@@SPACE_JS@@',(root/'space.js').read_text(encoding='utf8'))
html=html.replace('@@SHANNON_CSS@@',(root/'shannon.css').read_text(encoding='utf8')).replace('@@SHANNON_JS@@',(root/'shannon.js').read_text(encoding='utf8'))
html=html.replace('@@HAMMING_HISTORY_CSS@@',(root/'hamming_history.css').read_text(encoding='utf8')).replace('@@HAMMING_HISTORY_JS@@',(root/'hamming_history.js').read_text(encoding='utf8'))
target=out/'index.html'
target.write_text(html,encoding='utf8')
lines=['编码理论简介：新生研讨课备课讲义','主课52页，共120分钟，含10分钟休息。另有7页备查。','核心问题：信息经过不可靠的世界，为什么还能可靠到达？','教学目标：理解冗余、约束、距离与资源取舍；分清错误与擦除；能解释通信、存储、AI硬件与量子纠错的不同任务。','']
t=0
for i,s in enumerate(slides,1):
    lines+=['='*48,f'{i:02d}　{s["title"]}',f'章节：{s["section"]}　'+(f'第{t}—{t+s["minutes"]}分钟，建议{s["minutes"]}分钟' if s['minutes'] else '备查页'),'讲解提示：'+s['subtitle'],s['notes']]
    t+=s['minutes']
    if s['refs']:lines+=['资料：']+[SOURCES[k][0]+'\n'+SOURCES[k][1] for k in s['refs']]
    lines+=['']
(out/'教师备课讲义.txt').write_text('\n'.join(lines),encoding='utf-8-sig')
ai_reading=['AI与编码：第41页延伸阅读','核查日期：2026-10-04。基础应用与已部署硬件、研究方案及预印本分开理解。','',
            '课堂入口：存得住（存储纠删码）→读得准（显存ECC）→算得对（计算校验）。',
            '三台机器的梯度编码和2×2矩阵ABFT示例均可在第41页操作；完整公式与讲解见教师备课讲义。','']
for key,guide in [('gpu','基础应用：A100的HBM2支持SECDED；保护覆盖需按具体硬件和错误模型理解。'),
                  ('gradient-coding','基础研究：用冗余计算和梯度线性组合，应对暂未返回结果的慢节点。'),
                  ('realm','DAC 2025：统计式ABFT，考虑LLM对不同计算错误的鲁棒性和恢复开销。'),
                  ('reach','2025-12预印本：小块内层RS纠错，失败块标为擦除，再由外层RS恢复；研究HBM与LLM推理的成本取舍。'),
                  ('sprobe','2026-09预印本：针对量化整数GPU计算，通过综合与RS译码链诊断计算错误，再修复或重算。')]:
    ai_reading.extend([SOURCES[key][0],SOURCES[key][1],guide,''])
ai_reading.extend(['阅读顺序：先读摘要中的问题，再看方案图，最后看错误模型、实验条件和额外开销。',
                   '预印本与研究评估不代表已在所有大模型系统普遍部署；计算正确性与回答的事实正确性是不同问题。'])
(out/'AI与编码延伸阅读.txt').write_text('\n'.join(ai_reading),encoding='utf-8-sig')
blocks=[];start=0
for s in slides:
    if not s['minutes']:continue
    if not blocks or blocks[-1]['section']!=s['section']:blocks.append(dict(section=s['section'],start=start,end=start+s['minutes'],pages=[]))
    else:blocks[-1]['end']+=s['minutes']
    blocks[-1]['pages'].append(s['title']);start+=s['minutes']
lines=['编码理论简介：两小时教学安排','对象：大一新生；不要求编程、概率论或线性代数基础。','总时长：120分钟，含10分钟休息。主课52页，7页备查。','','理论主线：冗余留下线索，校验约束组织线索，距离刻画保护能力，译码利用线索恢复信息。可靠性与资源成本一起考虑。','']
for b in blocks:lines.extend([f'第{b["start"]}—{b["end"]}分钟：{b["section"]}','；'.join(b['pages']),''])
lines.extend(['第19页行列校验、第23页汉明译码均为6步HTML演示。','行列校验：点击格子更换单错，检查行与列，再恢复。','汉明译码：在三个相交圆上点击任意位，逐圆检查奇偶性，用交区定位并恢复。','最后一步之后，下一步进入下一页；上一页返回演示时显示其最后一步。','逐页讲解要点与引用资料见教师备课讲义。'])
(out/'教学安排.txt').write_text('\n'.join(lines),encoding='utf-8-sig')
(out/'使用说明.txt').write_text('''编码理论简介：HTML教学版

双击“index.html”，用Edge或Chrome打开。
全部59页、图片、SOS音频、分步演示与互动都内嵌于一个HTML文件，可离线使用。
无视频资源，无需安装Manim；参考文献链接需要联网。
主课52页、120分钟（含10分钟休息）；后7页为备查。

左右方向键：翻页，在第19、23页推进或回退演示步骤。
空格：推进HTML演示。R：回到本页演示第一步。
F：全屏。O：目录。N：教师备注。Home：首页。End：主课末页。
绿色横线下的概括句已移入教师备注的“讲解提示”，正文区域相应上移。
中英文与数字之间采用浏览器的自动短间距，不拆开连续英文、数字和二进制序列。
行列校验和汉明译码都可点击更换单个错误位置，并动态计算结果。
演示页也有上一步、下一步、重置演示按钮。
第2页分像素与图片格式两个视图，第二个视图用浏览器实际生成JPEG、PNG、WebP文件，比较大小与文件头；可调整JPEG质量或下载当前样例。image_formats.js/css控制该演示。
第7页为SOS听辨练习，可正常播放、慢速再听、揭晓答案或重新练习。
第33页提供真实二维码扫码实验；点击单张可放大。
新增第28页独立讲述香农信道编码定理；第35页讲P、Q校验计算；第37页有具体修复成本与局部校验对比。
第10页展示香农1948年《通信的数学理论》原刊首页题名，可点击放大；shannon.js/css控制该展示。
第11页加入汉明的NPS历史照片（可离线点击放大）及1950年论文的题名、发表年月、期刊、卷期和页码；hamming_history.js/css控制展示，论文链接需要联网。
第23页与构造页采用同一组三圆和比特位置；decode_venn.css控制译码图布局。
第36页有真实编码、传输时间、中国探月三个视图；space.js/css控制演示，来源日期与计算假设见教师备注。
第34页以Ceph的4＋2纠删码为例，可演示丢失1、2、3块后的恢复结果；storage.js/css控制该演示。
第39页提供(8,4,3)小型LDPC示例，点击三个阶段查看矩阵、编码和擦除译码；ldpc.js/css控制该演示。
第40页提供N=8、K=4的极化码示例，点击五个阶段查看两位变换、信道合成与分裂、1→2→4→8递归分化、可逐层展开的4/8信道合成图、可靠性、编码和顺序译码；polar.js/css控制该演示。
第38页以阿勒坎原创、华为等工程推进与3GPP标准选择的故事，科普5G极化码脉络；加入大学官方肖像、华为标识与2018年颁奖真实照片，人物与事件照片可点击放大。
第41页扩展为基础应用、梯度编码、矩阵计算校验与2025—26研究四个场景；ai.js/css控制该演示。
第43页用经典校验与时间记录解释AI译码；第45—49页分别讲量子基础、联合编码、读取校验、恢复状态与相位错误，每页一个问题。quantum.js/css控制量子示例，可选择翻转位置并测量、纠正。
计时功能和其他互动示例保持可用。

source目录提供全部可编辑源文件。编辑content.py修改正文与教师备注；
修改template.html调整版式；demos.js与demos.css控制两段HTML演示；math.js和math.css控制数学图解；geometry.js和geometry.css控制三圆构造与汉明球。
在source目录执行 python build.py，即可重建HTML、讲义与教学安排。
只需Python标准库，没有第三方依赖。

投影版加深正文、副标题和图中标注，放大公式与关键数字，删减重复注释；projection.css集中控制投影排版。
新版采用白底、简洁标题和页脚，保留山东大学校徽，恢复页眉下方的绿色长分割线，保留无蓝色横条的清爽布局。
''',encoding='utf-8-sig')
print(json.dumps(dict(slides=len(slides),minutes=t,bytes=target.stat().st_size,HTMLDemos=2),ensure_ascii=False))
