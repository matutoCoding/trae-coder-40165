const state = {
    audioFile: null,
    audioUrl: null,
    duration: 0,
    currentTime: 0,
    isPlaying: false,
    zoom: 100,
    speakers: [],
    utterances: [],
    quotes: [],
    chapters: [],
    viewpoints: [],
    selectedUtteranceId: null,
    draggedUtteranceId: null,
    showTimestamps: true
};

const speakerColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6'
];

const mockTranscripts = [
    { speaker: 0, text: "大家好，欢迎来到本期节目。今天我们邀请到了一位非常特别的嘉宾，他是人工智能领域的资深专家，李博士。" },
    { speaker: 1, text: "大家好，很高兴能来到这里和大家交流。" },
    { speaker: 0, text: "李博士，最近AI领域的发展非常迅速，特别是大语言模型的出现，让很多人都感到兴奋和担忧。您怎么看这个趋势？" },
    { speaker: 1, text: "确实，过去几年AI的发展超出了很多人的预期。大语言模型不仅仅是技术上的突破，更重要的是它改变了人和机器交互的方式。" },
    { speaker: 1, text: "我认为最重要的一点是，AI正在从一个工具变成一个协作者。过去我们用软件是命令式的，现在我们可以和AI对话、讨论、共创。" },
    { speaker: 0, text: "这个转变确实很有意思。那您觉得对于内容创作者来说，AI最大的价值在哪里？" },
    { speaker: 1, text: "我觉得最大的价值在于释放创造力。很多时候创作者的时间都花在了重复性工作上，比如整理素材、剪辑、写初稿这些。" },
    { speaker: 1, text: "AI可以帮你把这些基础性工作做了，让你有更多时间去思考真正重要的东西——创意、故事、价值。" },
    { speaker: 0, text: "说得太好了。不过也有很多人担心，AI会不会取代人类创作者？" },
    { speaker: 1, text: "这个担心我理解，但我觉得不会。因为创作的本质是表达人的情感、经验和思考，这些是AI无法替代的。" },
    { speaker: 1, text: "AI更像是一个超级助手，它能帮你更快地实现想法，但想法本身还是来自于人。就像有了照相机，画家并没有消失，反而有了更多创作的可能性。" },
    { speaker: 0, text: "这个比喻很形象。那对于普通播客创作者来说，您建议他们如何开始使用AI工具呢？" },
    { speaker: 1, text: "我的建议是从小处着手。不用一开始就想把所有工作都AI化，先找一个你最头疼的环节试试。" },
    { speaker: 1, text: "比如你觉得剪辑很费时间，就试试AI剪辑工具；你觉得写shownotes麻烦，就试试自动生成文稿。找到一个痛点，解决它，然后再慢慢扩展。" },
    { speaker: 0, text: "非常实用的建议。那我们来聊聊具体的应用场景。比如你们团队在做播客的时候，是怎么用AI的？" },
    { speaker: 2, text: "大家好，我是小周，是李博士团队的播客制作人。说到我们的工作流，AI确实帮了大忙。" },
    { speaker: 2, text: "首先是转写，以前我们要花好几个小时听录音整理文字，现在AI几分钟就搞定了，准确率还很高。" },
    { speaker: 2, text: "然后是剪辑，我们会先让AI把嗯、啊、重复的这些口头禅去掉，然后再人工精剪，效率提高了至少一倍。" },
    { speaker: 0, text: "听起来真的很高效。那金句摘录这部分呢？也是AI来做吗？" },
    { speaker: 2, text: "对，我们会让AI先找出可能的金句，然后我们再筛选。AI找的大概有60%是能用的，剩下的需要人工判断，但已经省了很多时间了。" },
    { speaker: 1, text: "这里我补充一点，AI最擅长的是模式识别和信息提取，但审美和价值判断还是需要人来做。所以最佳的模式是人机协作，而不是完全替代。" },
    { speaker: 0, text: "明白了。那对于那些担心学不会AI工具的朋友，您有什么想说的？" },
    { speaker: 1, text: "其实现在的AI工具都做得很友好了，不需要你懂技术。而且我觉得最重要的不是工具本身，而是你有没有想清楚自己的需求。" },
    { speaker: 1, text: "工具只是手段，内容才是目的。只要你知道自己想要什么，工具只是帮你更快到达那里而已。" },
    { speaker: 0, text: "非常深刻的观点。时间差不多了，最后请李博士给我们的听众说几句话吧。" },
    { speaker: 1, text: "好的。我想对所有内容创作者说：不要害怕新技术，去拥抱它。但永远记住，你的独特视角和真诚表达，才是最有价值的东西。" },
    { speaker: 1, text: "AI是放大器，它会让好的内容更好，也会让平庸的内容更平庸。所以专注于提升内容质量，技术自然会为你所用。" },
    { speaker: 0, text: "太棒了！谢谢李博士和小周今天的分享，也感谢大家的收听。我们下期再见！" },
    { speaker: 1, text: "谢谢大家，再见！" },
    { speaker: 2, text: "再见～" }
];

