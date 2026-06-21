/* ==========================================================================
   播客转写整理工具 - 核心逻辑
   ========================================================================== */

const state = {
    audioFile: null,
    audioUrl: null,
    audioLoaded: false,
    transcriptFile: null,
    transcriptLoaded: false,
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
    multiSelectMode: false,
    multiSelectedIds: new Set(),
    showTimestamps: true,
    autoScroll: true,
    pendingQuoteSelection: null
};

const speakerColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ec4899',
    '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6',
    '#ef4444', '#84cc16'
];

/* ---------- 示例数据 ---------- */
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

/* ==========================================================================
   工具函数
   ========================================================================== */
function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatTimeShort(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function parseTimestampToSeconds(str) {
    if (!str) return 0;
    str = str.trim().replace(',', '.');
    const parts = str.split(':');
    if (parts.length === 3) {
        const [h, m, s] = parts;
        return parseFloat(h) * 3600 + parseFloat(m) * 60 + parseFloat(s);
    } else if (parts.length === 2) {
        const [m, s] = parts;
        return parseFloat(m) * 60 + parseFloat(s);
    }
    return parseFloat(str) || 0;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounceRenderShownotesPreview() {
    const preview = document.getElementById('shownotesPreview');
    if (!preview || preview.style.display === 'none') return;
    clearTimeout(debounceRenderShownotesPreview._t);
    debounceRenderShownotesPreview._t = setTimeout(renderShownotesPreview, 150);
}

/* ==========================================================================
   初始化 & 事件绑定
   ========================================================================== */
function init() {
    state.speakers = [];
    bindEvents();
    bindTimelineClick();
    bindTimelineScrollSync();

    renderSpeakers();
    renderTimeline();
    renderTranscript();
    renderQuotes();
    renderChapters();
    renderViewpoints();
    updatePlayhead();

    setTimeout(() => {
        showToast('将音频文件拖入页面开始整理，也可同时拖入 SRT/VTT/JSON 转写稿');
    }, 400);
}

function bindEvents() {
    document.getElementById('importBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('selectFileBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('importTranscriptBtn').addEventListener('click', () => document.getElementById('transcriptInput').click());
    document.getElementById('fileInput').addEventListener('change', handleAudioFileSelect);
    document.getElementById('transcriptInput').addEventListener('change', handleTranscriptFileSelect);

    const uploadZone = document.getElementById('uploadZone');
    uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('dragover'); });
    uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('dragover'));
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        handleDroppedFiles(e.dataTransfer.files);
    });

    document.getElementById('playPauseBtn').addEventListener('click', togglePlay);
    document.getElementById('backwardBtn').addEventListener('click', () => seek(-5));
    document.getElementById('forwardBtn').addEventListener('click', () => seek(5));
    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        document.getElementById('audioPlayer').volume = e.target.value / 100;
    });
    document.getElementById('speedSelect').addEventListener('change', (e) => {
        document.getElementById('audioPlayer').playbackRate = parseFloat(e.target.value);
    });

    document.getElementById('zoomIn').addEventListener('click', () => setZoom(state.zoom + 25));
    document.getElementById('zoomOut').addEventListener('click', () => setZoom(Math.max(50, state.zoom - 25)));
    document.getElementById('zoomFit').addEventListener('click', () => setZoom(100));

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    document.getElementById('addSpeakerBtn').addEventListener('click', addSpeaker);
    document.getElementById('exportQuotesBtn').addEventListener('click', exportQuotes);
    document.getElementById('addChapterBtn').addEventListener('click', addChapter);
    document.getElementById('generateSummaryBtn').addEventListener('click', generateSummary);
    document.getElementById('generateViewpointsBtn').addEventListener('click', generateViewpoints);
    document.getElementById('exportShownotesBtn').addEventListener('click', exportShownotes);
    document.getElementById('togglePreviewBtn').addEventListener('click', toggleShownotesPreview);
    document.getElementById('copyShownotesBtn').addEventListener('click', copyShownotes);
    document.getElementById('downloadShownotesBtn').addEventListener('click', downloadShownotesMarkdown);

    const epTitle = document.getElementById('episodeTitle');
    const epDesc = document.getElementById('episodeDesc');
    if (epTitle) epTitle.addEventListener('input', debounceRenderShownotesPreview);
    if (epDesc) epDesc.addEventListener('input', debounceRenderShownotesPreview);

    document.getElementById('showTimestamps').addEventListener('change', (e) => {
        state.showTimestamps = e.target.checked;
        renderTranscript();
    });
    document.getElementById('autoScroll').addEventListener('change', (e) => {
        state.autoScroll = e.target.checked;
    });

    document.getElementById('multiSelectToggle').addEventListener('click', toggleMultiSelect);
    document.getElementById('makeChapterBtn').addEventListener('click', createChapterFromMultiSelect);

    document.addEventListener('click', (e) => {
        const menu = document.getElementById('contextMenu');
        if (!menu.contains(e.target)) menu.style.display = 'none';
    });

    document.addEventListener('mouseup', handleTextSelection);
    document.getElementById('confirmQuoteBtn').addEventListener('click', confirmPendingQuote);
    document.getElementById('cancelQuoteBtn').addEventListener('click', hideQuoteFloatBar);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideQuoteFloatBar();
        }
    });

    const audio = document.getElementById('audioPlayer');
    audio.addEventListener('timeupdate', onAudioTimeUpdate);
    audio.addEventListener('loadedmetadata', onAudioLoadedMetadata);
    audio.addEventListener('ended', () => { state.isPlaying = false; document.getElementById('playIcon').textContent = '▶'; });
    audio.addEventListener('play', () => { state.isPlaying = true; document.getElementById('playIcon').textContent = '⏸'; });
    audio.addEventListener('pause', () => { state.isPlaying = false; document.getElementById('playIcon').textContent = '▶'; });
}

/* ==========================================================================
   文件导入
   ========================================================================== */
function handleDroppedFiles(files) {
    const audioExts = ['.mp3', '.wav', '.m4a', '.ogg', '.flac', '.aac'];
    const transExts = ['.srt', '.vtt', '.json', '.txt'];
    let audioFile = null, transFile = null;
    Array.from(files).forEach(f => {
        const name = f.name.toLowerCase();
        if (audioExts.some(ext => name.endsWith(ext)) || f.type.startsWith('audio/')) {
            if (!audioFile) audioFile = f;
        } else if (transExts.some(ext => name.endsWith(ext))) {
            if (!transFile) transFile = f;
        }
    });
    if (audioFile) {
        if (transFile) {
            loadTranscriptFile(transFile).then(() => handleAudioFile(audioFile));
        } else {
            handleAudioFile(audioFile);
        }
    } else if (transFile) {
        loadTranscriptFile(transFile);
        alert('已导入转写稿，请再导入对应的音频文件。');
    }
}

function handleAudioFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleAudioFile(file);
}

function handleTranscriptFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        loadTranscriptFile(file).then(() => {
            if (state.audioLoaded) finalizeWorkspace();
        });
    }
}

function handleAudioFile(file) {
    state.audioFile = file;
    state.audioLoaded = true;
    if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    state.audioUrl = URL.createObjectURL(file);
    document.getElementById('audioPlayer').src = state.audioUrl;
    document.getElementById('fileName').textContent = file.name;
}

function onAudioLoadedMetadata() {
    const audio = document.getElementById('audioPlayer');
    const realDuration = audio.duration;
    if (realDuration && isFinite(realDuration) && realDuration > 0) {
        state.duration = realDuration;
    }
    document.getElementById('totalTime').textContent = formatTime(state.duration);
    if (state.utterances.length === 0) {
        generateMockUtterancesScaledToDuration(state.duration || 720);
    } else if (state.transcriptLoaded && state.duration > 0) {
        scaleUtterancesToDurationIfNeeded();
    }
    finalizeWorkspace();
}

function finalizeWorkspace() {
    if (state.speakers.length === 0) autoGenerateSpeakersFromUtterances();
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('workspace').style.display = 'grid';
    if (state.transcriptLoaded && state.transcriptFile) {
        const tn = document.getElementById('transcriptName');
        tn.style.display = 'inline-block';
        tn.textContent = '📄 ' + state.transcriptFile.name;
    }
    renderSpeakers();
    renderTimeline();
    renderTranscript();
    renderChapters();
    renderQuotes();
    renderViewpoints();
    updateQuoteCount();
    updateMultiSelectUI();
}

