# 栞のたより - ホームページ

生きづらさを抱えた方に、心に寄り添う本を無償でプレゼントする活動「栞のたより」のホームページです。

## 📚 機能

- **本のプレゼント活動紹介**
- **合言葉による本の受け取り**（Googleスプレッドシート連携）
- **感想投稿フォーム**（Googleスプレッドシート連携）
- **書籍DE性格診断**（Claude API使用）

---

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/shiorinotayori/shiorinotayori.git
cd shiorinotayori
```

### 2. config.jsの設定

#### Step 1: サンプルファイルをコピー

```bash
cp config.js.sample config.js
```

#### Step 2: config.jsを編集

`config.js`を開いて、以下を設定：

```javascript
const API_CONFIG = {
    CLAUDE_API_KEY: 'sk-ant-api03-xxx...',  // ← Claude APIキーを入力
    CLAUDE_MODEL: 'claude-opus-4-5-20251101',  // ← そのまま
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/xxx.../exec'  // ← Apps ScriptのURLを入力
};
```

### 3. Claude APIキーの取得

1. https://console.anthropic.com/ にアクセス
2. アカウント作成/ログイン
3. 支払い情報を登録（クレジットカード）
4. クレジットを購入（$5〜）
5. 「API Keys」→「Create Key」でAPIキーを作成
6. APIキーをコピーして`config.js`に貼り付け

### 4. Apps Scriptの設定

1. Googleスプレッドシートを開く
2. 「拡張機能」→「Apps Script」
3. `apps-script-diagnosis.js`の内容を貼り付け
4. 保存
5. 「デプロイ」→「新しいデプロイ」→「ウェブアプリ」
6. 「アクセスできるユーザー」を「全員」に設定
7. 「デプロイ」をクリック
8. デプロイURLをコピーして`config.js`に貼り付け

### 5. スプレッドシートの準備

以下のシートを作成：
- **受取人名簿**：合言葉管理用
- **感想**：感想投稿用
- **診断回数**：月間診断回数管理用（Apps Scriptが自動作成）

### 6. GitHubにプッシュ

⚠️ **重要**: `config.js`はGitHubにアップロードしないでください！

```bash
git add .
git commit -m "書籍DE性格診断を追加"
git push
```

`.gitignore`に`config.js`が含まれているため、自動的に除外されます。

---

## 💰 料金について

### Claude API（Opus 4.5）

- 入力：約$15 / 1Mトークン
- 出力：約$75 / 1Mトークン
- **診断1回あたり**：約$0.20〜0.30（約30〜50円）
- **月1000回の場合**：約$200〜300（約30,000〜45,000円）

月間上限は1000回に設定されていますが、Apps Scriptの設定で変更可能です。

---

## 🔒 セキュリティ

### APIキーの管理

- ✅ `config.js`に記載
- ✅ `.gitignore`で除外（GitHubにアップロードされない）
- ✅ ローカルでのみ使用

### 重要な注意

- `config.js`を**絶対にGitHubにアップロードしない**
- APIキーを他人に共有しない
- 使用量制限を設定する（Console.anthropic.com → Settings → Limits）

---

## 📝 ライセンス

このプロジェクトは個人活動として運営されています。

---

## 💬 お問い合わせ

- X（旧Twitter）: [@shiorinotayori](https://x.com/shiorinotayori)
- Email: shiorinotayori@gmail.com
