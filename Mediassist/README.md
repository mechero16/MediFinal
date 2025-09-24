# Mediassist: Disease Prediction Using Machine Learning

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3.2-orange)
![Node.js](https://img.shields.io/badge/Node.js-22.18.0-green)

---

## Overview

**Mediassist** is an AI-powered disease prediction system that takes a set of symptoms as input and predicts the most probable disease. The system leverages **machine learning (Random Forest Classifier)** for accurate predictions and exposes a **Node.js server** for integration with web or mobile applications.

---

## Features

- Predicts diseases based on symptoms.
- Provides probability scores for all possible diseases.
- Trained on real-world dataset containing common diseases and symptoms.
- Easy integration via Node.js backend.
- Highly optimized Random Forest model for accuracy and performance.

---

## Dataset

The model uses the dataset from [Kaggle: Disease Prediction Using Machine Learning](https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning).

- Training Data: `Training.csv`
- Testing Data: `Testing.csv`
- Number of symptoms/features: 132+
- Number of unique diseases: 41+

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/Mediassist.git
cd Mediassist
```

## Run the service


```bash
cd Mediassist
Python setup.py
```

