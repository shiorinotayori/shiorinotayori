// ============================================
// 設定
// ============================================
const CONFIG = {
    TOTAL_QUESTIONS: 10,         // 出題数（サンプルデータに合わせて5問に設定）
    EXCERPT_INCREMENT: 100,     // Moreボタン1回で表示する文字数
    INITIAL_EXCERPT_LENGTH: 100, // 最初に表示する文字数
    HINT_AFTER_MORE_COUNT: 3    // 何回Moreを押したらヒントボタンを表示するか
};

// ============================================
// 状態管理
// ============================================
let gameState = {
    difficulty: null,           // 選択された難易度
    allQuestions: [],          // すべての問題
    currentQuestions: [],      // 今回のクイズで使う問題
    currentQuestionIndex: 0,   // 現在の問題番号
    currentQuestion: null,     // 現在の問題データ
    score: 0,                  // 正解数
    moreClickCount: 0,         // Moreボタンのクリック回数
    currentExcerptLength: 100, // 現在表示している文字数
    answers: [],               // 回答履歴
    hintUsed: false            // ヒントを使ったか
};

// ============================================
// DOM要素
// ============================================
const screens = {
    start: document.getElementById('startScreen'),
    quiz: document.getElementById('quizScreen'),
    result: document.getElementById('resultScreen'),
    loading: document.getElementById('loadingScreen')
};

const elements = {
    // スタート画面
    difficultyBtns: document.querySelectorAll('.difficulty-btn'),

    // クイズ画面
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    scoreText: document.getElementById('scoreText'),
    excerptText: document.getElementById('excerptText'),
    moreBtn: document.getElementById('moreBtn'),
    hintBtn: document.getElementById('hintBtn'),
    hintDisplay: document.getElementById('hintDisplay'),
    authorHint: document.getElementById('authorHint'),
    choicesContainer: document.getElementById('choicesContainer'),
    feedback: document.getElementById('feedback'),
    nextBtn: document.getElementById('nextBtn'),

    // 結果画面
    finalScore: document.getElementById('finalScore'),
    resultMessage: document.getElementById('resultMessage'),
    resultDetails: document.getElementById('resultDetails'),
    retryBtn: document.getElementById('retryBtn')
};

// ============================================
// イベントリスナー設定
// ============================================
function setupEventListeners() {
    // 難易度選択
    elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            startQuiz(difficulty);
        });
    });

    // Moreボタン
    elements.moreBtn.addEventListener('click', showMoreText);

    // ヒントボタン
    elements.hintBtn.addEventListener('click', showHint);

    // 次へボタン
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', nextQuestion);
        console.log('次へボタンのイベントリスナー設定完了');
    } else {
        console.error('nextBtnが見つかりません');
    }

    // もう一度挑戦
    elements.retryBtn.addEventListener('click', resetGame);
}

// ============================================
// 画面切り替え
// ============================================
function showScreen(screenName) {
    // ローディング画面以外の画面からactiveを削除
    screens.start.classList.remove('active');
    screens.quiz.classList.remove('active');
    screens.result.classList.remove('active');

    // 指定された画面をactiveに
    screens[screenName].classList.add('active');

    console.log(`画面切り替え: ${screenName}`);
}

function showLoading(show) {
    if (show) {
        screens.loading.classList.add('active');
    } else {
        screens.loading.classList.remove('active');
    }
}

// ============================================
// データ取得
// ============================================
async function fetchQuestions(difficulty) {
    try {
        console.log(`問題データを取得中... 難易度: ${difficulty}`);

        // questions-data.jsから問題データを取得
        if (typeof QUESTIONS_DATA === 'undefined') {
            throw new Error('問題データが読み込まれていません。questions-data.jsファイルを確認してください。');
        }

        let questions = QUESTIONS_DATA;

        // 難易度フィルタリング
        if (difficulty && difficulty !== 'all') {
            questions = questions.filter(q => q.difficulty === difficulty);
        }

        console.log(`取得した問題数: ${questions.length}`);
        return questions;

    } catch (error) {
        console.error('データ取得エラー:', error);
        alert(`問題データの取得に失敗しました。\n\n${error.message}\n\nquestions-data.jsファイルが存在するか確認してください。`);
        showScreen('start');
        showLoading(false);
        return null;
    }
}

