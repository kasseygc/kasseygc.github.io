---
permalink: /
layout: home
lang: zh-HK
title: "關於我"
tagline: "語言工程師"

# Hero
role: "語言工程師，專注機器學習、NLP，以及語言模型的評估與治理。"

# About (the page body below is the second paragraph)
lead: "作為語言工程師，我的工作為連繫人類語言與機器學習。無論是訓練語言模型、建立數據 pipeline，還是設計評估方案，我的目標一致：讓 AI 保持誠實、安全、可問責，技術上如是，治理上亦然。"
focus:
  - "語言模型訓練和微調"
  - "模型評估、紅隊測試及穩健性"
  - "AI 治理、安全與負責任 AI 實踐"
  - "機器學習的數據質素、來源追溯及 pipeline"
  - "計算語言學及多語言 NLP"
education:
  - "電腦科學碩士 — The University of Texas at Austin，2026"
  - "語言學及電腦科學學士 — Columbia University，2024"

# Selected work, in display order. kind: eng | ling
selected_work:
  - title: "Teaching Small Language Models to Reason: SFT and Rejection-Sampling Fine-Tuning"
    tag: "NLP · 微調及強化學習"
    kind: eng
    url: https://github.com/kasseygc/llm_reasoning
    desc: "帶領 SmolLM2 由思維鏈提示，進展到 LoRA 監督式微調，再到拒絕採樣微調（RFT）——一種自我蒸餾正確推理過程的離線強化學習方法。"
  - title: "Memory-Efficient LLM Fine-Tuning: Quantization, LoRA & QLoRA from Scratch"
    tag: "機器學習系統 · 效率"
    kind: eng
    url: https://github.com/kasseygc/efficient_llm
    desc: "以 PyTorch 從零重新實作半精度推理、4 位元分塊量化、LoRA 及 QLoRA，令一個 73 MB 網絡的記憶體佔用減少約 7 倍，輸出仍在全精度的容差範圍內。"
  - title: "Skill-Adjusted Expected Goals in the NHL: A Two-Phase Machine Learning Framework"
    tag: "機器學習 · 體育數據分析"
    kind: eng
    url: /tech/#skill-adjusted-expected-goals-in-the-nhl-a-two-phase-machine-learning-framework
    desc: "以約 200 萬次 NHL 射門（2007 至 2025 年）建立的兩階段機器學習 pipeline；XGBoost 模型 AUC 達 0.7900，並進一步加入射手和守門員能力調整。"
  - title: "Beyond Pattern Matching: Dataset Artifacts in SQuAD"
    tag: "NLP · 穩健性"
    kind: eng
    url: /tech/#beyond-pattern-matching-dataset-artifacts-in-squad
    desc: "系統分析閱讀理解模型走捷徑的問題；透過對抗訓練和按問題類型調整的損失函數，令 ELECTRA-small 的穩健性提升 1.4 倍。"
  - title: "Vision-Based Autonomous Driving Agent"
    tag: "電腦視覺 · 深度學習"
    kind: eng
    url: /tech/#vision-based-autonomous-driving-agent
    desc: "端到端的自動駕駛深度學習系統：以多任務 CNN（配合 U-Net 跳躍連接）處理影像分割和深度估計，再由 Transformer 規劃器根據賽道邊界預測行車路徑點。"
  - title: "A Comparative Study of Sentence-Final Particles Acquisition in Monolingual, Bilingual, and Trilingual Cantonese-Speaking Children: A Corpus-Driven Approach"
    tag: "語言學 · 多語現象"
    kind: ling
    url: /portfolio/seniorthesis/
    desc: "比較單語、雙語及三語粵語兒童習得句末助詞的研究，分析逾 10,000 句多語言語料。"

writing_lead: "不定期分享語言學、語言、藝術與歷史方面的筆記。"
---
我的工作貫穿 NLP 系統的整個生命週期：由驗證雜亂的多語言數據，到開發端到端的機器學習 pipeline，志在處理語言科技在真實世界、大規模應用中的種種難題。