const mockChapters = [
    { title: "开场与嘉宾介绍", startTime: 0, summary: "主持人开场，介绍本期嘉宾——人工智能领域专家李博士。", keywords: ["开场", "嘉宾介绍", "AI"] },
    { title: "AI发展趋势解读", startTime: 45, summary: "李博士分析AI行业的最新发展趋势，特别是大语言模型带来的变革。", keywords: ["大语言模型", "发展趋势", "技术变革"] },
    { title: "AI与内容创作", startTime: 180, summary: "探讨AI对内容创作者的价值，以及如何释放创造力。", keywords: ["内容创作", "创造力", "效率提升"] },
    { title: "AI会取代人类吗", startTime: 320, summary: "讨论AI与人类创作者的关系，强调人机协作的重要性。", keywords: ["人机协作", "创作者", "未来工作"] },
    { title: "实操建议与工作流", startTime: 450, summary: "小周分享团队使用AI工具的实际工作流和经验。", keywords: ["工作流", "实操技巧", "效率工具"] },
    { title: "总结与展望", startTime: 600, summary: "李博士总结本期观点，给创作者的建议和鼓励。", keywords: ["总结", "创作者建议", "拥抱变化"] }
];

function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeShort(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function init() {
    initSpeakers();
    bindEvents();
}

function initSpeakers() {
    state.speakers = [
        { id: 0, name: '主持人', color: speakerColors[0] },
        { id: 1, name: '李博士', color: speakerColors[1] },
        { id: 2, name: '小周', color: speakerColors[2] }
    ];
}

function generateMockUtterances() {
    const utterances = [];
    let currentTime = 0;
    
    mockTranscripts.forEach((item, index) => {
        const duration = item.text.length * 0.15 + Math.random() * 2 + 1;
        const utterance = {
            id: index,
            speakerId: item.speaker,
            text: item.text,
            startTime: currentTime,
            endTime: currentTime + duration
        };
        utterances.push(utterance);
        currentTime += duration + Math.random() * 0.5;
    });
    
    state.duration = currentTime;
    return utterances;
}

function bindEvents() {
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    
    const uploadZone = document.getElementById('uploadZone');
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
    
    document.getElementById('playPauseBtn').addEventListener('click', togglePlay);
    document.getElementById('backwardBtn').addEventListener('click', () => seek(-5));
    document.getElementById('forwardBtn').addEventListener('click', () => seek(5));
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        const audio = document.getElementById('audioPlayer');
        audio.volume = e.target.value / 100;
    });
    document.getElementById('speedSelect').addEventListener('change', (e) => {
        const audio = document.getElementById('audioPlayer');
        audio.playbackRate = parseFloat(e.target.value);
    });
    
    document.getElementById('zoomIn').addEventListener('click', () => setZoom(state.zoom + 20));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(Math.max(50, state.zoom - 20)));
    document.getElementById('zoomFit').addEventListener('click', () => setZoom(100));
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    document.getElementById('addSpeakerBtn').addEventListener('click', addSpeaker);
    document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes);
    document.getElementById('addChapterBtn').addEventListener('click', addChapter);
    document.getElementById('generateSummaryBtn').addEventListener('click', generateSummary);
    document.getElementById('generateViewpointsBtn').addEventListener('click', generateViewpoints);
    
    document.getElementById('showTimestamps').addEventListener('change', (e) => {
        state.showTimestamps = e.target.checked;
        renderTranscript();
    });
    
    const timeline = document.getElementById('timelineContainer');
    timeline.addEventListener('click', (e) => {
        const rect = timeline.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        const time = percent * state.duration;
        setCurrentTime(time);
    });
    
    document.addEventListener('click', () => {
        document.getElementById('contextMenu').style.display = 'none';
    });
    
    const audio = document.getElementById('audioPlayer');
    audio.addEventListener('timeupdate', () => {
        state.currentTime = audio.currentTime;
        updatePlayhead();
        document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
    });
    
    audio.addEventListener('loadedmetadata', () => {
        if (!state.duration || state.duration === 0) {
            state.duration = audio.duration;
        }
        document.getElementById('totalTime').textContent = formatTime(state.duration);
        renderTimeline();
    });
    
    audio.addEventListener('ended', () => {
        state.isPlaying = false;
        document.getElementById('playIcon').textContent = '▶';
    });
    
    audio.addEventListener('play', () => {
        state.isPlaying = true;
        document.getElementById('playIcon').textContent = '⏸';
    });
    
    audio.addEventListener('pause', () => {
        state.isPlaying = false;
        document.getElementById('playIcon').textContent = '▶';
    });
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    state.audioFile = file;
    
    if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
    }
    state.audioUrl = URL.createObjectURL(file);
    
    const audio = document.getElementById('audioPlayer');
    audio.src = state.audioUrl;
    
    state.utterances = generateMockUtterances();
    state.chapters = JSON.parse(JSON.stringify(mockChapters));
    state.quotes = [];
    
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('workspace').style.display = 'grid';
    
    renderSpeakers();
    renderTimeline();
    renderTranscript();
    renderChapters();
    updateQuoteCount();
}