// ============================================
// クイズ開始
// ============================================
async function startQuiz(difficulty) {
    console.log(`クイズを開始: 難易度=${difficulty}`);

    showLoading(true);

    // 状態をリセット
    gameState.difficulty = difficulty;
    gameState.score = 0;
    gameState.currentQuestionIndex = 0;
    gameState.answers = [];

    // 問題データを取得
    const questions = await fetchQuestions(difficulty);

    if (!questions || questions.length === 0) {
        alert('問題データが見つかりません。Excelファイルに問題を追加してexcel_to_json.pyを実行してください。');
        showLoading(false);
        showScreen('start');
        return;
    }

    gameState.allQuestions = questions;

    // ランダムに問題を選択
    gameState.currentQuestions = selectRandomQuestions(questions, CONFIG.TOTAL_QUESTIONS);

    if (gameState.currentQuestions.length < CONFIG.TOTAL_QUESTIONS) {
        alert(`問題数が不足しています（${gameState.currentQuestions.length}問）。Excelファイルに問題を追加してください。`);
        showLoading(false);
        showScreen('start');
        return;
    }

    showScreen('quiz');
    showLoading(false);

    loadQuestion();
}

// ランダムに問題を選択
function selectRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ============================================
// 問題表示
// ============================================
function loadQuestion() {
    const questionNum = gameState.currentQuestionIndex + 1;
    console.log(`問題 ${questionNum} を読み込み中...`);

    // 状態をリセット
    gameState.currentQuestion = gameState.currentQuestions[gameState.currentQuestionIndex];
    gameState.moreClickCount = 0;
    gameState.currentExcerptLength = CONFIG.INITIAL_EXCERPT_LENGTH;
    gameState.hintUsed = false;

    // UI更新
    updateProgress();
    updateScore();
    displayExcerpt();
    generateChoices();
    resetButtons();

    // フィードバックオーバーレイを非表示
    const feedbackOverlay = document.getElementById('feedbackOverlay');
    feedbackOverlay.classList.remove('show');

}

// 進捗バー更新
function updateProgress() {
    const progress = ((gameState.currentQuestionIndex + 1) / CONFIG.TOTAL_QUESTIONS) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `問題 ${gameState.currentQuestionIndex + 1} / ${CONFIG.TOTAL_QUESTIONS}`;
}

// スコア更新
function updateScore() {
    elements.scoreText.textContent = `正解数: ${gameState.score}`;
}

// 本文を表示
function displayExcerpt() {
    const fullText = gameState.currentQuestion.text;
    const displayText = fullText.substring(0, gameState.currentExcerptLength);

    // すべて表示したかチェック
    const isComplete = gameState.currentExcerptLength >= fullText.length;

    elements.excerptText.textContent = displayText + (isComplete ? '' : '...');

    // Moreボタンの表示制御
    if (isComplete) {
        elements.moreBtn.disabled = true;
        elements.moreBtn.textContent = 'すべて表示済み';
    } else {
        elements.moreBtn.disabled = false;
        elements.moreBtn.textContent = 'もっと読む';
    }
}

// もっと読む
function showMoreText() {
    gameState.moreClickCount++;
    gameState.currentExcerptLength += CONFIG.EXCERPT_INCREMENT;

    console.log(`More clicked: ${gameState.moreClickCount}回目`);

    displayExcerpt();

    // ヒントボタンの表示
    if (gameState.moreClickCount >= CONFIG.HINT_AFTER_MORE_COUNT && !gameState.hintUsed) {
        elements.hintBtn.style.display = 'inline-block';
    }
}

// ヒント表示
function showHint() {
    gameState.hintUsed = true;
    elements.authorHint.textContent = gameState.currentQuestion.author;
    elements.hintDisplay.style.display = 'block';
    elements.hintBtn.disabled = true;
    elements.hintBtn.textContent = 'ヒント使用済み';

    console.log('ヒント表示: ' + gameState.currentQuestion.author);
}

// 選択肢を生成
function generateChoices() {
    const correctAnswer = gameState.currentQuestion.title;

    // 間違いの選択肢を生成（同じ難易度の他の問題から選ぶ）
    const otherQuestions = gameState.allQuestions.filter(q =>
        q.title !== correctAnswer && q.difficulty === gameState.currentQuestion.difficulty
    );

    const wrongAnswers = selectRandomQuestions(otherQuestions, 3).map(q => q.title);

    // 選択肢をシャッフル
    const choices = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

    // HTML生成
    elements.choicesContainer.innerHTML = choices.map(choice => `
        <button class="choice-btn" data-answer="${choice}">
            ${choice}
        </button>
    `).join('');

    // イベントリスナー追加
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.addEventListener('click', () => handleAnswer(btn.dataset.answer));
    });
}

