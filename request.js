// GoogleスプレッドシートのAPI URL
const API_URL = 'https://script.google.com/macros/s/AKfycbw6QINhoN4D7mk-y_pvdd25rQ5jyK28iHb78rsF74RxJerAnek4oDlEJ5d81AQbYnbfRw/exec';

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
            showMessage('合言葉が異なります。全角/半角に注意して再度ご入力ください。', 'error');
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
            <h2>いろいろ注文が多くてうるさかったでしょう。お気の毒でした。<br>もうこれだけです。</h2>
            <div class="book-info">
                <p class="book-title">📖 お届けする本：<strong>${bookTitle}</strong></p>
            </div>
            <div class="url-container">
                <a href="${deliveryUrl}" target="_blank" class="delivery-button">匿名配送URLはこちら</a>
            </div>
            <p class="instruction">上記のボタンをクリックして、配送先情報を入力してください。</p>
            <p class="warning">⚠️ スマホで開いてください（パソコン不可）⚠️</p>
        </div>
    `;
    resultDiv.style.display = 'block';
    
    // フォームとタイトルを非表示
    document.getElementById('passphraseForm').style.display = 'none';
    document.getElementById('passphraseTitle').style.display = 'none';
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