/* ---------- 转写稿解析 ---------- */
function loadTranscriptFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const name = file.name.toLowerCase();
            let parsed = null;
            try {
                if (name.endsWith('.srt')) parsed = parseSRT(content);
                else if (name.endsWith('.vtt')) parsed = parseVTT(content);
                else if (name.endsWith('.json')) parsed = parseJSONTranscript(content);
                else parsed = parsePlainText(content);
            } catch (err) {
                showToast('转写稿解析失败：' + err.message, 'error');
                resolve(); return;
            }
            if (parsed && parsed.utterances && parsed.utterances.length > 0) {
                state.utterances = parsed.utterances.map((u, idx) => ({
                    id: idx,
                    speakerId: u.speakerId != null ? u.speakerId : 0,
                    speakerName: u.speakerName || null,
                    text: u.text || '',
                    startTime: u.startTime || idx * 10,
                    endTime: u.endTime || (idx * 10 + 8)
                }));
                if (parsed.speakers && parsed.speakers.length > 0) {
                    state.speakers = parsed.speakers.map((s, idx) => ({
                        id: s.id != null ? s.id : idx,
                        name: s.name || `说话人${idx + 1}`,
                        color: speakerColors[idx % speakerColors.length]
                    }));
                }
                autoGenerateSpeakersFromUtterances();
                const maxEnd = Math.max(...state.utterances.map(u => u.endTime || 0));
                if (maxEnd > 0 && state.duration === 0) state.duration = maxEnd + 10;
                state.transcriptFile = file;
                state.transcriptLoaded = true;
                showToast(`转写稿已解析：${state.utterances.length} 句发言`);
                if (document.getElementById('autoSegment').checked && state.chapters.length === 0) {
                    autoGenerateChapters();
                }
            }
            resolve();
        };
        reader.onerror = () => { showToast('转写稿读取失败', 'error'); resolve(); };
        reader.readAsText(file, 'UTF-8');
    });
}

function parseSRT(content) {
    const blocks = content.trim().split(/\n\s*\n/);
    const utterances = [];
    const speakerMap = new Map();
    let speakerIdx = 0;
    blocks.forEach(block => {
        const lines = block.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return;
        let timeIdx = 0;
        if (/^\d+$/.test(lines[0].trim())) timeIdx = 1;
        if (timeIdx >= lines.length) return;
        const timeMatch = lines[timeIdx].match(/((?:\d{1,2}:)?\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[,\.]\d{1,3})/);
        if (!timeMatch) return;
        const startTime = parseTimestampToSeconds(timeMatch[1]);
        const endTime = parseTimestampToSeconds(timeMatch[2]);
        let text = lines.slice(timeIdx + 1).join(' ').trim();
        let speakerName = null;
        const nameMatch = text.match(/^([^:：]{1,15})[:：]\s*(.*)$/);
        if (nameMatch && nameMatch[1].length < 12) {
            speakerName = nameMatch[1].trim();
            text = nameMatch[2].trim();
        }
        let speakerId = 0;
        if (speakerName) {
            if (!speakerMap.has(speakerName)) speakerMap.set(speakerName, speakerIdx++);
            speakerId = speakerMap.get(speakerName);
        }
        utterances.push({ speakerId, speakerName, text, startTime, endTime });
    });
    const speakers = [];
    speakerMap.forEach((id, name) => speakers.push({ id, name }));
    return { utterances, speakers: speakers.length ? speakers : [{ id: 0, name: '说话人1' }] };
}

function parseVTT(content) {
    let body = content.replace(/^WEBVTT\s*\n?/i, '').replace(/^\uFEFF/, '');
    const blocks = body.trim().split(/\n\s*\n/);
    const utterances = [];
    const speakerMap = new Map();
    let speakerIdx = 0;
    blocks.forEach(block => {
        const lines = block.split(/\r?\n/).filter(l => l.trim());
        if (lines.length < 2) return;
        let timeIdx = -1;
        for (let i = 0; i < lines.length; i++) if (lines[i].includes('-->')) { timeIdx = i; break; }
        if (timeIdx < 0) return;
        const timeMatch = lines[timeIdx].match(/((?:\d{1,2}:)?\d{2}:\d{2}[,\.]\d{1,3})\s*-->\s*((?:\d{1,2}:)?\d{2}:\d{2}[,\.]\d{1,3})/);
        if (!timeMatch) return;
        const startTime = parseTimestampToSeconds(timeMatch[1]);
        const endTime = parseTimestampToSeconds(timeMatch[2]);
        let text = lines.slice(timeIdx + 1).join(' ').trim();
        let speakerName = null;
        const vMatch = text.match(/^<v\s+([^>]+)>(.*?)(?:<\/v>)?$/i);
        if (vMatch) {
            speakerName = vMatch[1].trim();
            text = vMatch[2].trim();
        } else {
            const nameMatch = text.match(/^([^:：]{1,15})[:：]\s*(.*)$/);
            if (nameMatch && nameMatch[1].length < 12) {
                speakerName = nameMatch[1].trim();
                text = nameMatch[2].trim();
            }
        }
        let speakerId = 0;
        if (speakerName) {
            if (!speakerMap.has(speakerName)) speakerMap.set(speakerName, speakerIdx++);
            speakerId = speakerMap.get(speakerName);
        }
        utterances.push({ speakerId, speakerName, text, startTime, endTime });
    });
    const speakers = [];
    speakerMap.forEach((id, name) => speakers.push({ id, name }));
    return { utterances, speakers: speakers.length ? speakers : [{ id: 0, name: '说话人1' }] };
}

function parseJSONTranscript(content) {
    const data = JSON.parse(content);

    function normalizeUtterances(items) {
        const nameToId = new Map();
        let nextId = 0;
        const utterances = items.map(item => {
            let rawSpeakerId = item.speaker_id ?? item.speakerId ?? item.speaker;
            let speakerName = item.speaker_name ?? item.speakerName ?? null;
            let speakerId = 0;

            if (rawSpeakerId != null && rawSpeakerId !== '') {
                if (typeof rawSpeakerId === 'number' || !isNaN(Number(rawSpeakerId))) {
                    speakerId = Number(rawSpeakerId);
                    if (speakerName && !nameToId.has(speakerName)) {
                        nameToId.set(speakerName, speakerId);
                    }
                } else {
                    const nameStr = String(rawSpeakerId).trim();
                    if (!speakerName) speakerName = nameStr;
                    if (nameToId.has(nameStr)) {
                        speakerId = nameToId.get(nameStr);
                    } else {
                        while (Array.from(nameToId.values()).includes(nextId)) nextId++;
                        speakerId = nextId;
                        nameToId.set(nameStr, speakerId);
                        nextId++;
                    }
                }
            }

            if (speakerName && !nameToId.has(speakerName)) {
                if (typeof rawSpeakerId === 'number' || (rawSpeakerId != null && !isNaN(Number(rawSpeakerId)))) {
                    nameToId.set(speakerName, Number(rawSpeakerId));
                }
            }

            return {
                speakerId,
                speakerName,
                text: item.text ?? item.content ?? item.utterance ?? '',
                startTime: parseTimestampToSeconds(item.start ?? item.start_time ?? item.startTime ?? 0),
                endTime: parseTimestampToSeconds(item.end ?? item.end_time ?? item.endTime ?? 5)
            };
        });

        const idToName = new Map();
        utterances.forEach(u => {
            if (u.speakerName && !idToName.has(u.speakerId)) {
                idToName.set(u.speakerId, u.speakerName);
            }
        });

        const speakers = [];
        const addedIds = new Set();
        utterances.forEach(u => {
            if (!addedIds.has(u.speakerId)) {
                addedIds.add(u.speakerId);
                const name = idToName.get(u.speakerId) || `说话人${u.speakerId + 1}`;
                speakers.push({ id: u.speakerId, name });
            }
        });
        speakers.sort((a, b) => a.id - b.id);
        if (speakers.length === 0) speakers.push({ id: 0, name: '说话人1' });
        return { utterances, speakers };
    }

    if (Array.isArray(data)) {
        return normalizeUtterances(data);
    }
    if (data && Array.isArray(data.segments)) {
        const result = normalizeUtterances(data.segments);
        if (Array.isArray(data.speakers) && data.speakers.length > 0) {
            const existingMap = new Map(result.speakers.map(s => [s.id, s]));
            data.speakers.forEach((s, i) => {
                const id = s.id ?? i;
                if (existingMap.has(id)) {
                    existingMap.get(id).name = s.name ?? s.label ?? existingMap.get(id).name;
                } else {
                    result.speakers.push({ id, name: s.name ?? s.label ?? `说话人${i + 1}` });
                }
            });
        }
        return result;
    }
    if (data && Array.isArray(data.utterances)) {
        return normalizeUtterances(data.utterances);
    }
    throw new Error('JSON 格式不支持');
}

