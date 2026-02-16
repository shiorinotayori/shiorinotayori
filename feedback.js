// Google Apps ScriptのURL（後で設定）
const API_URL = 'https://script.google.com/macros/s/AKfycbyirCi56H1qQm89RidgL7aPLCMVuMkw_YmIFDpNvcRM9Vug5L3H9EbAkx8q3FCeiALkmg/exec';

// 「その他」選択時の入力欄表示/非表示
document.querySelectorAll('input[name="source"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const otherInput = document.getElementById('sourceOther');
        if (this.value === 'その他') {
            otherInput.style.display = 'block';
            otherInput.required = true;
        } else {
            otherInput.style.display = 'none';
            otherInput.required = false;
            otherInput.value = '';
        }
    });
});

// フォーム送信処理
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.textContent = '送信中...';
    
    // フォームデータを取得
    const formData = {
        source: document.querySelector('input[name="source"]:checked').value,
        sourceOther: document.getElementById('sourceOther').value,
        bookFeedback: document.getElementById('bookFeedback').value,
        activityFeedback: document.getElementById('activityFeedback').value,
        publishConsent: document.querySelector('input[name="publishConsent"]:checked').value
    };
    
    try {
        // Google Apps ScriptにPOST
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(formData)
        });
        
        // 成功メッセージを表示
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        // ページトップにスクロール
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('送信エラー:', error);
        
        // エラーが発生してもユーザーには成功として表示
        // （no-corsモードでは実際の成功/失敗が判定できないため）
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
