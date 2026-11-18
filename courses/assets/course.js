(() => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const storageKey = 'agentic-ai-01-01-complete';
  const read = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const write = (key,value) => { try { localStorage.setItem(key,value); return true; } catch { return false; } };
  const theme = $('#theme');
  const setTheme = dark => {
    document.body.classList.toggle('dark',dark);
    theme?.setAttribute('aria-pressed',String(dark));
    const color = $('meta[name="theme-color"]');
    if (color) color.content = dark ? '#19171f' : '#f7f5f0';
  };
  setTheme(read('chronicle-theme') === 'dark');
  theme?.addEventListener('click',() => { const dark = !document.body.classList.contains('dark'); setTheme(dark); write('chronicle-theme',dark ? 'dark' : 'light'); });
  const savedComplete = read(storageKey) === 'yes';
  const localProgress = $('#local-progress');
  if (localProgress) localProgress.textContent = savedComplete ? '本机记录：1.1 已完成' : '本机记录：1.1 尚未完成';
  if (!$('#lesson-content')) return;

  const progress = $('.reading-progress');
  const updateProgress = () => { if (!progress) return; const h = document.documentElement.scrollHeight-innerHeight; progress.style.width = `${h > 0 ? Math.min(100,scrollY/h*100) : 100}%`; };
  addEventListener('scroll',updateProgress,{passive:true}); addEventListener('resize',updateProgress); updateProgress();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.lesson-aside a').forEach(link => { const active = link.getAttribute('href') === '#'+entry.target.id; link.classList.toggle('active',active); if(active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); });
    }),{rootMargin:'-10% 0px -65% 0px'});
    $$('.lesson-section').forEach(section => observer.observe(section));
  }
  const stages = [
    ['文本 → 离散 ID','教学词表将「GPU 正在等待」映射为 [0, 1, 2]。ID 只是词表索引，数字大小不表示语义强弱。真实 tokenizer 的切分由其词表与算法决定。','[T] = [3]'],
    ['离散 ID → 向量','每个 ID 从可训练的 embedding 表 E 中查出一行。这里令词表 V=8、隐藏维 d=8，三个 token 得到 3×8 的向量矩阵。','E: [8,8] → X: [3,8]'],
    ['向量 → 带上下文的状态','经过 L 层 Transformer，注意力与 MLP 等模块共同形成上下文表示。对自回归 decoder，位置 i 只能读取自己与之前的位置。输出仍是 [T,d]。','X: [3,8] → H: [3,8]'],
    ['最后位置 → 下一个 token','取最后位置 h₃，经 LM Head 得到 8 个词表 logits，再由 softmax 与解码策略选择下一 token。选择出的 token 会进入下一轮上下文。','h₃: [8] → z: [8] → token']
  ];
  const renderStage = index => {
    $$('[data-stage]').forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
    const [title,description,shape] = stages[index];
    $('#stage-title').textContent = title; $('#stage-description').textContent = description; $('#stage-shape').textContent = shape;
  };
  $$('[data-stage]').forEach(button => button.addEventListener('click',() => renderStage(Number(button.dataset.stage)))); renderStage(0);

  const words = ['GPU','正在','等待','通信'];
  const matrix = $('#causal-grid');
  matrix.append(Object.assign(document.createElement('span'),{className:'matrix-label',textContent:'Q / K'}));
  words.forEach(word => matrix.append(Object.assign(document.createElement('span'),{className:'matrix-label',textContent:word})));
  words.forEach((word,i) => {
    const button = document.createElement('button'); button.className='matrix-label';button.type='button';button.textContent=word;button.dataset.position=i;button.setAttribute('aria-label',`选择第 ${i+1} 个位置：${word}`);matrix.append(button);
    words.forEach((_,j) => { const cell = document.createElement('span');cell.className='matrix-cell'+(j>i?' blocked':'');cell.dataset.row=i;cell.textContent=j>i?'×':'✓';cell.setAttribute('aria-label',`位置 ${i+1} 对位置 ${j+1}：${j>i?'被屏蔽':'可读取'}`);matrix.append(cell); });
  });
  const selectRow = index => {
    $$('[data-position]').forEach(button => button.setAttribute('aria-pressed',String(Number(button.dataset.position)===index)));
    $$('.matrix-cell').forEach(cell => cell.classList.toggle('selected',Number(cell.dataset.row)===index));
    $('#causal-description').textContent = `位置 ${index+1}「${words[index]}」只能读取「${words.slice(0,index+1).join('、')}」。${index<3?'后面的 token 被遮住。':'当前已没有更靠后的输入位置。'}这张图表示可见性，不是注意力权重。`;
  };
  $$('[data-position]').forEach(button => button.addEventListener('click',() => selectRow(Number(button.dataset.position))));selectRow(2);

  const vocab = ['GPU','正在','等待','通信','数据','计算','。','<EOS>'];
  const logits = [-2.3,-1.8,-1.4,2.8,2.1,1.3,0.5,-0.7];
  const probabilities = temperature => { const scaled = logits.map(z => z/temperature); const max = Math.max(...scaled); const exp = scaled.map(z => Math.exp(z-max));const sum = exp.reduce((a,b)=>a+b,0);return exp.map(v=>v/sum); };
  const bars = $('#prob-bars');
  vocab.forEach((word,i) => { const row = document.createElement('div');row.className='prob-row'; const label=document.createElement('span');label.textContent=word;const track=document.createElement('div');track.className='prob-track';const bar=document.createElement('div');bar.className='prob-bar';bar.id='prob-'+i;track.append(bar);const number=document.createElement('span');number.id='prob-number-'+i;row.append(label,track,number);bars.append(row); });
  const temperature = $('#temperature');
  const renderProbabilities = () => { const value=Number(temperature.value);$('#temperature-value').textContent=value.toFixed(1);const p=probabilities(value);p.forEach((prob,i) => { $('#prob-'+i).style.setProperty('--p',`${prob*100}%`);$('#prob-number-'+i).textContent=`${(prob*100).toFixed(2)}%`; });$('#prob-sum').textContent=`未四舍五入前的概率和：${p.reduce((a,b)=>a+b,0).toFixed(6)}`;$('#sample-note').textContent='改变温度只改变选词分布，不改变模型权重。'; };
  temperature.addEventListener('input',renderProbabilities);renderProbabilities();
  $('#greedy').addEventListener('click',() => { const i=logits.indexOf(Math.max(...logits));$('#sample-word').textContent=vocab[i];$('#sample-note').textContent='贪心选择：直接取最大 logit 对应的「通信」，不进行随机抽样。'; });
  $('#sample').addEventListener('click',() => { const p=probabilities(Number(temperature.value));let random=Math.random();let chosen=p.length-1;for(let i=0;i<p.length;i++){random-=p[i];if(random<=0){chosen=i;break;}}$('#sample-word').textContent=vocab[chosen];$('#sample-note').textContent='按照当前分布进行了一次本地随机抽样；反复抽样可能得到不同结果。'; });

  const modes = {
    train:{title:'训练：给定真实前缀，学习预测下一 token',text:'输入 GPU / 正在 / 等待 / 通信，对应监督目标 正在 / 等待 / 通信 / 。各位置在因果遮罩下并行算出 logits，与真实下一 token 计算损失，再通过反向传播更新参数 θ。真实目标作为后续位置的前缀，这叫 teacher forcing。',shape:'input [0,1,2,3] → target [1,2,3,6]'},
    inference:{title:'推理：给定前缀，逐步使用自己选出的 token',text:'先根据 GPU / 正在 / 等待 预测下一 token，例如「通信」。再把「通信」接到上下文，预测后面的「。」。这里没有反向传播或优化器更新；变化的是输入上下文和运行时缓存，参数 θ 保持不变。',shape:'prefix → 通信 → 。 → <EOS>'}
  };
  const renderMode = mode => { $$('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));$('#mode-title').textContent=modes[mode].title;$('#mode-description').textContent=modes[mode].text;$('#mode-shape').textContent=modes[mode].shape; };
  $$('[data-mode]').forEach(button=>button.addEventListener('click',()=>renderMode(button.dataset.mode)));renderMode('train');

  const phases = [
    {input:['GPU','正在','等待'],cached:0,output:'通信',cache:3,text:'Prefill：处理 3 个输入 token，建立它们在各层的 K/V。最后位置的 logits 用来选出第 1 个新 token「通信」。它此时是输出，还没有作为输入被处理。'},
    {input:['GPU','正在','等待','通信'],cached:3,output:'。',cache:4,text:'Decode 1：复用前 3 个位置的 K/V，只为新输入「通信」计算新的状态与 K/V，随后预测「。」。缓存扩展到 4 个位置。'},
    {input:['GPU','正在','等待','通信','。'],cached:4,output:'<EOS>',cache:5,text:'Decode 2：把上轮输出的「。」作为本轮输入，追加第 5 个位置的 K/V，再预测结束标记 <EOS>。这个教学序列至此停止；实际服务也可能因 stop 条件或长度预算结束。'}
  ];
  const renderPhase = phase => {
    $$('[data-phase]').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.phase)===phase)));
    const state=phases[phase];const line=$('#phase-tokens');line.replaceChildren();
    state.input.forEach((word,i)=>{const token=document.createElement('span');token.className='token '+(i<state.cached?'cached':'current');token.textContent=word;const small=document.createElement('small');small.textContent=i<state.cached?'复用 K/V':'本轮输入';token.append(small);line.append(token);});
    $('#phase-explanation').textContent=state.text;$('#phase-output').textContent=state.output;
    const cache=$('#cache-line');cache.replaceChildren();for(let i=0;i<state.cache;i++){const item=document.createElement('span');item.textContent=`K${i+1},V${i+1}`;if(i>=state.cached)item.className='new';cache.append(item);}
  };
  $$('[data-phase]').forEach(button=>button.addEventListener('click',()=>renderPhase(Number(button.dataset.phase))));renderPhase(0);

  const feedback = {
    q1:'因果遮罩限制位置 i 只读取 ≤i 的输入。训练可以在一次前向中并行处理多个位置，但不能让未来答案泄漏进前缀。',
    q2:'普通推理没有参数更新；上下文增加、KV Cache 增长，都不等价于重新训练或在线学习。',
    q3:'语言模型给出的是条件 token 分布。最高概率回答仍可能事实错误；训练诊断还需要日志、指标与验证实验。'
  };
  let completed=savedComplete;
  const completionButton=$('#complete-lesson');
  const updateQuiz = () => { const allCorrect=['q1','q2','q3'].every(q=>document.querySelector(`input[name="${q}"]:checked`)?.value==='correct');completionButton.disabled=completed || !allCorrect;completionButton.textContent=completed?'本节已完成 ✓':'完成本节并保存记录'; };
  $$('.question input').forEach(input=>input.addEventListener('change',()=>{const box=$('#feedback-'+input.name);const correct=input.value==='correct';box.textContent=(correct?'回答正确。':'再想一想。')+feedback[input.name];box.className='answer-feedback '+(correct?'correct':'incorrect');updateQuiz();}));
  if(completed)$('#completion-state').textContent='本机已有本节的完成记录。';updateQuiz();
  completionButton.addEventListener('click',()=>{completed=true;const saved=write(storageKey,'yes');$('#completion-state').textContent=saved?'已记录：1.1 完成。学习记录仅保存在本机浏览器。':'本次已完成；浏览器限制本地存储，关闭后可能无法保留。';updateQuiz();});

  const slides=$$('.lesson-section');let slide=0;let oldScroll=0;
  const renderSlide=()=>{slides.forEach((section,i)=>section.classList.toggle('current-slide',i===slide));$('#slide-count').textContent=`${slide+1} / ${slides.length}`;$('#prev-slide').disabled=slide===0;$('#next-slide').disabled=slide===slides.length-1;};
  const setDeck = enabled => {document.body.classList.toggle('deck',enabled);$('#presentation').setAttribute('aria-pressed',String(enabled));if(enabled){oldScroll=scrollY;renderSlide();scrollTo(0,0);$('#exit-deck').focus();}else{scrollTo(0,oldScroll);$('#presentation').focus();}};
  $('#presentation').addEventListener('click',()=>setDeck(true));$('#exit-deck').addEventListener('click',()=>setDeck(false));
  const moveSlide=direction=>{slide=Math.min(slides.length-1,Math.max(0,slide+direction));renderSlide();scrollTo(0,0);};
  $('#prev-slide').addEventListener('click',()=>moveSlide(-1));$('#next-slide').addEventListener('click',()=>moveSlide(1));
  addEventListener('keydown',event=>{if(!document.body.classList.contains('deck'))return;if(event.key==='Escape'){setDeck(false);return;}if(/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowRight'){event.preventDefault();moveSlide(1);}if(event.key==='ArrowLeft'){event.preventDefault();moveSlide(-1);}});
})();