function parsePlainText(content) {
    const lines = content.split(/\r?\n/).filter(l => l.trim());
    const utterances = [];
    const speakerMap = new Map();
    let speakerIdx = 0, currentTime = 0;
    lines.forEach(line => {
        const nameMatch = line.match(/^([^:：]{1,15})[:：]\s*(.*)$/);
        let speakerName = null, text = line.trim();
        if (nameMatch && nameMatch[1].length < 12) { speakerName = nameMatch[1].trim(); text = nameMatch[2].trim(); }
        if (!text) return;
        let speakerId = 0;
        if (speakerName) {
            if (!speakerMap.has(speakerName)) speakerMap.set(speakerName, speakerIdx++);
            speakerId = speakerMap.get(speakerName);
        }
        const duration = Math.max(3, text.length * 0.12);
        utterances.push({ speakerId, speakerName, text, startTime: currentTime, endTime: currentTime + duration });
        currentTime += duration + 0.5;
    });
    const speakers = [];
    speakerMap.forEach((id, name) => speakers.push({ id, name }));
    return { utterances, speakers: speakers.length ? speakers : [{ id: 0, name: '说话人1' }] };
}

function autoGenerateSpeakersFromUtterances() {
    const usedIds = new Set();
    state.utterances.forEach(u => usedIds.add(u.speakerId));
    const existingIds = new Set(state.speakers.map(s => s.id));
    usedIds.forEach(id => {
        if (!existingIds.has(id)) {
            const nameFromUtt = state.utterances.find(u => u.speakerId === id && u.speakerName)?.speakerName;
            state.speakers.push({
                id, name: nameFromUtt || `说话人${id + 1}`,
                color: speakerColors[state.speakers.length % speakerColors.length]
            });
        }
    });
    state.speakers.sort((a, b) => a.id - b.id);
}

function scaleUtterancesToDurationIfNeeded() {
    if (state.utterances.length === 0 || state.duration <= 0) return;
    const lastEnd = Math.max(...state.utterances.map(u => u.endTime));
    if (lastEnd <= state.duration) return;
    const ratio = state.duration / lastEnd;
    state.utterances.forEach(u => { u.startTime *= ratio; u.endTime *= ratio; });
}

function generateMockUtterancesScaledToDuration(targetDuration) {
    const items = [];
    let currentTime = 0;
    const estimatedPerChar = 0.14;
    let totalEstimated = 0;
    mockTranscripts.forEach(item => { totalEstimated += item.text.length * estimatedPerChar + 1.5; });
    const scaleRatio = totalEstimated > 0 ? targetDuration / (totalEstimated * 1.1) : 1;
    mockTranscripts.forEach((item, index) => {
        const duration = Math.max(2, item.text.length * estimatedPerChar * scaleRatio + 1);
        items.push({
            id: index, speakerId: item.speaker, text: item.text,
            startTime: currentTime, endTime: currentTime + duration
        });
        currentTime += duration + 0.3 * scaleRatio;
    });
    if (!state.duration || state.duration === 0) state.duration = currentTime + 10;
    state.utterances = items;
    state.speakers = [
        { id: 0, name: '主持人', color: speakerColors[0] },
        { id: 1, name: '李博士', color: speakerColors[1] },
        { id: 2, name: '小周', color: speakerColors[2] }
    ];
    if (state.chapters.length === 0) autoGenerateChapters();
}

/* ==========================================================================
   播放控制
   ========================================================================== */
function togglePlay() {
    const audio = document.getElementById('audioPlayer');
    if (state.isPlaying) audio.pause(); else audio.play();
}
function seek(seconds) {
    const audio = document.getElementById('audioPlayer');
    audio.currentTime = Math.max(0, Math.min(state.duration || 0, audio.currentTime + seconds));
}
function setCurrentTime(time) {
    const audio = document.getElementById('audioPlayer');
    audio.currentTime = Math.max(0, Math.min(state.duration || 0, time));
}
function onAudioTimeUpdate() {
    const audio = document.getElementById('audioPlayer');
    state.currentTime = audio.currentTime;
    updatePlayhead();
    document.getElementById('currentTime').textContent = formatTime(audio.currentTime);
    const activeUtt = state.utterances.find(u =>
        audio.currentTime >= u.startTime && audio.currentTime < u.endTime
    );
    if (activeUtt && activeUtt.id !== state.selectedUtteranceId) {
        selectUtterance(activeUtt.id, state.autoScroll);
    }
}

/* ==========================================================================
   时间轴
   ========================================================================== */
function setZoom(zoom) {
    state.zoom = Math.max(50, Math.min(800, zoom));
    document.getElementById('zoomLevel').textContent = state.zoom + '%';
    renderTimeline();
}

function renderTimeline() {
    const ruler = document.getElementById('timelineRuler');
    const trackInner = document.getElementById('timelineTrackInner');
    const timelineInner = document.getElementById('timelineInner');
    ruler.innerHTML = '';
    trackInner.innerHTML = '';
    const totalSeconds = Math.max(state.duration, 1);
    timelineInner.style.width = state.zoom + '%';
    timelineInner.style.minWidth = '100%';

    const scroll = document.getElementById('timelineScroll');
    const contentWidthPx = scroll.clientWidth * (state.zoom / 100);
    const pxPerSecond = contentWidthPx / totalSeconds;
    const interval = getTickInterval(totalSeconds, pxPerSecond);

    for (let t = 0; t <= totalSeconds + interval; t += interval) {
        if (t > totalSeconds + 0.001) continue;
        const percent = (t / totalSeconds) * 100;
        const isMajor = t % (interval * 2) === 0;
        const tick = document.createElement('div');
        tick.className = 'ruler-tick' + (isMajor ? ' major' : '');
        tick.style.left = percent + '%';
        ruler.appendChild(tick);
        if (isMajor) {
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
        const duration = Math.max(0.05, utterance.endTime - utterance.startTime);
        const widthPercent = (duration / totalSeconds) * 100;
        const segment = document.createElement('div');
        segment.className = 'speaker-segment';
        segment.style.left = startPercent + '%';
        segment.style.width = widthPercent + '%';
        segment.style.backgroundColor = speaker.color;
        segment.dataset.utteranceId = utterance.id;
        segment.title = `${speaker.name} ${formatTimeShort(utterance.startTime)}`;
        if (widthPercent > 2) {
            const label = document.createElement('div');
            label.className = 'speaker-segment-label';
            label.textContent = speaker.name;
            segment.appendChild(label);
        }
        segment.addEventListener('click', (e) => {
            e.stopPropagation();
            setCurrentTime(utterance.startTime);
            selectUtterance(utterance.id, true);
        });
        trackInner.appendChild(segment);
    });

    updatePlayhead();
    bindTimelineClick();
    bindTimelineScrollSync();
}

function getTickInterval(totalSeconds, pxPerSecond) {
    const minPxGap = state.zoom <= 100 ? 60 : 40;
    const minSeconds = minPxGap / Math.max(pxPerSecond, 0.0001);
    const candidates = [1, 2, 5, 10, 15, 30, 60, 120, 180, 300, 600, 900, 1800, 3600];
    for (const c of candidates) if (c >= minSeconds) return c;
    return candidates[candidates.length - 1];
}

function bindTimelineClick() {
    const scroll = document.getElementById('timelineScroll');
    scroll.onclick = (e) => {
        if (e.target.closest('.speaker-segment')) return;
        const rect = scroll.getBoundingClientRect();
        const clickX = e.clientX - rect.left + scroll.scrollLeft;
        const contentWidthPx = scroll.clientWidth * (state.zoom / 100);
        const percent = clickX / contentWidthPx;
        setCurrentTime(percent * state.duration);
    };
}

function bindTimelineScrollSync() {
    document.getElementById('timelineScroll').onscroll = updatePlayhead;
}

function updatePlayhead() {
    if (!state.duration) return;
    const scroll = document.getElementById('timelineScroll');
    const playhead = document.getElementById('playhead');
    const contentWidthPx = scroll.clientWidth * (state.zoom / 100);
    const absoluteX = (state.currentTime / state.duration) * contentWidthPx;
    const visibleX = absoluteX - scroll.scrollLeft;
    playhead.style.left = visibleX + 'px';
    const container = document.getElementById('timelineContainer');
    playhead.style.display = (visibleX < -10 || visibleX > container.clientWidth + 10) ? 'none' : 'block';
}

