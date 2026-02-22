/**
 * GitHub Repository URL Fetcher
 * Fetches all file URLs from a GitHub repository using the GitHub API
 */

const API_BASE = 'https://api.github.com';
const RAW_BASE = 'https://raw.githubusercontent.com';

// DOM Elements
const elements = {
    repoInput: document.getElementById('repoInput'),
    fetchBtn: document.getElementById('fetchBtn'),
    recursiveCheck: document.getElementById('recursiveCheck'),
    rawCheck: document.getElementById('rawCheck'),
    progressArea: document.getElementById('progressArea'),
    statusText: document.getElementById('statusText'),
    resultsArea: document.getElementById('resultsArea'),
    fileList: document.getElementById('fileList'),
    statsDisplay: document.getElementById('statsDisplay'),
    errorArea: document.getElementById('errorArea'),
    errorText: document.getElementById('errorText'),
    copyAllBtn: document.getElementById('copyAllBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearBtn: document.getElementById('clearBtn'),
    filterInput: document.getElementById('filterInput'),
    sortSelect: document.getElementById('sortSelect')
};

// State
let allFiles = [];
let currentRepo = null;

// File type icons
const fileIcons = {
    '.js': '📜', '.ts': '📘', '.jsx': '⚛️', '.tsx': '⚛️',
    '.py': '🐍', '.java': '☕', '.go': '🐹', '.rs': '🦀',
    '.cpp': '⚙️', '.c': '⚙️', '.h': '📋',
    '.html': '🌐', '.css': '🎨', '.scss': '🎨', '.sass': '🎨',
    '.json': '📋', '.md': '📝', '.yml': '⚙️', '.yaml': '⚙️',
    '.sh': '🔧', '.bash': '🔧', '.zsh': '🔧',
    '.dockerfile': '🐳', '.gitignore': '👁️',
    default: '📄'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
});

function bindEvents() {
    elements.fetchBtn.addEventListener('click', handleFetch);
    elements.repoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleFetch();
    });
    elements.copyAllBtn.addEventListener('click', copyAllUrls);
    elements.downloadBtn.addEventListener('click', downloadJson);
    elements.clearBtn.addEventListener('click', clearResults);
    elements.filterInput.addEventListener('input', filterAndRender);
    elements.sortSelect.addEventListener('change', filterAndRender);
}

async function handleFetch() {
    const url = elements.repoInput.value.trim();
    
    if (!isValidGitHubUrl(url)) {
        showError('Please enter a valid GitHub repository URL');
        return;
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
        showError('Could not parse repository URL');
        return;
    }

    currentRepo = parsed;
    allFiles = [];
    
    showProgress('Fetching repository contents...');
    hideError();
    hideResults();

    try {
        await fetchAllFiles(parsed.owner, parsed.repo, parsed.branch);
        hideProgress();
        showResults();
    } catch (err) {
        hideProgress();
        showError(err.message);
    }
}

function isValidGitHubUrl(url) {
    return /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+/.test(url);
}

function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+))?/);
    if (!match) return null;
    
    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
        branch: match[3] || 'HEAD'
    };
}

