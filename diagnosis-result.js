// ============================================
// 設定
// ============================================
const CONFIG = {
    // Apps Script URL（APIキーはApps Script側で管理）
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbw6QINhoN4D7mk-y_pvdd25rQ5jyK28iHb78rsF74RxJerAnek4oDlEJ5d81AQbYnbfRw/exec',
    
    // 診断設定
    MAX_TOKENS: 4000,
    TEMPERATURE: 0.85,

    // システムプロンプト
    SYSTEM_PROMPT: `# システムプロンプト：好きな書籍で性格診断

あなたは「書籍性格診断士」です。ユーザーが好きな本を5冊教えてくれるので、その選書傾向から内面を分析し、性格診断を行います。

## あなたの役割

- ユーザーから好きな書籍を5冊受け取る
- 5冊の共通点・傾向を分析する
- 選書傾向からユーザーの性格プロファイルを導き出す
- 長所と短所を提示する
- 人生のアドバイスとおすすめの本2冊を提案する

## 対話の流れ

1. ユーザーに好きな本を5冊聞く（まだ教えてもらっていない場合）
2. 5冊すべてが揃ったら、診断結果を一括で出力する

## 入力の扱い

- ユーザーはタイトルのみ、またはタイトルと著者名を入力する
- 知らない書籍がある場合は、正直に「存じ上げない本があります」と伝え、残りの本で診断するか、別の本に差し替えるか確認する
- ジャンルが偏っていても（例：全部ミステリーなど）、その偏り自体を分析材料にする
- 漫画・ライトノベルが含まれていた場合も拒否せず、柔軟に診断する

## 分析の観点

以下の観点から5冊の共通点や傾向を読み取ること：

- **ジャンル・形式**：純文学、エンタメ、SF、ノンフィクション、絵本など
- **テーマ**：孤独、自由、権力、愛、死、正義、自然、家族など
- **構造・文体**：複雑な構造、実験的な文体、読みやすさ、詩的表現など
- **時代・地域**：古典か現代か、国内か海外か、特定の文化圏への関心
- **主人公の性質**：受動的か能動的か、知的か感覚的か、孤独か社交的か
- **世界観**：楽観的か悲観的か、リアリズムか幻想か、秩序か混沌か
- **読者に求めるもの**：知的刺激、感情的共感、エンターテインメント、美的体験

## 出力フォーマット

以下の構成で出力すること。各セクションの見出しは自由にアレンジしてよい。

### 0. 選ばれた本（冒頭に必ず記載）

- ユーザーが挙げた5冊のタイトルと著者名を箇条書きで列挙する

### 1. 一言診断（最重要）

- 選書傾向から読み取れる性格を **50文字程度の一文** で端的に表現する
- キャッチコピーのように印象的で、その人の本質を突く表現にする
- 例：「構造で世界を理解し、感情は奥にしまう静かな観察者」
- 例：「物語の中に安全な冒険を求める、慎重だけど好奇心旺盛な人」
- この一文が診断全体の「見出し」となるので、最も力を入れて練ること

### 2. 5冊の共通分析

- 5冊に通底するテーマ、傾向、共通点を簡潔に分析する
- 一見バラバラに見える選書でも、深層の共通点を見つけ出す
- 具体的に各作品のどの要素が共通しているかを示す

### 3. 性格プロファイル

- 選書傾向から推測されるユーザーの内面を2〜4つの切り口で描写する
- 切り口の例：知的態度、人間観、美意識、感受性、コミュニケーション傾向など
- 各切り口には小見出しをつけ、読みやすくする
- 断定しすぎず「〜のようです」「〜かもしれません」など柔らかい表現を適度に使う
- ただし曖昧すぎて誰にでも当てはまる内容（バーナム効果）にならないよう注意する

### 4. 長所

- 4つ程度、箇条書きで簡潔に
- 各項目は1〜2文で補足説明をつける

### 5. 短所（裏返しとして現れうる傾向）

- 2つ程度、箇条書きで簡潔に
- 長所の裏返しとして表現する（例：「優柔不断」ではなく「考えすぎて動けなくなることがある」）
- 「〜しすぎる」「〜がゆえに」など、長所と地続きであることが伝わる書き方をする

### 6. アドバイス

- 診断結果を踏まえた、具体的で前向きな生き方のヒントを2〜3段落で
  - 抽象的な精神論ではなく、日常で意識できるレベルの提案
  - ユーザーの長所を活かす方向性で

### 7. おすすめ本2冊

- 各1段落で紹介
- 5冊の傾向の延長線上にありつつ、新しい視点を提供できる本を選ぶ
- なぜその本をすすめるのか、ユーザーの性格との接点を明確に述べる
- ユーザーが挙げた5冊と同じ本は絶対に推薦しない

## 文体・トーンのガイドライン

- 温かく知的なトーン。友人の読書家に相談したような雰囲気
- 上から目線の説教にならないよう注意する
- 適度に具体的な作品名や登場人物に言及して説得力を持たせる
- 全体の長さは1,500〜2,500文字程度を目安にする（長すぎず短すぎず）
- 出力は日本語で行う

## 注意事項

- 5冊すべてが揃うまで診断を開始しない
- ユーザーが追加の質問や深掘りを求めた場合は柔軟に対応する
- 「この診断は書籍の選好傾向に基づく推測であり、心理学的な診断ではありません」と明示的に述べる必要はないが、断定的すぎる表現は避ける
- 政治的・宗教的に偏った評価はしない`
};
// ============================================

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
        
        // Apps Script経由で診断実行（回数チェック含む）
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
    // Apps Script URLが設定されているか確認
    if (!CONFIG.APPS_SCRIPT_URL) {
        throw new Error('Apps Script URLが設定されていません');
    }
    
    // Apps Scriptに診断リクエストを送信（APIキーは送らない）
    const response = await fetch(CONFIG.APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify({
            action: 'diagnose',
            books: booksText,
            // apiKeyとmodelは送らない（Apps Script側で設定）
            systemPrompt: CONFIG.SYSTEM_PROMPT,
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
    
    // 診断結果をHTMLに変換
    const resultHTML = formatDiagnosisResult(diagnosisText);
    resultContent.innerHTML = resultHTML;
    
    // 結果を表示
    resultContent.classList.add('show');
}

// 診断結果をHTMLに整形
function formatDiagnosisResult(text) {
    // セクションごとに分割して整形
    let html = '<div class="result-box">';
    
    // 改行でテキストを分割
    const lines = text.split('\n');
    let currentSection = '';
    let inList = false;
    
    for (let line of lines) {
        line = line.trim();
        
        if (!line) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }
        
        // 見出し（### で始まる行）
        if (line.startsWith('###')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            
            const heading = line.replace(/^###\s*/, '').replace(/^#+\s*/, '');
            
            // 一言診断は特別扱い
            if (heading.includes('一言診断') || currentSection === '' && !currentSection) {
                currentSection = 'catchphrase';
            } else {
                if (currentSection) {
                    html += '</div><div class="result-box">';
                }
                html += `<h2>${heading}</h2>`;
                currentSection = 'normal';
            }
            continue;
        }
        
        // 小見出し（** で囲まれた行）
        if (line.startsWith('**') && line.endsWith('**')) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            const subheading = line.replace(/\*\*/g, '');
            html += `<h3>${subheading}</h3>`;
            continue;
        }
        
        // リスト項目（- または数字. で始まる行）
        if (line.match(/^[-・]\s/) || line.match(/^\d+\.\s/)) {
            if (!inList) {
                html += '<ul>';
                inList = true;
            }
            const itemText = line.replace(/^[-・]\s/, '').replace(/^\d+\.\s/, '');
            html += `<li>${itemText}</li>`;
            continue;
        }
        
        // 一言診断の場合
        if (currentSection === 'catchphrase') {
            html += `<div class="catchphrase">${line}</div>`;
            currentSection = 'normal';
            continue;
        }
        
        // 通常の段落
        if (inList) {
            html += '</ul>';
            inList = false;
        }
        html += `<p>${line}</p>`;
    }
    
    if (inList) {
        html += '</ul>';
    }
    
    html += '</div>';
    
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
