#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Excelファイルから問題データを読み込んでJSON形式に変換するスクリプト

使い方:
    python3 excel_to_json.py

実行すると、questions-data.xlsx を読み込んで questions-data.js を生成します。
"""

import pandas as pd
import json
import sys
from pathlib import Path

def excel_to_json(excel_file='questions-data.xlsx', output_file='questions-data.js'):
    """
    ExcelファイルをJSONファイルに変換
    
    Args:
        excel_file: 入力Excelファイル名
        output_file: 出力JSONファイル名
    """
    try:
        # Excelファイルを読み込み
        print(f"📖 {excel_file} を読み込み中...")
        df = pd.read_excel(excel_file, sheet_name='問題データ')
        
        # 空行を除去
        df = df.dropna(subset=['作品名'])
        
        # データをリスト形式に変換
        questions = []
        for index, row in df.iterrows():
            question = {
                'id': int(row['ID']) if pd.notna(row['ID']) else index + 1,
                'title': str(row['作品名']).strip(),
                'author': str(row['著者名']).strip(),
                'difficulty': str(row['難易度']).strip().lower(),
                'text': str(row['本文一節']).strip()
            }
            questions.append(question)
        
        # JavaScript形式で出力（const QUESTIONS_DATA = [...];）
        js_content = f"// このファイルは自動生成されました\n"
        js_content += f"// 元ファイル: {excel_file}\n"
        js_content += f"// 生成日時: {pd.Timestamp.now()}\n\n"
        js_content += f"const QUESTIONS_DATA = {json.dumps(questions, ensure_ascii=False, indent=2)};\n"
        
        # ファイルに書き込み
        output_path = Path(output_file)
        output_path.write_text(js_content, encoding='utf-8')
        
        print(f"✅ 変換完了！")
        print(f"   問題数: {len(questions)}件")
        print(f"   出力先: {output_file}")
        
        # 難易度別の件数を表示
        difficulty_counts = {}
        for q in questions:
            diff = q['difficulty']
            difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1
        
        print(f"\n📊 難易度別の問題数:")
        for diff, count in sorted(difficulty_counts.items()):
            print(f"   {diff}: {count}件")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ エラー: {excel_file} が見つかりません")
        print(f"   同じフォルダに {excel_file} を配置してください")
        return False
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = excel_to_json()
    sys.exit(0 if success else 1)