/* ==========================================================================
   说话人管理
   ========================================================================== */
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
                <div class="speaker-name" title="${escapeHtml(speaker.name)}">${escapeHtml(speaker.name)}</div>
                <div class="speaker-duration">${formatTimeShort(duration)}</div>
            </div>`;
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
                speaker.name = input.value.trim() || '说话人' + (speaker.id + 1);
                renderSpeakers(); renderTimeline(); renderTranscript();
            });
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') input.blur(); });
        });
        item.addEventListener('dragover', (e) => { e.preventDefault(); item.classList.add('drag-over'); });
        item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            reassignSpeaker(parseInt(state.draggedUtteranceId), speaker.id);
        });
        container.appendChild(item);
    });
}

function getSpeakerTotalDuration(speakerId) {
    return state.utterances.filter(u => u.speakerId === speakerId)
        .reduce((sum, u) => sum + Math.max(0, u.endTime - u.startTime), 0);
}

function addSpeaker() {
    const newId = state.speakers.length > 0
        ? Math.max(...state.speakers.map(s => s.id)) + 1 : 0;
    state.speakers.push({
        id: newId, name: '说话人' + (state.speakers.length + 1),
        color: speakerColors[state.speakers.length % speakerColors.length]
    });
    renderSpeakers();
}

function reassignSpeaker(utteranceId, newSpeakerId) {
    const utterance = state.utterances.find(u => u.id === utteranceId);
    if (utterance) {
        utterance.speakerId = newSpeakerId;
        renderSpeakers(); renderTimeline(); renderTranscript();
    }
}

/* ==========================================================================
   转写文本
   ========================================================================== */
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
        const initial = (speaker.name || '?').charAt(0);
        const timeDisplay = state.showTimestamps
            ? `<span class="utterance-time">${formatTimeShort(utterance.startTime)}</span>` : '';
        const isChecked = state.multiSelectedIds.has(utterance.id);
        el.innerHTML = `
            <input type="checkbox" class="utterance-checkbox" ${isChecked ? 'checked' : ''} data-utt-id="${utterance.id}">
            <div class="utterance-avatar" style="background: ${speaker.color}">${initial}</div>
            <div class="utterance-body">
                <div class="utterance-header">
                    <span class="utterance-speaker">${escapeHtml(speaker.name)}</span>
                    ${timeDisplay}
                </div>
                <div class="utterance-text" data-utt-id="${utterance.id}">${escapeHtml(utterance.text)}</div>
                <div class="utterance-actions">
                    <button class="utterance-action-btn" title="编辑" data-action="edit">✏️</button>
                    <button class="utterance-action-btn" title="添加到金句" data-action="quote">⭐</button>
                    <button class="utterance-action-btn" title="从此处新建章节" data-action="chapter">📑</button>
                    <button class="utterance-action-btn" title="复制" data-action="copy">📋</button>
                </div>
                <div class="utterance-edit-panel" style="display:none;" data-utt-id="${utterance.id}">
                    <div class="edit-row">
                        <label>说话人</label>
                        <select class="edit-speaker">
                            ${state.speakers.map(sp =>
                                `<option value="${sp.id}" ${sp.id === utterance.speakerId ? 'selected' : ''}>${escapeHtml(sp.name)}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="edit-row edit-time">
                        <label>开始时间</label>
                        <input type="text" class="edit-start-time" value="${formatTime(utterance.startTime)}" placeholder="00:00:00">
                        <label>结束时间</label>
                        <input type="text" class="edit-end-time" value="${formatTime(utterance.endTime)}" placeholder="00:00:00">
                    </div>
                    <div class="edit-row">
                        <label>文本内容</label>
                        <textarea class="edit-text" rows="3">${escapeHtml(utterance.text)}</textarea>
                    </div>
                    <div class="edit-actions">
                        <button class="btn btn-primary btn-sm edit-save-btn">💾 保存</button>
                        <button class="btn btn-outline btn-sm edit-cancel-btn">取消</button>
                        <div class="edit-spacer"></div>
                        <button class="btn btn-outline btn-sm edit-split-btn" title="在光标位置拆分为两句">✂️ 拆分</button>
                        <button class="btn btn-outline btn-sm edit-merge-prev-btn" title="与上一句合并">⬆️ 合并上句</button>
                        <button class="btn btn-outline btn-sm edit-merge-next-btn" title="与下一句合并">⬇️ 合并下句</button>
                    </div>
                </div>
            </div>`;
        el.addEventListener('dragstart', (e) => {
            state.draggedUtteranceId = utterance.id;
            el.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        el.addEventListener('dragend', () => {
            el.classList.remove('dragging');
            state.draggedUtteranceId = null;
        });
        el.addEventListener('click', (e) => {
            if (state.multiSelectMode) {
                if (e.target.classList.contains('utterance-checkbox')) {
                    toggleMultiSelectOne(utterance.id, e.target.checked);
                } else {
                    const cb = el.querySelector('.utterance-checkbox');
                    cb.checked = !cb.checked;
                    toggleMultiSelectOne(utterance.id, cb.checked);
                }
                return;
            }
            if (e.target.closest('.utterance-action-btn') || e.target.closest('.utterance-checkbox')) return;
            selectUtterance(utterance.id);
            setCurrentTime(utterance.startTime);
        });
        el.addEventListener('dblclick', (e) => {
            if (e.target.closest('.utterance-action-btn') || e.target.closest('.utterance-checkbox')) return;
            setCurrentTime(utterance.startTime);
            if (!state.isPlaying) togglePlay();
        });
        el.querySelector('[data-action="quote"]').addEventListener('click', (e) => {
            e.stopPropagation(); addQuote(utterance, null);
        });
        el.querySelector('[data-action="chapter"]').addEventListener('click', (e) => {
            e.stopPropagation(); addChapterFromUtterance(utterance);
        });
        el.querySelector('[data-action="copy"]').addEventListener('click', (e) => {
            e.stopPropagation(); navigator.clipboard.writeText(utterance.text);
        });
        el.querySelector('[data-action="edit"]').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleEditPanel(utterance.id, el);
        });
        const editPanel = el.querySelector('.utterance-edit-panel');
        editPanel.addEventListener('click', (e) => e.stopPropagation());
        editPanel.querySelector('.edit-save-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            saveUtteranceEdit(utterance.id, editPanel);
        });
        editPanel.querySelector('.edit-cancel-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            editPanel.style.display = 'none';
        });
        editPanel.querySelector('.edit-split-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            splitUtterance(utterance.id, editPanel);
        });
        editPanel.querySelector('.edit-merge-prev-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            mergeUtterance(utterance.id, 'prev');
        });
        editPanel.querySelector('.edit-merge-next-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            mergeUtterance(utterance.id, 'next');
        });
        el.querySelector('.utterance-checkbox').addEventListener('change', (e) => {
            toggleMultiSelectOne(utterance.id, e.target.checked);
        });
        el.addEventListener('contextmenu', (e) => {
            e.preventDefault(); showContextMenu(e.clientX, e.clientY, utterance);
        });
        if (state.selectedUtteranceId === utterance.id) el.classList.add('selected');
        if (state.multiSelectedIds.has(utterance.id)) el.classList.add('multi-selected');
        container.appendChild(el);
    });
}

function selectUtterance(id, autoScroll = false) {
    state.selectedUtteranceId = id;
    document.querySelectorAll('.utterance').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.utteranceId) === id);
    });
    document.querySelectorAll('.speaker-segment').forEach(el => {
        el.classList.toggle('active', parseInt(el.dataset.utteranceId) === id);
    });
    if (autoScroll) {
        const el = document.querySelector(`.utterance[data-utterance-id="${id}"]`);
        if (el) {
            const container = document.getElementById('transcriptContent');
            const elTop = el.offsetTop;
            const elBottom = elTop + el.offsetHeight;
            const viewTop = container.scrollTop;
            const viewBottom = viewTop + container.clientHeight;
            if (elTop < viewTop + 40 || elBottom > viewBottom - 40) {
                container.scrollTo({ top: elTop - 80, behavior: 'smooth' });
            }
        }
    }
}

/* ---------- 编辑功能 ---------- */
function toggleEditPanel(uttId, el) {
    const panel = el.querySelector('.utterance-edit-panel');
    const isOpen = panel.style.display !== 'none';
    document.querySelectorAll('.utterance-edit-panel').forEach(p => {
        if (p !== panel) p.style.display = 'none';
    });
    panel.style.display = isOpen ? 'none' : 'block';
}