function togglePlay() {
    const audio = document.getElementById('audioPlayer');
    if (state.isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
}

function seek(seconds) {
    const audio = document.getElementById('audioPlayer');
    audio.currentTime = Math.max(0, Math.min(state.duration, audio.currentTime + seconds));
}

function setCurrentTime(time) {
    const audio = document.getElementById('audioPlayer');
    audio.currentTime = time;
}

function setZoom(zoom) {
    state.zoom = Math.max(50, Math.min(500, zoom));
    document.getElementById('zoomLevel').textContent = state.zoom + '%';
    renderTimeline();
}

function updatePlayhead() {
    const playhead = document.getElementById('playhead');
    const timeline = document.getElementById('timelineContainer');
    const percent = (state.currentTime / state.duration) * 100;
    playhead.style.left = percent + '%';
}

function renderSpeakers() {
    const container = document.getElementById('speakerList');
    container.innerHTML = '';
    
    state.speakers.forEach(speaker => {
        const duration = getSpeakerTotalDuration(speaker.id);
        const item = document.createElement('div');
        item.className = 'speaker-item';
        item.dataset.speakerId = speaker.id;
        item.innerHTML = `
            <div class="speaker-color" style="background: ${speaker.color}"></div>
            <div class="speaker-info">
                <div class="speaker-name" title="${speaker.name}">${speaker.name}</div>
                <div class="speaker-duration">${formatTimeShort(duration)}</div>
            </div>
        `;
        
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('speaker-name-input')) return;
            const nameEl = item.querySelector('.speaker-name');
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'speaker-name-input';
            input.value = speaker.name;
            nameEl.textContent = '';
            nameEl.appendChild(input);
            input.focus();
            input.select();
            
            input.addEventListener('blur', () => {
                speaker.name = input.value || '说话人' + (speaker.id + 1);
                renderSpeakers();
                renderTimeline();
                renderTranscript();
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') input.blur();
            });
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            item.classList.add('drag-over');
        });
        
        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });
        
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            const utteranceId = parseInt(state.draggedUtteranceId);
            reassignSpeaker(utteranceId, speaker.id);
        });
        
        container.appendChild(item);
    });
}

