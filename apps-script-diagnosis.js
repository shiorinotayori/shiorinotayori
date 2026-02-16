// ============================================
// 設定
// ============================================
const MONTHLY_DIAGNOSIS_LIMIT = 1000;  // 月間診断回数の上限

// ============================================
// 診断機能（新規追加）
// ============================================

// POST リクエスト（診断実行）
function doPost(e) {
  try {
    // POSTデータを取得
    const data = JSON.parse(e.postData.contents);
    
    // アクション別に処理を振り分け
    if (data.action === 'diagnose') {
      return handleDiagnosis(data);
    } else if (data.action === 'submitFeedback') {
      return handleFeedback(data);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: '不明なアクションです' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('doPostエラー: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// 診断処理
function handleDiagnosis(data) {
  try {
    Logger.log('診断リクエスト受信');
    
    // 今月の診断回数をチェック
    const currentCount = getCurrentMonthDiagnosisCount();
    Logger.log('今月の診断回数: ' + currentCount);
    
    if (currentCount >= MONTHLY_DIAGNOSIS_LIMIT) {
      Logger.log('診断回数上限に達しました');
      return ContentService.createTextOutput(
        JSON.stringify({ 
          success: false, 
          message: `今月の診断回数が上限（${MONTHLY_DIAGNOSIS_LIMIT}回）に達しました。来月またお試しください。` 
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Claude APIを呼び出し
    const diagnosisResult = callClaudeAPI(data);
    
    // 診断回数をカウントアップ
    incrementDiagnosisCount();
    Logger.log('診断完了。カウントを1増やしました');
    
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        diagnosis: diagnosisResult 
      })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('診断処理エラー: ' + error.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: false, 
        message: '診断中にエラーが発生しました: ' + error.toString() 
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Claude API呼び出し
function callClaudeAPI(data) {
  const apiKey = data.apiKey;
  const model = data.model;
  const systemPrompt = data.systemPrompt;
  const books = data.books;
  const maxTokens = data.maxTokens || 4000;
  const temperature = data.temperature || 0.85;
  
  // APIキーとモデルが設定されているか確認
  if (!apiKey || !model) {
    throw new Error('APIキーまたはモデルが設定されていません');
  }
  
  const url = 'https://api.anthropic.com/v1/messages';
  
  const payload = {
    model: model,
    max_tokens: maxTokens,
    temperature: temperature,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `以下の書籍で性格診断をしてください:\n\n${books}`
      }
    ]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  Logger.log('Claude APIを呼び出し中...');
  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();
  const responseText = response.getContentText();
  
  Logger.log('APIレスポンスコード: ' + responseCode);
  
  if (responseCode !== 200) {
    Logger.log('APIエラーレスポンス: ' + responseText);
    throw new Error('Claude API呼び出しに失敗しました: ' + responseText);
  }
  
  const result = JSON.parse(responseText);
  
  // テキストレスポンスを抽出
  if (result.content && result.content.length > 0) {
    return result.content[0].text;
  } else {
    throw new Error('Claude APIから有効なレスポンスが返されませんでした');
  }
}

// 今月の診断回数を取得
function getCurrentMonthDiagnosisCount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('診断回数');
  
  // シートが存在しない場合は作成
  if (!sheet) {
    sheet = ss.insertSheet('診断回数');
    sheet.appendRow(['年月', '診断回数', '最終更新日時']);
  }
  
  const currentMonth = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM');
  const data = sheet.getDataRange().getValues();
  
  // 今月のデータを検索
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === currentMonth) {
      return data[i][1] || 0;
    }
  }
  
  // 今月のデータがない場合は0
  return 0;
}

// 診断回数をカウントアップ
function incrementDiagnosisCount() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('診断回数');
  
  if (!sheet) {
    sheet = ss.insertSheet('診断回数');
    sheet.appendRow(['年月', '診断回数', '最終更新日時']);
  }
  
  const currentMonth = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM');
  const now = new Date();
  const data = sheet.getDataRange().getValues();
  
  // 今月のデータを検索
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === currentMonth) {
      const currentCount = data[i][1] || 0;
      sheet.getRange(i + 1, 2).setValue(currentCount + 1);
      sheet.getRange(i + 1, 3).setValue(now);
      found = true;
      break;
    }
  }
  
  // 今月のデータがない場合は新規追加
  if (!found) {
    sheet.appendRow([currentMonth, 1, now]);
  }
}

// ============================================
// 感想機能（既存）
// ============================================

// 感想フォームからのデータを受け取る
function handleFeedback(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('感想');
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: '感想シートが見つかりません' })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      data.source || '',
      data.bookFeedback || '',
      data.activityFeedback || '',
      data.publishConsent || '',
      data.sourceOther || ''
    ]);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: '感想を受け取りました' })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// 合言葉確認機能（既存）
// ============================================

function doGet(e) {
  // 感想投稿の場合
  if (e.parameter && e.parameter.action === 'submitFeedback') {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('感想');
      
      if (!sheet) {
        return ContentService.createTextOutput('Error: シートが見つかりません');
      }
      
      const timestamp = new Date();
      
      sheet.appendRow([
        timestamp,
        e.parameter.source || '',
        e.parameter.bookFeedback || '',
        e.parameter.activityFeedback || '',
        e.parameter.publishConsent || '',
        e.parameter.sourceOther || ''
      ]);
      
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: '感想を受け取りました' })
      ).setMimeType(ContentService.MimeType.JSON);
      
    } catch (error) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: error.toString() })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // 合言葉確認の場合（既存の処理）
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: 'パラメータがありません' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const passphrase = e.parameter.passphrase;
  
  if (!passphrase) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: '合言葉が入力されていません' })
    ).setMimeType(ContentService.MimeType.JSON);
  }
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('受取人名簿');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const storedPassphrase = row[3];
    const deliveryUrl = row[4];
    const bookTitle = row[2];
    
    if (storedPassphrase === passphrase) {
      return ContentService.createTextOutput(
        JSON.stringify({
          success: true,
          url: deliveryUrl,
          bookTitle: bookTitle
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(
    JSON.stringify({
      success: false,
      message: '合言葉が見つかりませんでした'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

// A列（受取人ID）の全角数字を半角に自動変換
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  if (range.getColumn() === 1 && sheet.getName() === '受取人名簿') {
    const value = range.getValue();
    
    if (value && range.getRow() > 1) {
      const converted = String(value).replace(/[０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
      });
      
      if (converted !== String(value)) {
        range.setValue(converted);
      }
    }
  }
}