function saveUtteranceEdit(uttId, panel) {
    const utt = state.utterances.find(u => u.id === uttId);
    if (!utt) return;
    const spId = parseInt(panel.querySelector('.edit-speaker').value);
    const startTime = parseTimestampToSeconds(panel.querySelector('.edit-start-time').value);
    const endTime = parseTimestampToSeconds(panel.querySelector('.edit-end-time').value);
    const text = panel.querySelector('.edit-text').value.trim();

    if (!text) { showToast('文本不能为空', 'error'); return; }
    if (isNaN(startTime) || isNaN(endTime)) { showToast('时间格式不正确', 'error'); return; }
    if (endTime <= startTime) { showToast('结束时间必须大于开始时间', 'error'); return; }

    utt.speakerId = spId;
    utt.startTime = Math.max(0, startTime);
    utt.endTime = Math.min(state.duration || endTime, endTime);
    utt.text = text;

    updateQuotesAfterUttChange(uttId);
    updateChaptersAfterUttChange();

    renderSpeakers(); renderTimeline(); renderTranscript();
    renderQuotes(); renderChapters(); renderViewpoints();
    debounceRenderShownotesPreview();
    showToast('修改已保存');
}

function splitUtterance(uttId, panel) {
    const utt = state.utterances.find(u => u.id === uttId);
    if (!utt) return;
    const textarea = panel.querySelector('.edit-text');
    const cursorPos = textarea.selectionStart;
    const fullText = textarea.value;

    if (cursorPos === 0 || cursorPos === fullText.length) {
        showToast('请先在文本中点击选择拆分位置', 'error');
        return;
    }

    const leftText = fullText.substring(0, cursorPos).trim();
    const rightText = fullText.substring(cursorPos).trim();
    if (!leftText || !rightText) {
        showToast('拆分后两边都不能为空', 'error');
        return;
    }

    const midTime = utt.startTime + (utt.endTime - utt.startTime) * (cursorPos / fullText.length);
    const idx = state.utterances.findIndex(u => u.id === uttId);
    if (idx < 0) return;

    const newUtt = {
        id: Date.now() + Math.random(),
        speakerId: utt.speakerId,
        speakerName: utt.speakerName || null,
        text: rightText,
        startTime: midTime,
        endTime: utt.endTime
    };

    utt.text = leftText;
    utt.endTime = midTime;
    state.utterances.splice(idx + 1, 0, newUtt);

    state.chapters.forEach(ch => {
        if (ch.utteranceIds && ch.utteranceIds.includes(uttId)) {
            ch.utteranceIds.splice(ch.utteranceIds.indexOf(uttId) + 1, 0, newUtt.id);
        }
    });

    updateQuotesAfterUttChange(uttId);
    updateChaptersAfterUttChange();

    renderSpeakers(); renderTimeline(); renderTranscript();
    renderChapters();
    debounceRenderShownotesPreview();
    showToast('已拆分为两句');
}

function mergeUtterance(uttId, direction) {
    const idx = state.utterances.findIndex(u => u.id === uttId);
    if (idx < 0) return;
    const targetIdx = direction === 'prev' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= state.utterances.length) {
        showToast('没有可合并的句子', 'error');
        return;
    }

    const first = direction === 'prev' ? state.utterances[targetIdx] : state.utterances[idx];
    const second = direction === 'prev' ? state.utterances[idx] : state.utterances[targetIdx];

    first.text = first.text + second.text;
    first.endTime = second.endTime;

    state.utterances.splice(targetIdx > idx ? targetIdx : idx, 1);

    updateQuotesAfterUttChange(second.id, first.id);
    updateQuotesAfterUttChange(first.id);
    updateChaptersAfterUttChange();

    renderSpeakers(); renderTimeline(); renderTranscript();
    renderQuotes(); renderChapters(); renderViewpoints();
    debounceRenderShownotesPreview();
    showToast('已合并两句');
}

function updateQuotesAfterUttChange(oldUttId, newUttId = null) {
    state.quotes.forEach(q => {
        if (q.utteranceId === oldUttId) {
            if (newUttId != null) {
                q.utteranceId = newUttId;
            }
            const utt = state.utterances.find(u => u.id === (newUttId != null ? newUttId : oldUttId));
            if (utt) {
                const sp = state.speakers.find(s => s.id === utt.speakerId);
                q.speakerName = sp ? sp.name : q.speakerName;
                q.color = sp ? sp.color : q.color;
                q.startTime = utt.startTime;
                q.endTime = utt.endTime;
                if (!q.isPartial) {
                    q.text = utt.text;
                }
            }
        }
    });
    updateQuoteCount();
}

function updateChaptersAfterUttChange() {
    state.chapters.forEach(ch => {
        if (ch.utteranceIds && ch.utteranceIds.length > 0) {
            const validIds = ch.utteranceIds.filter(id => state.utterances.some(u => u.id === id));
            ch.utteranceIds = validIds;
            if (validIds.length > 0) {
                const utts = validIds.map(id => state.utterances.find(u => u.id === id)).filter(Boolean);
                ch.startTime = Math.min(...utts.map(u => u.startTime));
                ch.endTime = Math.max(...utts.map(u => u.endTime));
                const uniqueSpeakers = [];
                const sids = new Set();
                utts.forEach(u => {
                    if (!sids.has(u.speakerId)) {
                        sids.add(u.speakerId);
                        const sp = state.speakers.find(s => s.id === u.speakerId);
                        if (sp) uniqueSpeakers.push({ id: sp.id, name: sp.name, color: sp.color });
                    }
                });
                if (uniqueSpeakers.length > 0) {
                    ch.speakers = uniqueSpeakers;
                }
            }
        }
    });
}

/* ---------- 多选模式 ---------- */
function toggleMultiSelect() {
    state.multiSelectMode = !state.multiSelectMode;
    const btn = document.getElementById('multiSelectToggle');
    if (state.multiSelectMode) {
        btn.classList.add('active');
        btn.innerHTML = '<span>☑</span> 退出多选';
        document.body.classList.add('multi-select-mode');
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<span>☐</span> 多选模式';
        state.multiSelectedIds.clear();
        document.body.classList.remove('multi-select-mode');
        updateMultiSelectUI();
    }
    renderTranscript();
}

function toggleMultiSelectOne(id, checked) {
    if (checked) state.multiSelectedIds.add(id);
    else state.multiSelectedIds.delete(id);
    document.querySelectorAll('.utterance').forEach(el => {
        const uid = parseInt(el.dataset.utteranceId);
        el.classList.toggle('multi-selected', state.multiSelectedIds.has(uid));
    });
    updateMultiSelectUI();
}

function updateMultiSelectUI() {
    const chapBtn = document.getElementById('makeChapterBtn');
    const countEl = document.getElementById('selectedCount');
    const n = state.multiSelectedIds.size;
    if (n > 0) {
        chapBtn.style.display = 'inline-flex';
        countEl.style.display = 'inline-block';
        countEl.textContent = `已选 ${n} 句`;
    } else {
        chapBtn.style.display = 'none';
        countEl.style.display = 'none';
    }
}

function createChapterFromMultiSelect() {
    const ids = Array.from(state.multiSelectedIds).sort((a, b) => a - b);
    if (ids.length === 0) return;
    const selectedUtts = ids
        .map(id => state.utterances.find(u => u.id === id))
        .filter(Boolean)
        .sort((a, b) => a.startTime - b.startTime);
    const startTime = selectedUtts[0].startTime;
    const endTime = selectedUtts[selectedUtts.length - 1].endTime;
    const uniqueSpeakers = [];
    const speakerIds = new Set();
    selectedUtts.forEach(u => {
        if (!speakerIds.has(u.speakerId)) {
            speakerIds.add(u.speakerId);
            const sp = state.speakers.find(s => s.id === u.speakerId);
            if (sp) uniqueSpeakers.push(sp);
        }
    });
    const allText = selectedUtts.map(u => u.text).join(' ');
    const summary = autoGenerateChapterSummary(selectedUtts, uniqueSpeakers);
    const title = autoGenerateChapterTitle(selectedUtts, allText);
    const keywords = autoExtractKeywords(allText, uniqueSpeakers);
    const chapter = {
        title, startTime, endTime, summary, keywords,
        speakers: uniqueSpeakers.map(s => ({ id: s.id, name: s.name, color: s.color })),
        utteranceIds: ids
    };
    let inserted = false;
    for (let i = 0; i < state.chapters.length; i++) {
        if (state.chapters[i].startTime > startTime) {
            state.chapters.splice(i, 0, chapter);
            inserted = true; break;
        }
    }
    if (!inserted) state.chapters.push(chapter);
    uniqueSpeakers.forEach(sp => {
        const keyPoints = selectedUtts
            .filter(u => u.speakerId === sp.id && u.text.length > 10)
            .slice(0, 2)
            .map(u => u.text.length > 60 ? u.text.substring(0, 60) + '...' : u.text);
        keyPoints.forEach(text => {
            state.viewpoints.push({
                id: Date.now() + Math.random(),
                speakerId: sp.id, speakerName: sp.name,
                text, color: sp.color,
                startTime: selectedUtts.find(u => u.text.includes(text.replace('...', '')))?.startTime || startTime
            });
        });
    });
    state.multiSelectedIds.clear();
    state.multiSelectMode = false;
    document.body.classList.remove('multi-select-mode');
    const btn = document.getElementById('multiSelectToggle');
    btn.classList.remove('active');
    btn.innerHTML = '<span>☐</span> 多选模式';
    updateMultiSelectUI();
    renderChapters(); renderViewpoints(); renderTranscript();
    switchTab('chapters');
}

