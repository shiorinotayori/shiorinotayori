// ============================================
// 診断設定
// ============================================
const CONFIG = {
    // Apps Script URL（APIキーはApps Script側で管理）
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw6QINhoN4D7mk-y_pvdd25rQ5jyK28iHb78rsF74RxJerAnek4oDlEJ5d81AQbYnbfRw/exec',
    
    // 診断設定
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.85
};

// ページ読み込み時に診断実行
document.addEventListener('DOMContentLoaded', async function() {
    // localStorageから書籍データを取得
    const bookDataStr = localStorage.getItem('diagnosisBooks');
    
    if (!bookDataStr) {
        showError('書籍データが見つかりません。', '入力ページからやり直してください。');
        return;
    }
    
    const bookData = JSON.parse(bookDataStr);
    
    // 診断実行
    await performDiagnosis(bookData);
});

// 診断実行
async function performDiagnosis(bookData) {
    try {
        // 書籍リストを整形
        let booksText = '';
        if (bookData.books && bookData.books.length > 0) {
            booksText = bookData.books.map((book, index) => `${index + 1}. ${book}`).join('\n');
        }
        if (bookData.bookAll) {
            if (booksText) booksText += '\n\n【まとめて入力された書籍】\n';
            booksText += bookData.bookAll;
        }
        
        // Apps Script経由で診断実行
        const diagnosisResult = await callDiagnosisAPI(booksText);
        
        // 結果を表示
        displayResult(diagnosisResult);
        
    } catch (error) {
        console.error('診断エラー:', error);
        
        if (error.message.includes('上限')) {
            showError('診断回数の上限に達しました', error.message);
        } else {
            showError('診断中にエラーが発生しました', 'しばらくしてから再度お試しください。');
        }
    }
}

// Apps Script経由で診断API呼び出し
async function callDiagnosisAPI(booksText) {
    if (!CONFIG.APPS_SCRIPT_URL) {
        throw new Error('Apps Script URLが設定されていません');
    }
    
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
            action: 'diagnose',
            books: booksText,
            maxTokens: CONFIG.MAX_TOKENS,
            temperature: CONFIG.TEMPERATURE
        })
    });
    
    const result = await response.json();
    
    if (!result.success) {
        throw new Error(result.message || '診断に失敗しました');
    }
    
    return result.diagnosis;
}

// 結果を表示
function displayResult(diagnosisText) {
    const loadingContainer = document.getElementById('loadingContainer');
    const resultContent = document.getElementById('resultContent');
    
    // ローディングを非表示
    loadingContainer.style.display = 'none';
    
    // 診断結果を各セクションに分割
    const sections = parseDiagnosisResult(diagnosisText);
    
    // 各セクションに内容を挿入
    if (sections.books) {
        document.getElementById('books-content').innerHTML = formatBooksList(sections.books);
    }
    if (sections.catchphrase) {
        document.getElementById('catchphrase-content').textContent = sections.catchphrase;
    }
    if (sections.analysis) {
        document.getElementById('analysis-content').innerHTML = formatParagraphs(sections.analysis);
    }
    if (sections.profile) {
        document.getElementById('profile-content').innerHTML = formatParagraphs(sections.profile);
    }
    if (sections.strengths) {
        document.getElementById('strengths-content').innerHTML = formatList(sections.strengths);
    }
    if (sections.weaknesses) {
        document.getElementById('weaknesses-content').innerHTML = formatList(sections.weaknesses);
    }
    if (sections.advice) {
        document.getElementById('advice-content').innerHTML = formatParagraphs(sections.advice);
    }
    if (sections.recommendations) {
        document.getElementById('recommendations-content').innerHTML = formatRecommendations(sections.recommendations);
    }
    
    // 結果を表示
    resultContent.classList.add('show');
}

// 診断結果をセクションごとに分割
function parseDiagnosisResult(text) {
    const sections = {
        books: '',
        catchphrase: '',
        analysis: '',
        profile: '',
        strengths: '',
        weaknesses: '',
        advice: '',
        recommendations: ''
    };
    
    // セクション区切りを検出するための正規表現
    const sectionMarkers = [
        '---BOOKS---',
        '---CATCHPHRASE---',
        '---ANALYSIS---',
        '---PROFILE---',
        '---STRENGTHS---',
        '---WEAKNESSES---',
        '---ADVICE---',
        '---RECOMMENDATIONS---'
    ];
    
    // セクションマーカーで分割
    let currentSection = '';
    const lines = text.split('\n');
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine === '---BOOKS---') {
            currentSection = 'books';
        } else if (trimmedLine === '---CATCHPHRASE---') {
            currentSection = 'catchphrase';
        } else if (trimmedLine === '---ANALYSIS---') {
            currentSection = 'analysis';
        } else if (trimmedLine === '---PROFILE---') {
            currentSection = 'profile';
        } else if (trimmedLine === '---STRENGTHS---') {
            currentSection = 'strengths';
        } else if (trimmedLine === '---WEAKNESSES---') {
            currentSection = 'weaknesses';
        } else if (trimmedLine === '---ADVICE---') {
            currentSection = 'advice';
        } else if (trimmedLine === '---RECOMMENDATIONS---') {
            currentSection = 'recommendations';
        } else if (currentSection && trimmedLine) {
            sections[currentSection] += line + '\n';
        }
    }
    
    return sections;
}

// 書籍リストをフォーマット
function formatBooksList(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    let html = '<ul>';
    for (const line of lines) {
        const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
        if (cleaned) {
            html += `<li>${cleaned}</li>`;
        }
    }
    html += '</ul>';
    return html;
}

// 段落をフォーマット
function formatParagraphs(text) {
    const paragraphs = text.trim().split('\n\n');
    let html = '';
    for (const para of paragraphs) {
        const cleaned = para.trim();
        if (cleaned) {
            html += `<p>${cleaned}</p>`;
        }
    }
    return html;
}

// リストをフォーマット
function formatList(text) {
    const lines = text.trim().split('\n').filter(line => line.trim());
    let html = '<ul>';
    for (const line of lines) {
        const cleaned = line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '');
        if (cleaned) {
            html += `<li>${cleaned}</li>`;
        }
    }
    html += '</ul>';
    return html;
}

// おすすめ本をフォーマット
function formatRecommendations(text) {
    const paragraphs = text.trim().split('\n\n');
    let html = '';
    for (const para of paragraphs) {
        const cleaned = para.trim();
        if (cleaned) {
            // 書籍タイトル（『』で囲まれた部分）を検出して強調
            const formatted = cleaned.replace(/『([^』]+)』/g, '<strong>『$1』</strong>');
            html += `<p>${formatted}</p>`;
        }
    }
    return html;
}

// エラー表示
function showError(title, message) {
    const loadingContainer = document.getElementById('loadingContainer');
    const resultContent = document.getElementById('resultContent');
    
    loadingContainer.style.display = 'none';
    
    resultContent.innerHTML = `
        <div class="error-message">
            <h3>${title}</h3>
            <p>${message}</p>
            <a href="diagnosis-chat.html" class="back-link">← 入力ページに戻る</a>
        </div>
    `;
    
    resultContent.classList.add('show');
}