// ボタンをリセット
function resetButtons() {
    elements.moreBtn.style.display = 'inline-block';
    elements.moreBtn.disabled = false;
    elements.hintBtn.style.display = 'none';
    elements.hintBtn.disabled = false;
    elements.hintDisplay.style.display = 'none';
}

// ============================================
// 回答処理
// ============================================
function handleAnswer(selectedAnswer) {
    const correctAnswer = gameState.currentQuestion.title;
    const isCorrect = selectedAnswer === correctAnswer;

    console.log(`回答: ${selectedAnswer}, 正解: ${correctAnswer}, 結果: ${isCorrect ? '正解' : '不正解'}`);

    // スコア更新
    if (isCorrect) {
        gameState.score++;
        updateScore();
    }

    // 回答記録
    gameState.answers.push({
        question: gameState.currentQuestion.title,
        author: gameState.currentQuestion.author,
        userAnswer: selectedAnswer,
        correctAnswer: correctAnswer,
        isCorrect: isCorrect
    });

    // 選択肢を無効化
    document.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = true;

        if (btn.dataset.answer === correctAnswer) {
            btn.classList.add('correct');
        } else if (btn.dataset.answer === selectedAnswer && !isCorrect) {
            btn.classList.add('incorrect');
        }
    });

    // フィードバック表示
    showFeedback(isCorrect, correctAnswer);

    // Moreボタンとヒントボタンを無効化
    elements.moreBtn.disabled = true;
    elements.hintBtn.disabled = true;

    // 次へボタンはオーバーレイ内にあるので個別の表示は不要
}

// フィードバック表示
function showFeedback(isCorrect, correctAnswer) {
    const feedbackOverlay = document.getElementById('feedbackOverlay');
    elements.feedback.className = isCorrect ? 'feedback correct' : 'feedback incorrect';

    if (isCorrect) {
        elements.feedback.innerHTML = `
            <p>🎉 正解です！</p>
            <p><strong>『${correctAnswer}』</strong> / ${gameState.currentQuestion.author}</p>
        `;
    } else {
        elements.feedback.innerHTML = `
            <p>❌ 残念...正解は</p>
            <p><strong>『${correctAnswer}』</strong> / ${gameState.currentQuestion.author}</p>
        `;
    }

    // オーバーレイを表示（アニメーション付き）
    feedbackOverlay.classList.add('show');
}

// ============================================
// 次の問題へ
// ============================================
function nextQuestion() {
    console.log('nextQuestion called');
    gameState.currentQuestionIndex++;

    if (gameState.currentQuestionIndex < CONFIG.TOTAL_QUESTIONS) {
        loadQuestion();
    } else {
        showResult();
    }
}
}

// ============================================
// 結果表示
// ============================================
function showResult() {
    console.log(`クイズ終了。スコア: ${gameState.score}/${CONFIG.TOTAL_QUESTIONS}`);

    showScreen('result');

    // スコア表示
    elements.finalScore.textContent = gameState.score;

    // メッセージ表示
    const percentage = (gameState.score / CONFIG.TOTAL_QUESTIONS) * 100;
    let message = '';

    if (percentage === 100) {
        message = '🎊 完璧です！すべて正解！';
    } else if (percentage >= 80) {
        message = '🎉 素晴らしい！よく読んでいますね！';
    } else if (percentage >= 60) {
        message = '👏 なかなかやりますね！';
    } else if (percentage >= 40) {
        message = '📚 もっと読書を楽しんでみては？';
    } else {
        message = '💪 次回は頑張りましょう！';
    }

    elements.resultMessage.textContent = message;

    // 詳細表示
    displayResultDetails();
}

// 結果詳細を表示
function displayResultDetails() {
    let html = '<h3>回答詳細</h3>';

    gameState.answers.forEach((answer, index) => {
        const className = answer.isCorrect ? 'correct' : 'incorrect';
        const icon = answer.isCorrect ? '✓' : '✗';

        html += `
            <div class="result-item ${className}">
                <p><strong>問題${index + 1}:</strong> ${icon} ${answer.isCorrect ? '正解' : '不正解'}</p>
                <p><strong>作品:</strong> 『${answer.correctAnswer}』 / ${answer.author}</p>
                ${!answer.isCorrect ? `<p><strong>あなたの回答:</strong> ${answer.userAnswer}</p>` : ''}
            </div>
        `;
    });

    elements.resultDetails.innerHTML = html;
}

// ============================================
// ゲームリセット
// ============================================
function resetGame() {
    console.log('ゲームをリセット');
    showScreen('start');
}

// ============================================
// 初期化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('書籍名クイズ - クイズ初期化');
    setupEventListeners();
    showScreen('start');
});