function getSpeakerTotalDuration(speakerId) {
    return state.utterances
        .filter(u => u.speakerId === speakerId)
        .reduce((sum, u) => sum + (u.endTime - u.startTime), 0);
}

function addSpeaker() {
    const newId = state.speakers.length;
    state.speakers.push({
        id: newId,
        name: '说话人' + (newId + 1),
        color: speakerColors[newId % speakerColors.length]
    });
    renderSpeakers();
}

function reassignSpeaker(utteranceId, newSpeakerId) {
    const utterance = state.utterances.find(u => u.id === utteranceId);
    if (utterance) {
        utterance.speakerId = newSpeakerId;
        renderSpeakers();
        renderTimeline();
        renderTranscript();
    }
}

function renderTimeline() {
    const ruler = document.getElementById('timelineRuler');
    const track = document.getElementById('timelineTrack');
    
    ruler.innerHTML = '';
    track.innerHTML = '';
    
    const trackInner = document.createElement('div');
    trackInner.className = 'timeline-track-inner';
    trackInner.style.width = (state.zoom) + '%';
    trackInner.style.minWidth = '100%';
    
    const totalSeconds = state.duration;
    const pixelsPerSecond = trackInner.offsetWidth / totalSeconds;
    
    const interval = getTickInterval(totalSeconds);
    for (let t = 0; t <= totalSeconds; t += interval) {
        const percent = (t / totalSeconds) * 100;
        
        const tick = document.createElement('div');
        tick.className = 'ruler-tick';
        tick.style.left = percent + '%';
        ruler.appendChild(tick);
        
        if (t % (interval * 2) === 0) {
            const label = document.createElement('div');
            label.className = 'ruler-label';
            label.style.left = percent + '%';
            label.textContent = formatTimeShort(t);
            ruler.appendChild(label);
        }
    }
    
    state.utterances.forEach(utterance => {
        const speaker = state.speakers.find(s => s.id === utterance.speakerId);
        if (!speaker) return;
        
        const startPercent = (utterance.startTime / totalSeconds) * 100;
        const duration = utterance.endTime - utterance.startTime;
        const widthPercent = (duration / totalSeconds) * 100;
        
        const segment = document.createElement('div');
        segment.className = 'speaker-segment';
        segment.style.left = startPercent + '%';
        segment.style.width = widthPercent + '%';
        segment.style.backgroundColor = speaker.color;
        segment.dataset.utteranceId = utterance.id;
        
        if (widthPercent > 5) {
            const label = document.createElement('div');
            label.className = 'speaker-segment-label';
            label.textContent = speaker.name;
            segment.appendChild(label);
        }
        
        segment.addEventListener('click', (e) => {
            e.stopPropagation();
            setCurrentTime(utterance.startTime);
            selectUtterance(utterance.id);
            if (!state.isPlaying) {
                togglePlay();
            }
        });
        
        trackInner.appendChild(segment);
    });
    
    track.appendChild(trackInner);
    updatePlayhead();
}

function getTickInterval(totalSeconds) {
    if (totalSeconds < 60) return 10;
    if (totalSeconds < 300) return 30;
    if (totalSeconds < 600) return 60;
    if (totalSeconds < 1800) return 120;
    return 300;
}