/* ---------- 部分文字摘录 ---------- */
function handleTextSelection(e) {
    if (e.target.closest('#contextMenu') || e.target.closest('.quote-float-bar')) return;
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (!text || text.length < 2) {
        state.pendingQuoteSelection = null;
        document.getElementById('quoteFloatBar').style.display = 'none';
        return;
    }
    const anchorNode = selection.anchorNode;
    const focusNode = selection.focusNode;
    if (!anchorNode || !focusNode) return;
    const anchorUttEl = (anchorNode.nodeType === 1 ? anchorNode : anchorNode.parentElement).closest?.('.utterance-text');
    const focusUttEl = (focusNode.nodeType === 1 ? focusNode : focusNode.parentElement).closest?.('.utterance-text');
    if (!anchorUttEl || !focusUttEl || anchorUttEl !== focusUttEl) {
        document.getElementById('quoteFloatBar').style.display = 'none';
        return;
    }
    const uttId = parseInt(anchorUttEl.dataset.uttId);
    const utterance = state.utterances.find(u => u.id === uttId);
    if (!utterance) return;
    state.pendingQuoteSelection = { utterance, selectedText: text };
    const preview = text.length > 40 ? text.substring(0, 40) + '...' : text;
    document.getElementById('quotePreview').textContent = preview;
    document.getElementById('quoteFloatBar').style.display = 'flex';
}

function confirmPendingQuote() {
    if (!state.pendingQuoteSelection) return;
    const { utterance, selectedText } = state.pendingQuoteSelection;
    addQuote(utterance, selectedText);
    document.getElementById('quoteFloatBar').style.display = 'none';
    window.getSelection().removeAllRanges();
    state.pendingQuoteSelection = null;
}

/* ---------- 右键菜单 ---------- */
function showContextMenu(x, y, utterance) {
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'block';
    menu.style.left = Math.min(x, window.innerWidth - 220) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 200) + 'px';
    menu.querySelectorAll('.context-menu-item').forEach(item => {
        item.onclick = () => {
            handleContextAction(item.dataset.action, utterance);
            menu.style.display = 'none';
        };
    });
}

function handleContextAction(action, utterance) {
    switch (action) {
        case 'quote': addQuote(utterance, null); break;
        case 'chapter': addChapterFromUtterance(utterance); break;
        case 'copy': navigator.clipboard.writeText(utterance.text); break;
        case 'copyWithTime':
            navigator.clipboard.writeText(`[${formatTimeShort(utterance.startTime)}] ${utterance.text}`);
            break;
    }
}

/* ==========================================================================
   金句摘录
   ========================================================================== */
function addQuote(utterance, partialText) {
    const isPartial = partialText && partialText.trim().length > 0 &&
        partialText.trim() !== utterance.text.trim();
    const finalText = isPartial ? partialText.trim() : utterance.text;
    const exists = state.quotes.find(q =>
        q.utteranceId === utterance.id &&
        ((q.isPartial && q.text === finalText) || (!q.isPartial && !isPartial))
    );
    if (exists) return;
    const speaker = state.speakers.find(s => s.id === utterance.speakerId);
    const speakerName = speaker ? speaker.name : (utterance.speakerName || `说话人${utterance.speakerId + 1}`);
    state.quotes.push({
        id: Date.now() + Math.random(),
        utteranceId: utterance.id,
        text: finalText,
        speakerName,
        startTime: utterance.startTime,
        endTime: utterance.endTime,
        color: speaker ? speaker.color : '#999',
        isPartial
    });
    renderQuotes(); updateQuoteCount();
}

function renderQuotes() {
    const container = document.getElementById('quoteList');
    if (state.quotes.length === 0) {
        container.innerHTML = '<div class="empty-state">选中或框选文字添加摘录</div>';
    } else {
        container.innerHTML = '';
        state.quotes.forEach(quote => {
            const el = document.createElement('div');
            el.className = 'quote-item' + (quote.isPartial ? ' is-partial' : '');
            el.innerHTML = `
                <div class="quote-text">${escapeHtml(quote.text)}</div>
                <div class="quote-meta">
                    <span>${escapeHtml(quote.speakerName)} · ${formatTimeShort(quote.startTime)}</span>
                    <span class="quote-delete" data-quote-id="${quote.id}">删除</span>
                </div>`;
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('quote-delete')) return;
                setCurrentTime(quote.startTime);
                if (!state.isPlaying) togglePlay();
            });
            el.querySelector('.quote-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                state.quotes = state.quotes.filter(q => String(q.id) !== String(quote.id));
                renderQuotes(); updateQuoteCount();
            });
            container.appendChild(el);
        });
    }
    debounceRenderShownotesPreview();
}

function updateQuoteCount() {
    document.getElementById('quoteCount').textContent = state.quotes.length;
}

function exportQuotes() {
    if (state.quotes.length === 0) { alert('还没有金句摘录哦～'); return; }
    const ep = document.getElementById('episodeTitle').value;
    let content = '金句摘录\n' + '='.repeat(50) + '\n';
    if (ep) content += `节目：${ep}\n`;
    content += `导出时间：${new Date().toLocaleDateString()}\n` + '='.repeat(50) + '\n\n';
    state.quotes.forEach((quote, index) => {
        const tag = quote.isPartial ? ' [节录]' : '';
        content += `${index + 1}. "${quote.text}"${tag}\n`;
        content += `   —— ${quote.speakerName}  [${formatTime(quote.startTime)}]\n\n`;
    });
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (ep || '金句摘录') + '.txt';
    a.click();
    URL.revokeObjectURL(url);
}

/* ==========================================================================
   章节草稿
   ========================================================================== */
function renderChapters() {
    const container = document.getElementById('chaptersContent');
    if (state.chapters.length === 0) {
        container.innerHTML = '<div class="empty-state">还没有章节，可在"转写文本"中多选句子后点击"合成章节"</div>';
    } else {
        container.innerHTML = '';
        state.chapters.forEach((chapter, index) => {
            const endTime = chapter.endTime ?? state.chapters[index + 1]?.startTime ?? state.duration;
            const card = document.createElement('div');
            card.className = 'chapter-card';
            const speakersHtml = chapter.speakers && chapter.speakers.length
                ? `<div class="chapter-speakers">
                    ${chapter.speakers.map(s => `<span class="chapter-speaker-tag" style="background:${s.color}">${escapeHtml(s.name)}</span>`).join('')}
                  </div>` : '';
            card.innerHTML = `
                <div class="chapter-header">
                    <div class="chapter-number">${index + 1}</div>
                    <input type="text" class="chapter-title" value="${escapeHtml(chapter.title)}" data-chapter-index="${index}">
                    <span class="chapter-time">${formatTimeShort(chapter.startTime)} - ${formatTimeShort(endTime)}</span>
                </div>
                ${speakersHtml}
                <div class="chapter-summary">
                    <textarea rows="2" data-chapter-index="${index}" data-field="summary">${escapeHtml(chapter.summary || '')}</textarea>
                </div>
                <div class="chapter-keywords">
                    ${(chapter.keywords || []).map(k => `<span class="chapter-keyword">${escapeHtml(k)}</span>`).join('')}
                </div>
                <div class="chapter-actions">
                    <button class="chapter-action-btn" data-action="jump" data-chapter-index="${index}">🎧 试听</button>
                    <button class="chapter-action-btn" data-action="addViewpoint" data-chapter-index="${index}">💡 提取观点</button>
                    <button class="chapter-action-btn" data-action="refresh" data-chapter-index="${index}">🔄 重新生成</button>
                    <button class="chapter-action-btn delete" data-action="delete" data-chapter-index="${index}">删除</button>
                </div>`;
            card.querySelector('.chapter-title').addEventListener('input', (e) => {
                chapter.title = e.target.value;
                debounceRenderShownotesPreview();
            });
            const textarea = card.querySelector('textarea');
            textarea.addEventListener('input', (e) => {
                chapter.summary = e.target.value;
                e.target.style.height = 'auto';
                e.target.style.height = e.target.scrollHeight + 'px';
                debounceRenderShownotesPreview();
            });
            setTimeout(() => {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }, 0);
            card.querySelectorAll('.chapter-action-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    handleChapterAction(btn.dataset.action, parseInt(btn.dataset.chapterIndex));
                });
            });
            container.appendChild(card);
        });
    }
    debounceRenderShownotesPreview();
}

