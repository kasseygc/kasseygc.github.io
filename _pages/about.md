---
permalink: /
layout: home
lang: en
title: "About me"
tagline: "Language Engineer"
redirect_from:
  - /about/
  - /about.html

# Hero
role: "Language engineer working across machine learning, NLP, and the evaluation and governance of language models."

# About (the page body below is the second paragraph)
lead: "As a language engineer, I spend my time bridging the gap between human language and machine learning. Whether I'm training language models, building data pipelines, or designing evaluations, my goal is to keep AI honest, safe, and accountable, both technically and in how it's governed."
focus:
  - "Training & fine-tuning language models"
  - "Model evaluation, red-teaming & robustness"
  - "AI governance, safety & responsible-AI practices"
  - "Data quality, provenance & pipelines for ML"
  - "Computational linguistics & multilingual NLP"
education:
  - "MS Computer Science — The University of Texas at Austin, 2026"
  - "BA Linguistics and Computer Science — Columbia University, 2024"

# Selected work, in display order. kind: eng | ling
selected_work:
  - title: "Teaching Small Language Models to Reason: SFT and Rejection-Sampling Fine-Tuning"
    tag: "NLP · Fine-Tuning & RL"
    kind: eng
    url: https://github.com/kasseygc/llm_reasoning
    desc: "Took SmolLM2 from chain-of-thought prompting to LoRA supervised fine-tuning and rejection-sampling fine-tuning, an offline RL method that self-distills correct reasoning traces."
  - title: "Memory-Efficient LLM Fine-Tuning: Quantization, LoRA & QLoRA from Scratch"
    tag: "ML Systems · Efficiency"
    kind: eng
    url: https://github.com/kasseygc/efficient_llm
    desc: "Half-precision inference, 4-bit block quantization, LoRA and QLoRA reimplemented in PyTorch, cutting a 73 MB network's footprint ~7× while staying within tolerance of full precision."
  - title: "Skill-Adjusted Expected Goals in the NHL: A Two-Phase Machine Learning Framework"
    tag: "Machine Learning · Sports Analytics"
    kind: eng
    url: /tech/#skill-adjusted-expected-goals-in-the-nhl-a-two-phase-machine-learning-framework
    desc: "A two-phase ML pipeline over ~2M NHL shots (2007–2025); an XGBoost model reaches 0.7900 AUC, extended with shooter and goalie talent adjustments."
  - title: "Beyond Pattern Matching: Dataset Artifacts in SQuAD"
    tag: "NLP · Robustness"
    kind: eng
    url: /tech/#beyond-pattern-matching-dataset-artifacts-in-squad
    desc: "Systematic analysis of reading-comprehension shortcuts, with adversarial training and question-type-aware loss yielding a 1.4× robustness gain on ELECTRA-small."
  - title: "Vision-Based Autonomous Driving Agent"
    tag: "Computer Vision · Deep Learning"
    kind: eng
    url: /tech/#vision-based-autonomous-driving-agent
    desc: "An end-to-end deep learning system for vehicle navigation: a multi-task CNN with U-Net skip connections for segmentation and depth, plus a Transformer planner that predicts waypoints from track boundaries."
  - title: "A Comparative Study of Sentence-Final Particles Acquisition in Monolingual, Bilingual, and Trilingual Cantonese-Speaking Children: A Corpus-Driven Approach"
    tag: "Linguistics · Multilingualism"
    kind: ling
    url: /portfolio/seniorthesis/
    desc: "A statistical comparison of how monolingual, bilingual, and trilingual Cantonese-speaking children acquire sentence-final particles, drawn from 10,000+ multilingual utterances."

writing_lead: "Occasional notes on linguistics, languages, arts, and history."
---
My work spans the entire lifecycle of an NLP system. From validating messy, multilingual data to engineering end-to-end ML pipelines, I love tackling the complex, real-world problems of language technology at scale.
