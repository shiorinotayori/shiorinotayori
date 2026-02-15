// GoogleスプレッドシートのAPI URL
const API_URL = 'https://script.google.com/macros/s/AKfycbw6QINhoN4D7mk-y_pvdd25rQ5jyK28iHb78rsF74RxJerAnek4oDlEJ5d81AQbYnbfRw/exec';

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
    const source = document.querySelector('input[name="source"]:checked').value;
    const sourceOther = document.getElementById('sourceOther').value;
    const bookFeedback = document.getElementById('bookFeedback').value;
    const activityFeedback = document.getElementById('activityFeedback').value;
    const publishConsent = document.querySelector('input[name="publishConsent"]:checked').value;
    
    try {
        const params = new URLSearchParams({
            action: 'submitFeedback',
            source: source,
            sourceOther: sourceOther,
            bookFeedback: bookFeedback,
            activityFeedback: activityFeedback,
            publishConsent: publishConsent
        });
        
        // GAS送信のポイント: mode: 'no-cors' を指定
        await fetch(`${API_URL}?${params.toString()}`, {
            method: 'GET',
            mode: 'no-cors' // これを加えることでブラウザのブロックを回避します
        });
        
        // 送信が完了してから画面を切り替える
        document.getElementById('formContainer').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (error) {
        console.error('送信エラー:', error);
        alert('送信中にエラーが発生しました。時間を置いて再度お試しください。');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = '送信';
    }
});