function handleChapterAction(action, index) {
    const chapter = state.chapters[index];
    if (!chapter) return;
    switch (action) {
        case 'jump':
            setCurrentTime(chapter.startTime);
            if (!state.isPlaying) togglePlay();
            break;
        case 'addViewpoint': extractViewpointsFromChapter(chapter); break;
        case 'refresh': refreshChapterContent(chapter); break;
        case 'delete':
            if (confirm('确定删除这个章节吗？')) {
                state.chapters.splice(index, 1);
                renderChapters();
            }
            break;
    }
}

function refreshChapterContent(chapter) {
    const uttIds = chapter.utteranceIds || [];
    let selectedUtts = uttIds
        .map(id => state.utterances.find(u => u.id === id))
        .filter(Boolean);
    if (selectedUtts.length === 0) {
        selectedUtts = state.utterances.filter(u =>
            u.startTime >= chapter.startTime &&
            u.startTime < (chapter.endTime || chapter.startTime + 300)
        );
    }
    if (selectedUtts.length === 0) return;
    const uniqueSpeakers = [];
    const sids = new Set();
    selectedUtts.forEach(u => {
        if (!sids.has(u.speakerId)) {
            sids.add(u.speakerId);
            const sp = state.speakers.find(s => s.id === u.speakerId);
            if (sp) uniqueSpeakers.push(sp);
        }
    });
    const allText = selectedUtts.map(u => u.text).join(' ');
    chapter.title = autoGenerateChapterTitle(selectedUtts, allText);
    chapter.summary = autoGenerateChapterSummary(selectedUtts, uniqueSpeakers);
    chapter.keywords = autoExtractKeywords(allText, uniqueSpeakers);
    chapter.speakers = uniqueSpeakers.map(s => ({ id: s.id, name: s.name, color: s.color }));
    renderChapters();
}

function addChapter() {
    const newChapter = {
        title: '新章节', startTime: state.currentTime || 0,
        summary: '点击编辑章节摘要，或多选句子后自动合成...',
        keywords: [], speakers: []
    };
    let inserted = false;
    for (let i = 0; i < state.chapters.length; i++) {
        if (state.chapters[i].startTime > newChapter.startTime) {
            state.chapters.splice(i, 0, newChapter);
            inserted = true; break;
        }
    }
    if (!inserted) state.chapters.push(newChapter);
    renderChapters(); switchTab('chapters');
}

function addChapterFromUtterance(utterance) {
    state.currentTime = utterance.startTime;
    addChapter();
}

function autoGenerateChapters() {
    if (state.utterances.length === 0) return;
    const total = state.utterances.length;
    const chapterSize = Math.max(3, Math.ceil(total / 6));
    state.chapters = [];
    for (let i = 0; i < total; i += chapterSize) {
        const slice = state.utterances.slice(i, i + chapterSize);
        const uniqueSpeakers = [];
        const sids = new Set();
        slice.forEach(u => {
            if (!sids.has(u.speakerId)) {
                sids.add(u.speakerId);
                const sp = state.speakers.find(s => s.id === u.speakerId);
                if (sp) uniqueSpeakers.push(sp);
            }
        });
        const allText = slice.map(u => u.text).join(' ');
        state.chapters.push({
            title: autoGenerateChapterTitle(slice, allText),
            startTime: slice[0].startTime,
            endTime: slice[slice.length - 1].endTime,
            summary: autoGenerateChapterSummary(slice, uniqueSpeakers),
            keywords: autoExtractKeywords(allText, uniqueSpeakers),
            speakers: uniqueSpeakers.map(s => ({ id: s.id, name: s.name, color: s.color })),
            utteranceIds: slice.map(u => u.id)
        });
    }
}

function autoGenerateChapterTitle(utts, allText) {
    if (utts.length === 0) return '未命名章节';
    const keywordHints = ['AI', '人工智能', '大语言模型', '内容', '创作', '技术',
        '建议', '经验', '趋势', '未来', '团队', '工作流', '观点', '总结', '分享'];
    for (const kw of keywordHints) {
        if (allText.includes(kw)) {
            if (kw === '总结' || kw === '分享') return `${kw}环节`;
            return `关于「${kw}」的讨论`;
        }
    }
    const firstText = utts[0].text;
    return firstText.length > 18 ? firstText.substring(0, 18) + '...' : firstText;
}

function autoGenerateChapterSummary(utts, speakers) {
    if (utts.length === 0) return '';
    const names = speakers.map(s => s.name).join('、');
    const first = utts[0].text;
    const snippet = first.length > 50 ? first.substring(0, 50) + '...' : first;
    if (names && names.length <= 20) {
        return `${names}在本章节围绕相关话题展开交流。${snippet}`;
    }
    return `本章节主要讨论了：${snippet}`;
}

function autoExtractKeywords(text, speakers) {
    const dict = [
        ['AI', 2], ['人工智能', 2], ['大语言模型', 3], ['内容创作', 3],
        ['人机协作', 3], ['效率', 2], ['工作流', 2], ['创造力', 2],
        ['技术', 1], ['趋势', 2], ['未来', 1], ['建议', 2],
        ['经验', 2], ['观点', 2], ['总结', 1], ['分享', 1],
        ['剪辑', 2], ['转写', 2], ['金句', 2], ['播客', 2]
    ];
    const hits = [];
    dict.forEach(([k, w]) => { if (text.includes(k)) hits.push({ k, w }); });
    hits.sort((a, b) => b.w - a.w);
    const result = hits.slice(0, 4).map(h => h.k);
    if (result.length === 0 && speakers.length > 0) result.push(speakers[0].name + '观点');
    return result;
}

function extractViewpointsFromChapter(chapter) {
    const uttIds = chapter.utteranceIds || [];
    let utts = uttIds.map(id => state.utterances.find(u => u.id === id)).filter(Boolean);
    if (utts.length === 0) {
        utts = state.utterances.filter(u =>
            u.startTime >= chapter.startTime &&
            u.startTime < (chapter.endTime || chapter.startTime + 300)
        );
    }
    const uniqueSpks = [];
    const sids = new Set();
    utts.forEach(u => {
        if (!sids.has(u.speakerId)) {
            sids.add(u.speakerId);
            const sp = state.speakers.find(s => s.id === u.speakerId);
            if (sp) uniqueSpks.push(sp);
        }
    });
    uniqueSpks.forEach(sp => {
        const spUtts = utts.filter(u => u.speakerId === sp.id && u.text.length > 15);
        const selected = spUtts.slice(0, Math.min(2, spUtts.length));
        selected.forEach(u => {
            const text = u.text.length > 70 ? u.text.substring(0, 70) + '...' : u.text;
            state.viewpoints.push({
                id: Date.now() + Math.random(),
                speakerId: sp.id, speakerName: sp.name,
                text, color: sp.color, startTime: u.startTime
            });
        });
    });
    renderViewpoints();
}

/* ==========================================================================
   嘉宾观点清单
   ========================================================================== */
function generateViewpoints() {
    state.viewpoints = [];
    state.speakers.forEach(sp => {
        const spUtts = state.utterances
            .filter(u => u.speakerId === sp.id && u.text.length > 20)
            .sort((a, b) => (b.endTime - b.startTime) - (a.endTime - a.startTime))
            .slice(0, 3);
        spUtts.forEach(u => {
            const text = u.text.length > 70 ? u.text.substring(0, 70) + '...' : u.text;
            state.viewpoints.push({
                id: Date.now() + Math.random(),
                speakerId: sp.id, speakerName: sp.name,
                text, color: sp.color, startTime: u.startTime
            });
        });
    });
    renderViewpoints();
}

function renderViewpoints() {
    const container = document.getElementById('viewpointsList');
    if (state.viewpoints.length === 0) {
        container.innerHTML = '<div class="empty-state">从章节中提取观点，或一键生成</div>';
    } else {
        container.innerHTML = '';
        state.viewpoints.forEach(vp => {
            const el = document.createElement('div');
            el.className = 'viewpoint-item';
            el.innerHTML = `
                <div class="viewpoint-speaker" style="color: ${vp.color}">
                    <span class="speaker-dot" style="background: ${vp.color}"></span>
                    ${vp.speakerName} · <span class="viewpoint-time">${formatTime(vp.startTime)}</span>
                </div>
                <div class="viewpoint-text">${vp.text}</div>
            `;
            el.addEventListener('click', () => {
                setCurrentTime(vp.startTime);
                if (!state.isPlaying) togglePlay();
            });
            container.appendChild(el);
        });
    }
    debounceRenderShownotesPreview();
}