async function fetchAllFiles(owner, repo, branch = 'HEAD', path = '') {
    const url = `${API_BASE}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    
    updateStatus(`Fetching: ${path || 'root'}...`);
    
    const response = await fetch(url);
    
    if (response.status === 403) {
        throw new Error('API rate limit exceeded. Please try again later.');
    }
    if (response.status === 404) {
        throw new Error('Repository not found or is private.');
    }
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const items = await response.json();
    
    for (const item of items) {
        if (item.type === 'file') {
            const fileData = {
                name: item.name,
                path: item.path,
                size: item.size,
                url: item.html_url,
                download_url: item.download_url,
                extension: getExtension(item.name),
                type: getFileType(item.name)
            };
            allFiles.push(fileData);
        } else if (item.type === 'dir' && elements.recursiveCheck.checked) {
            await fetchAllFiles(owner, repo, branch, item.path);
        }
    }
}

function getExtension(filename) {
    const ext = filename.lastIndexOf('.');
    return ext === -1 ? '' : filename.slice(ext).toLowerCase();
}

function getFileType(filename) {
    const ext = getExtension(filename);
    return fileIcons[ext] || fileIcons.default;
}

function showProgress(message) {
    elements.statusText.textContent = message;
    elements.progressArea.hidden = false;
    elements.fetchBtn.disabled = true;
}

function updateStatus(message) {
    elements.statusText.textContent = message;
}

function hideProgress() {
    elements.progressArea.hidden = true;
    elements.fetchBtn.disabled = false;
}

function showResults() {
    updateStats();
    filterAndRender();
    elements.resultsArea.hidden = false;
}

function hideResults() {
    elements.resultsArea.hidden = true;
}

function updateStats() {
    const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
    const extensions = [...new Set(allFiles.map(f => f.extension || 'no-ext'))];
    
    elements.statsDisplay.innerHTML = `
        <div class="statItem">
            <span>📁 Files:</span>
            <span class="statValue">${allFiles.length}</span>
        </div>
        <div class="statItem">
            <span>📦 Size:</span>
            <span class="statValue">${formatBytes(totalSize)}</span>
        </div>
        <div class="statItem">
            <span>🏷️ Types:</span>
            <span class="statValue">${extensions.length}</span>
        </div>
    `;
}

function filterAndRender() {
    const filter = elements.filterInput.value.toLowerCase();
    const sortBy = elements.sortSelect.value;
    
    let filtered = allFiles.filter(f => {
        const matchFilter = !filter || 
            f.name.toLowerCase().includes(filter) ||
            f.path.toLowerCase().includes(filter) ||
            f.extension.toLowerCase().includes(filter);
        return matchFilter;
    });
    
    filtered.sort((a, b) => {
        switch(sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'size': return b.size - a.size;
            default: return a.path.localeCompare(b.path);
        }
    });
    
    renderFileList(filtered);
}

function renderFileList(files) {
    const useRaw = elements.rawCheck.checked;
    
    elements.fileList.innerHTML = files.map(file => {
        const displayUrl = useRaw 
            ? `${RAW_BASE}/${currentRepo.owner}/${currentRepo.repo}/${currentRepo.branch}/${file.path}`
            : file.url;
        
        return `
            <li class="fileEntry">
                <span class="fileIcon">${file.type}</span>
                <div class="fileInfo">
                    <div class="fileName">${escapeHtml(file.name)}</div>
                    <div class="filePath">${escapeHtml(file.path)}</div>
                </div>
                <div class="fileMeta">
                    <span class="fileSize">${formatBytes(file.size)}</span>
                    <button class="copyLink" onclick="copyToClipboard('${escapeHtml(displayUrl)}', this)">
                        Copy URL
                    </button>
                </div>
            </li>
        `;
    }).join('');
    
    if (files.length === 0) {
        elements.fileList.innerHTML = `
            <li class="fileEntry" style="justify-content: center; color: var(--textSecondary);">
                No files match your filter
            </li>
        `;
    }
}

async function copyToClipboard(text, btn) {
    try {
        await navigator.clipboard.writeText(text);
        const original = btn.textContent;
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = original;
            btn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
}

async function copyAllUrls() {
    const useRaw = elements.rawCheck.checked;
    const urls = allFiles.map(f => useRaw
        ? `${RAW_BASE}/${currentRepo.owner}/${currentRepo.repo}/${currentRepo.branch}/${f.path}`
        : f.url
    ).join('\n');
    
    try {
        await navigator.clipboard.writeText(urls);
        elements.copyAllBtn.textContent = 'Copied All!';
        setTimeout(() => {
            elements.copyAllBtn.textContent = 'Copy All';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy all:', err);
    }
}

function downloadJson() {
    const data = {
        repository: `${currentRepo.owner}/${currentRepo.repo}`,
        branch: currentRepo.branch,
        fetchedAt: new Date().toISOString(),
        totalFiles: allFiles.length,
        files: allFiles.map(f => ({
            name: f.name,
            path: f.path,
            size: f.size,
            github_url: f.url,
            raw_url: `${RAW_BASE}/${currentRepo.owner}/${currentRepo.repo}/${currentRepo.branch}/${f.path}`,
            extension: f.extension
        }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRepo.repo}-files.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function clearResults() {
    allFiles = [];
    currentRepo = null;
    elements.repoInput.value = '';
    elements.filterInput.value = '';
    hideResults();
    hideError();
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorArea.hidden = false;
}

function hideError() {
    elements.errorArea.hidden = true;
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Expose for inline onclick handlers
window.copyToClipboard = copyToClipboard;