function renderTranscript() {
    const container = document.getElementById('transcriptContent');
    container.innerHTML = '';
    
    state.utterances.forEach(utterance => {
        const speaker = state.speakers.find(s => s.id === utterance.speakerId);
        if (!speaker) return;
        
        const el = document.createElement('div');
        el.className = 'utterance';
        el.draggable = true;
        el.dataset.utteranceId = utterance.id;
        el.style.borderLeftColor = speaker.color;
        
        const initial = speaker.name.charAt(0);
        const timeDisplay = state.showTimestamps 
            ? `<span class="utterance-time">${formatTimeShort(utterance.startTime)}</span>`
            : '';
        
        el.innerHTML = `
            <div class="utterance-avatar" style="background: ${speaker.color}">${initial}</div>
            <div class="utterance-body">
                <div class="utterance-header">
                    <span class="utterance-speaker">${speaker.name}</span>
                    ${timeDisplay}
                </div>
                <div class="utterance-text">${utterance.text}</div>
                <div class="utterance-actions">
                    <button class="utterance-action-btn" title="添加到金句" data-action="quote">⭐</button>
                    <button class="utterance-action-btn" title="新建章节" data-action="chapter">📑</button>
                </div>
            </div>
        `;
        
        el.addEventListener('dragstart', (e) => {
            state.draggedUtteranceId = utterance.id;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            state.draggedUtteranceId = null;
        });
        
        el.addEventListener('click', () => {
            selectUtterance(utterance.id);
            setCurrentTime(utterance.startTime);
        });
        
        el.addEventListener('dblclick', () => {
            setCurrentTime(utterance.startTime);
            if (!state.isPlaying) togglePlay();
        });
        
        el.querySelector('[data-action="quote"]').addEventListener('click', (e) => {
            e.stopPropagation();
            addQuote(utterance);
        });
        
        el.querySelector('[data-action="chapter"]').addEventListener('click', (e) => {
            e.stopPropagation();
            addChapterFromUtterance(utterance);
        });
        
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e.clientX, e.clientY, utterance);
        });
        
        if (state.selectedUtteranceId === utterance.id) {
            el.classList.add('selected');
        }
        
        container.appendChild(el);
    });
}

function selectUtterance(id) {
    state.selectedUtteranceId = id;
    document.querySelectorAll('.utterance').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.utteranceId) === id);
    });
    
    document.querySelectorAll('.speaker-segment').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.utteranceId) === id);
    });
}

function showContextMenu(x, y, utterance) {
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'block';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    menu.dataset.utteranceId = utterance.id;
    
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.onclick = () => {
            const action = item.dataset.action;
            handleContextAction(action, utterance);
            menu.style.display = 'none';
        };
    });
}

function handleContextAction(action, utterance) {
    switch (action) {
        case 'quote':
            addQuote(utterance);
            break;
        case 'chapter':
            addChapterFromUtterance(utterance);
            break;
        case 'copy':
            navigator.clipboard.writeText(utterance.text);
            break;
    }
}

function addQuote(utterance) {
    const exists = state.quotes.find(q => q.utteranceId === utterance.id);
    if (exists) return;
    
    const speaker = state.speakers.find(s => s.id === utterance.speakerId);
    state.quotes.push({
        id: Date.now(),
        utteranceId: utterance.id,
        text: utterance.text,
        speakerName: speaker ? speaker.name : '未知',
        startTime: utterance.startTime,
        color: speaker ? speaker.color : '#999'
    });
    
    renderQuotes();
    updateQuoteCount();
}