function generateSummary() {
    if (state.utterances.length === 0) return;
    const titleEl = document.getElementById('episodeTitle');
    const descEl = document.getElementById('episodeDesc');

    const speakerNames = state.speakers.map(s => s.name).join('、');
    const totalDur = formatTime(state.duration);
    const firstUtt = state.utterances[0].text.substring(0, 30);
    const lastUtt = state.utterances[state.utterances.length - 1].text.substring(0, 30);

    if (!titleEl.value.trim()) {
        titleEl.value = `${speakerNames} 深度对谈 | 共 ${totalDur}`;
    }
    if (!descEl.value.trim()) {
        const chapterCount = state.chapters.length;
        const quoteCount = state.quotes.length;
        descEl.value =
`【本期嘉宾】${speakerNames}
【节目时长】${totalDur}
【章节分段】${chapterCount} 个话题段落
【金句摘录】${quoteCount} 条精彩观点
——
开场："${firstUtt}..."
结尾："...${lastUtt}"

整理自播客转写整理工具`;
    }
}

function exportShownotes() {
    const text = buildShownotesText();
    const title = document.getElementById('episodeTitle').value || 'shownotes';
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}_shownotes.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Shownotes 已导出（Markdown 格式）');
}

function buildShownotesText() {
    const title = document.getElementById('episodeTitle').value || '未命名节目';
    const desc = document.getElementById('episodeDesc').value || '';
    const lines = [];
    lines.push(`# ${title}`);
    lines.push('');
    if (desc) {
        lines.push(desc);
        lines.push('');
    }
    if (state.chapters.length > 0) {
        lines.push('---');
        lines.push('## 📑 时间线 & 章节');
        lines.push('');
        state.chapters.forEach((ch, i) => {
            lines.push(`**${formatTimeShort(ch.startTime)}** ${i + 1}. ${ch.title}`);
            if (ch.summary) lines.push(`> ${ch.summary}`);
            lines.push('');
        });
    }
    if (state.quotes.length > 0) {
        lines.push('---');
        lines.push('## 💎 金句摘录');
        lines.push('');
        state.quotes.forEach(q => {
            const spName = q.speakerName || (() => {
                const sp = state.speakers.find(s => s.id === q.speakerId);
                return sp ? sp.name : '';
            })();
            const displayName = spName || `说话人${q.speakerId != null ? q.speakerId + 1 : ''}`.trim();
            const marker = q.isPartial ? ' [节录]' : '';
            lines.push(`\`${formatTimeShort(q.startTime)}\` **${displayName}**${marker}：${q.text}`);
            lines.push('');
        });
    }
    if (state.viewpoints.length > 0) {
        lines.push('---');
        lines.push('## 🎤 嘉宾观点');
        lines.push('');
        const vpBySpeaker = {};
        state.viewpoints.forEach(vp => {
            const name = vp.speakerName || `说话人${vp.speakerId != null ? vp.speakerId + 1 : ''}`.trim();
            if (!vpBySpeaker[name]) vpBySpeaker[name] = [];
            vpBySpeaker[name].push(vp);
        });
        Object.entries(vpBySpeaker).forEach(([name, vps]) => {
            lines.push(`**${name}**：`);
            vps.forEach((vp, i) => lines.push(`  ${i + 1}. ${vp.text}`));
            lines.push('');
        });
    }
    lines.push('---');
    lines.push(`*由播客转写整理工具生成 · ${new Date().toLocaleString()}*`);
    return lines.join('\n');
}

function renderShownotesPreview() {
    const previewBody = document.getElementById('shownotesPreviewBody');
    const title = document.getElementById('episodeTitle').value || '未命名节目';
    const desc = document.getElementById('episodeDesc').value || '';

    if (!desc && state.chapters.length === 0 && state.quotes.length === 0) {
        previewBody.innerHTML = '<div class="empty-state">暂无内容，请先添加章节、金句或生成简介</div>';
        return;
    }

    let html = '';
    html += `<h1>${escapeHtml(title)}</h1>`;
    if (desc) {
        html += `<p>${escapeHtml(desc).replace(/\n/g, '<br>')}</p>`;
    }

    if (state.chapters.length > 0) {
        html += '<hr>';
        html += '<h2>📑 时间线 & 章节</h2>';
        state.chapters.forEach((ch, i) => {
            html += `<div class="chapter-item">`;
            html += `<span class="chapter-time">${formatTimeShort(ch.startTime)}</span>`;
            html += `<span class="chapter-title-text">${i + 1}. ${escapeHtml(ch.title)}</span>`;
            html += `</div>`;
            if (ch.summary) {
                html += `<blockquote>${escapeHtml(ch.summary)}</blockquote>`;
            }
        });
    }

    if (state.quotes.length > 0) {
        html += '<hr>';
        html += '<h2>💎 金句摘录</h2>';
        state.quotes.forEach(q => {
            const spName = q.speakerName || (() => {
                const sp = state.speakers.find(s => s.id === q.speakerId);
                return sp ? sp.name : '';
            })();
            const displayName = spName || `说话人${q.speakerId != null ? q.speakerId + 1 : ''}`.trim();
            const partialTag = q.isPartial ? '<span class="q-partial">节录</span>' : '';
            html += `<div class="quote-item-preview">`;
            html += `<span class="q-time">${formatTimeShort(q.startTime)}</span>`;
            html += `<span class="q-speaker">${escapeHtml(displayName)}</span>${partialTag}`;
            html += `<br>${escapeHtml(q.text)}`;
            html += `</div>`;
        });
    }

    if (state.viewpoints.length > 0) {
        html += '<hr>';
        html += '<h2>🎤 嘉宾观点</h2>';
        const vpBySpeaker = {};
        state.viewpoints.forEach(vp => {
            const name = vp.speakerName || `说话人${vp.speakerId != null ? vp.speakerId + 1 : ''}`.trim();
            if (!vpBySpeaker[name]) vpBySpeaker[name] = [];
            vpBySpeaker[name].push(vp);
        });
        Object.entries(vpBySpeaker).forEach(([name, vps]) => {
            html += `<div class="viewpoint-speaker-name">${escapeHtml(name)}</div>`;
            html += '<ol>';
            vps.forEach(vp => {
                html += `<li>${escapeHtml(vp.text)}</li>`;
            });
            html += '</ol>';
        });
    }

    previewBody.innerHTML = html;
}

function toggleShownotesPreview() {
    const preview = document.getElementById('shownotesPreview');
    const btn = document.getElementById('togglePreviewBtn');
    if (preview.style.display === 'none') {
        preview.style.display = 'flex';
        btn.textContent = '👁️ 关闭预览';
        btn.classList.add('active');
        renderShownotesPreview();
    } else {
        preview.style.display = 'none';
        btn.textContent = '👁️ 预览 Shownotes';
        btn.classList.remove('active');
    }
}

function copyShownotes() {
    const text = buildShownotesText();
    navigator.clipboard.writeText(text).then(() => {
        showToast('Shownotes 已复制到剪贴板');
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Shownotes 已复制到剪贴板');
    });
}

function downloadShownotesMarkdown() {
    const text = buildShownotesText();
    const title = document.getElementById('episodeTitle').value || 'shownotes';
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[\\/:*?"<>|]/g, '_')}_shownotes.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Shownotes 已下载（Markdown 格式）');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabName);
    });
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.toggle('active', c.id === `${tabName}Tab`);
    });
    if (tabName === 'chapters' && state.chapters.length === 0 && state.utterances.length > 0) {
        autoGenerateChapters();
        generateViewpoints();
        generateSummary();
    }
}

function showToast(msg, type = 'info') {
    let toast = document.getElementById('globalToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'globalToast';
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            padding: 12px 20px; border-radius: 8px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white; font-size: 14px; font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,.15);
            transition: opacity .25s, transform .25s;
            opacity: 0; transform: translateY(-10px);
        `;
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.background = type === 'error' ? '#ef4444' : '#10b981';
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
    }, 2400);
}

function hideQuoteFloatBar() {
    document.getElementById('quoteFloatBar').style.display = 'none';
    window.getSelection().removeAllRanges();
    state.pendingQuoteSelection = null;
}

document.addEventListener('DOMContentLoaded', init);