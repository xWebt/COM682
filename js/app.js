// 配置 - 请替换为您的Azure Function App URL
const API_BASE_URL = 'https://YOUR_FUNCTION_APP_NAME.azurewebsites.net/api';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadJournals();
    setupFormHandlers();
    setupImagePreview();
});

// 加载所有日记
async function loadJournals() {
    const journalsList = document.getElementById('journalsList');
    journalsList.innerHTML = '<p class="loading">加载中...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/getJournals`);
        if (!response.ok) throw new Error('获取日记失败');
        
        const journals = await response.json();
        
        if (journals.length === 0) {
            journalsList.innerHTML = '<p class="empty">还没有日记，创建第一个吧！</p>';
            return;
        }

        journalsList.innerHTML = journals.map(journal => createJournalCard(journal)).join('');
        
        // 绑定删除和查看事件
        attachCardEvents();
    } catch (error) {
        console.error('Error loading journals:', error);
        journalsList.innerHTML = `<p class="error">加载失败: ${error.message}</p>`;
    }
}

// 创建日记卡片HTML
function createJournalCard(journal) {
    const date = new Date(journal.Timestamp || journal.RowKey).toLocaleString('zh-CN');
    return `
        <div class="journal-card" data-id="${journal.RowKey}">
            <img src="${journal.ImageUrl}" alt="${journal.Title}" class="journal-card-image" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22300%22 height=%22200%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E无图片%3C/text%3E%3C/svg%3E'">
            <div class="journal-card-content">
                <h3 class="journal-card-title">${escapeHtml(journal.Title)}</h3>
                <p class="journal-card-text">${escapeHtml(journal.Text)}</p>
                <p class="journal-card-date">${date}</p>
                <div class="journal-card-actions">
                    <button class="btn-small btn-edit" onclick="viewJournal('${journal.RowKey}')">查看</button>
                    <button class="btn-small btn-delete" onclick="deleteJournal('${journal.RowKey}')">删除</button>
                </div>
            </div>
        </div>
    `;
}

// 转义HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 绑定卡片事件
function attachCardEvents() {
    // 事件已通过onclick绑定
}

// 设置表单处理器
function setupFormHandlers() {
    const form = document.getElementById('journalForm');
    form.addEventListener('submit', handleFormSubmit);
}

// 处理表单提交
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    const imageFile = document.getElementById('image').files[0];

    if (!imageFile) {
        alert('请选择一张图片');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = '创建中...';

    try {
        // 先上传图片获取URL
        const imageUrl = await uploadImage(imageFile);
        
        // 创建日记
        const response = await fetch(`${API_BASE_URL}/createJournal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                text: text,
                imageUrl: imageUrl
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || '创建失败');
        }

        // 重置表单
        form.reset();
        document.getElementById('imagePreview').innerHTML = '';
        
        // 重新加载列表
        await loadJournals();
        
        alert('日记创建成功！');
    } catch (error) {
        console.error('Error creating journal:', error);
        alert(`创建失败: ${error.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '创建日记';
    }
}

// 上传图片
async function uploadImage(file) {
    // 将文件转换为base64
    const base64 = await fileToBase64(file);

    const response = await fetch(`${API_BASE_URL}/uploadImage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            image: base64
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || '图片上传失败');
    }

    const result = await response.json();
    return result.imageUrl;
}

// 将文件转换为base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// 设置图片预览
function setupImagePreview() {
    const imageInput = document.getElementById('image');
    const preview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML = `<img src="${event.target.result}" alt="预览">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });
}

// 查看日记详情
async function viewJournal(journalId) {
    try {
        const response = await fetch(`${API_BASE_URL}/getJournal?journalId=${journalId}`);
        if (!response.ok) throw new Error('获取日记失败');
        
        const journal = await response.json();
        showJournalModal(journal);
    } catch (error) {
        console.error('Error viewing journal:', error);
        alert(`加载失败: ${error.message}`);
    }
}

// 显示日记模态框
function showJournalModal(journal) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${escapeHtml(journal.Title)}</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <img src="${journal.ImageUrl}" alt="${journal.Title}" class="modal-image"
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22300%22%3E%3Crect fill=%22%23e0e0e0%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2214%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E无图片%3C/text%3E%3C/svg%3E'">
            <p style="white-space: pre-wrap; line-height: 1.8;">${escapeHtml(journal.Text)}</p>
            <p style="color: #999; margin-top: 1rem;">创建时间: ${new Date(journal.Timestamp || journal.RowKey).toLocaleString('zh-CN')}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击背景关闭
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 删除日记
async function deleteJournal(journalId) {
    if (!confirm('确定要删除这篇日记吗？')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/deleteJournal?journalId=${journalId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        await loadJournals();
        alert('删除成功！');
    } catch (error) {
        console.error('Error deleting journal:', error);
        alert(`删除失败: ${error.message}`);
    }
}