function renderQuotes() {
    const container = document.getElementById('quoteList');
    
    if (state.quotes.length === 0) {
        container.innerHTML = '<div class="empty-state">选中文字添加摘录</div>';
        return;
    }
    
    container.innerHTML = '';
    state.quotes.forEach(quote => {
        const el = document.createElement('div');
        el.className = 'quote-item';
        el.innerHTML = `
            <div class="quote-text">${quote.text}</div>
            <div class="quote-meta">
                <span>${quote.speakerName} · ${formatTimeShort(quote.startTime)}</span>
                <span class="quote-delete" data-quote-id="${quote.id}">删除</span>
            </div>
        `;
        
        el.addEventListener('click', (e) => {
            if (e.target.classList.contains('quote-delete')) return;
            setCurrentTime(quote.startTime);
            if (!state.isPlaying) togglePlay();
        });
        
        el.querySelector('.quote-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            state.quotes = state.quotes.filter(q => q.id !== quote.id);
            renderQuotes();
            updateQuoteCount();
        });
        
        container.appendChild(el);
    });
}

function updateQuoteCount() {
    document.getElementById('quoteCount').textContent = state.quotes.length;
}

function exportQuotes() {
    if (state.quotes.length === 0) {
        alert('还没有金句摘录哦～');
        return;
    }
    
    let content = '金句摘录\n';
    content += '='.repeat(40) + '\n\n';
    
    state.quotes.forEach((quote, index) => {
        content += `${index + 1}. "${quote.text}"\n`;
        content += `   —— ${quote.speakerName}  [${formatTime(quote.startTime)}]\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '金句摘录.txt';
    a.click();
    URL.revokeObjectURL(url);
}

function renderChapters() {
    const container = document.getElementById('chaptersContent');
    
    if (state.chapters.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有章节，点击上方按钮添加</div>';
        return;
    }
    
    container.innerHTML = '';
    state.chapters.forEach((chapter, index) => {
        const endTime = state.chapters[index + 1] 
            ? state.chapters[index + 1].startTime 
            : state.duration;
        
        const card = document.createElement('div');
        card.className = 'chapter-card';
        card.innerHTML = `
            <div class="chapter-header">
                <div class="chapter-number">${index + 1}</div>
                <input type="text" class="chapter-title" value="${chapter.title}" data-chapter-index="${index}">
                <span class="chapter-time">${formatTimeShort(chapter.startTime)} - ${formatTimeShort(endTime)}</span>
            </div>
            <div class="chapter-summary">
                <textarea rows="2" data-chapter-index="${index}" data-field="summary">${chapter.summary}</textarea>
            </div>
            <div class="chapter-keywords">
                ${chapter.keywords.map(k => `<span class="chapter-keyword">${k}</span>`).join('')}
            </div>
            <div class="chapter-actions">
                <button class="chapter-action-btn" data-action="jump" data-chapter-index="${index}">跳转到此处</button>
                <button class="chapter-action-btn" data-action="addViewpoint" data-chapter-index="${index}">提取观点</button>
                <button class="chapter-action-btn delete" data-action="delete" data-chapter-index="${index}">删除</button>
            </div>
        `;
        
        card.querySelector('.chapter-title').addEventListener('change', (e) => {
            chapter.title = e.target.value;
        });
        
        card.querySelector('textarea').addEventListener('input', (e) => {
            chapter.summary = e.target.value;
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
        });
        
        card.querySelectorAll('.chapter-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                const idx = parseInt(btn.dataset.chapterIndex);
                handleChapterAction(action, idx);
            });
        });
        
        setTimeout(() => {
            const textarea = card.querySelector('textarea');
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
        }, 0);
        
        container.appendChild(card);
    });
}

function handleChapterAction(action, index) {
    const chapter = state.chapters[index];
    
    switch (action) {
        case 'jump':
            setCurrentTime(chapter.startTime);
            break;
        case 'addViewpoint':
            extractViewpointsFromChapter(chapter);
            break;
        case 'delete':
            if (confirm('确定删除这个章节吗？')) {
                state.chapters.splice(index, 1);
                renderChapters();
            }
            break;
    }
}

function addChapter() {
    const newChapter = {
        title: '新章节',
        startTime: state.currentTime || 0,
        summary: '点击编辑章节摘要...',
        keywords: ['新话题']
    };
    
    let inserted = false;
    for (let i = 0; i < state.chapters.length; i++) {
        if (state.chapters[i].startTime > newChapter.startTime) {
            state.chapters.splice(i, 0, newChapter);
            inserted = true;
            break;
        }
    }
    if (!inserted) {
        state.chapters.push(newChapter);
    }
    
    renderChapters();
}

function addChapterFromUtterance(utterance) {
    state.currentTime = utterance.startTime;
    addChapter();
}

function generateSummary() {
    const title = document.getElementById('episodeTitle').value || '本期节目';
    const speakers = state.speakers.map(s => s.name).join('、');
    
    const topics = state.chapters.map(c => c.title).join('、');
    
    const summary = `本期节目，${title}。我们邀请到了${speakers}，一起探讨了${topics}等话题。\n\n通过本次对话，你将了解到AI如何改变内容创作方式，以及创作者应该如何拥抱新技术、提升效率。希望这期节目能给你带来启发。`;
    
    document.getElementById('episodeDesc').value = summary;
    
    if (!document.getElementById('episodeTitle').value) {
        document.getElementById('episodeTitle').value = 'AI时代的内容创作指南';
    }
}

function generateViewpoints() {
    state.viewpoints = [];
    
    const viewpointsBySpeaker = {
        0: [
            'AI工具是创作者的助手而非替代品',
            '从小处着手，逐步引入AI工具'
        ],
        1: [
            'AI正在从工具转变为协作者，改变人机交互方式',
            'AI最大的价值是释放创造力，让创作者专注于创意本身',
            '创作的本质是人的情感和思考，这是AI无法替代的',
            '专注于提升内容质量，技术自然会为你所用'
        ],
        2: [
            'AI转写和剪辑可以将效率提高至少一倍',
            '最佳模式是人机协作，各取所长'
        ]
    };
    
    Object.entries(viewpointsBySpeaker).forEach(([speakerId, viewpoints]) => {
        const speaker = state.speakers.find(s => s.id === parseInt(speakerId));
        if (speaker) {
            viewpoints.forEach(text => {
                state.viewpoints.push({
                    id: Date.now() + Math.random(),
                    speakerId: parseInt(speakerId),
                    speakerName: speaker.name,
                    text: text,
                    color: speaker.color
                });
            });
        }
    });
    
    renderViewpoints();
}

function extractViewpointsFromChapter(chapter) {
    const utterances = state.utterances.filter(u => 
        u.startTime >= chapter.startTime && 
        u.startTime < (chapter.startTime + 300)
    );
    
    const sampleUtterances = utterances.slice(0, 3);
    sampleUtterances.forEach(u => {
        const speaker = state.speakers.find(s => s.id === u.speakerId);
        if (speaker) {
            const shortText = u.text.length > 50 ? u.text.substring(0, 50) + '...' : u.text;
            state.viewpoints.push({
                id: Date.now() + Math.random(),
                speakerId: u.speakerId,
                speakerName: speaker.name,
                text: shortText,
                color: speaker.color,
                startTime: u.startTime
            });
        }
    });
    
    renderViewpoints();
}

function renderViewpoints() {
    const container = document.getElementById('viewpointsList');
    
    if (state.viewpoints.length === 0) {
        container.innerHTML = '<div class="empty-state">从章节中提取观点</div>';
        return;
    }
    
    container.innerHTML = '';
    state.viewpoints.forEach(vp => {
        const el = document.createElement('div');
        el.className = 'viewpoint-item';
        el.innerHTML = `
            <div class="viewpoint-speaker">${vp.speakerName}</div>
            <div class="viewpoint-text">${vp.text}</div>
        `;
        
        el.addEventListener('click', () => {
            if (vp.startTime !== undefined) {
                setCurrentTime(vp.startTime);
            }
        });
        
        container.appendChild(el);
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    document.getElementById(tab + 'Tab').classList.add('active');
}

document.addEventListener('DOMContentLoaded', init);
