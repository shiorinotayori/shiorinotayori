// GoogleスプレッドシートのAPI URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyirCi56H1qQm89RidgL7aPLCMVuMkw_YmIFDpNvcRM9Vug5L3H9EbAkx8q3FCeiALkmg/exec';

// 合言葉フォームの処理
document.getElementById('passphraseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const passphrase = document.getElementById('passphraseInput').value.trim();
    const submitButton = document.querySelector('.submit-button');
    const resultDiv = document.getElementById('result');
    
    if (!passphrase) {
        showMessage('合言葉を入力してください', 'error');
        return;
    }
    
    // ボタンを無効化してローディング表示
    submitButton.disabled = true;
    submitButton.textContent = '確認中...';
    
    try {
        // GoogleスプレッドシートAPIに問い合わせ
        const response = await fetch(`${API_URL}?passphrase=${encodeURIComponent(passphrase)}`);
        const data = await response.json();
        
        if (data.success) {
            // 合言葉が一致した場合
            showSuccess(data.bookTitle, data.url);
        } else {
            // 合言葉が一致しなかった場合
            showMessage('合言葉が見つかりませんでした。もう一度確認してください。', 'error');
        }
    } catch (error) {
        console.error('エラー:', error);
        showMessage('エラーが発生しました。しばらくしてからもう一度お試しください。', 'error');
    } finally {
        // ボタンを元に戻す
        submitButton.disabled = false;
        submitButton.textContent = '確定';
    }
});

// 成功時の表示
function showSuccess(bookTitle, deliveryUrl) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="success-message">
            <h2>✓ 合言葉が確認できました</h2>
            <div class="book-info">
                <p class="book-title">📖 お届けする本：<strong>${bookTitle}</strong></p>
            </div>
            <div class="url-container">
                <p class="url-label">匿名配送URLはこちら：</p>
                <a href="${deliveryUrl}" target="_blank" class="delivery-url">${deliveryUrl}</a>
            </div>
            <p class="instruction">上記のURLをクリックして、配送先情報を入力してください。</p>
        </div>
    `;
    resultDiv.style.display = 'block';
    
    // フォームを非表示
    document.getElementById('passphraseForm').style.display = 'none';
}

// エラーメッセージ表示
function showMessage(message, type) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = `
        <div class="message ${type}">
            <p>${message}</p>
        </div>
    `;
    resultDiv.style.display = 'block';
    
    // 3秒後にメッセージを消す
    setTimeout(() => {
        resultDiv.style.display = 'none';
    }, 3000);
}
