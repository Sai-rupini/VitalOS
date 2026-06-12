# VITAL.OS: Ensemble-Weighted Neural Diagnostic Engine

VITAL.OS is a high-precision medical diagnostic system designed to bridge the "clinical diagnostic gap". By moving away from single-model thresholds that create blind spots, VITAL.OS utilizes a multi-model "Ensemble Tournament" architecture to provide reliable diabetes risk assessments and personalized clinical roadmaps.

## 🏥 The Problem
* **The Diagnostic Gap:** Traditional diagnostic systems rely on single-model thresholds that create significant blind spots in patient assessment.
* **Lack of Nuance:** Binary classification approaches lack the nuance required for complex metabolic conditions.
* **Inconsistency:** Single-model architectures produce inconsistent results across diverse patient populations, leading to elevated false rates.
* **Clinical Impact:** Conflicting risk assessments erode trust in medical AI systems and complicate treatment planning.

## 🚀 The Solution: The Ensemble Tournament
VITAL.OS utilizes a tournament-based approach that mimics the medical practice of seeking second opinions. The system processes patient parameters through three distinct mathematical lenses simultaneously:

* **Random Forest:** Handles non-linear feature relationships and captures complex interactions between metabolic markers, age, BMI, and glucose.
* **Support Vector Machine (SVM):** Creates optimal high-dimensional decision boundaries to distinguish borderline risk categories.
* **Logistic Regression:** Provides interpretable probability estimates and baseline comparison risk scores.

**Consensus Mechanism:** When 2 out of 3 models flag elevated risk, the system triggers a high-alert status, reducing false classifications by **19.05%**.

## 🛠️ Technology Stack

### Backend Layer (Server Side)
* **Framework:** Python Flask API.
* **Machine Learning:** Scikit-Learn for ML algorithms.
* **Data Management:** Pandas for data manipulation and Joblib for model persistence.
* **Preprocessing:** Standard Scaler for critical normalization.

### Frontend Layer (Client Side)
* **Framework:** React.js for component architecture.
* **Styling:** Tailwind CSS for responsive design.
* **Animations:** Framer Motion for interactive UI.

## 📊 Model Performance
The ensemble architecture achieves superior reliability compared to any single constituent model.

| Model | Accuracy | Precision | Recall |
| :--- | :--- | :--- | :--- |
| Random Forest | 78% | 0.75 | 0.72 |
| Support Vector Machine | 76% | 0.73 | 0.70 |
| Logistic Regression | 74% | 0.71 | 0.68 |
| **Ensemble System** | **81%** | **0.79** | **0.77** |

**Key Metric:** VITAL.OS achieved an **81.27% consensus risk** and a **+2.60% accuracy gain** over the best individual model.

## ✨ Key Features
* **Insight Helix:** Generates personalized dietary interventions and medical roadmaps (e.g., High-Protein or Low-Fat diets).
* **Clinical Peer Matching:** Uses a KNN Synthesis engine to identify similar patient profiles in historical datasets.
* **Personalized Recovery Goal:** Calculates specific biometric targets (like Glucose or BMI) needed to lower risk, simulating an actionable "what-if" roadmap.
* **Intelligent Imputation:** Uses `clean_val` logic that respects medical domain constraints to preserve statistical validity.

## 📁 Datasets
* **Pima Indians Diabetes Dataset:** Provides historical metabolic markers.
* **BRFSS 2015:** Contributes contemporary health indicators across diverse populations.

## 🔮 Future Scope
* **IoT Integration:** Real-time data streaming from smartwatches and continuous glucose monitors.
* **Ethnic Biomarker Expansion:** Incorporating diverse datasets to eliminate algorithmic bias.
* **Mobile Deployment:** Developing a Flutter-based cross-platform application.

---
**Presented By:** Chitikesi Sai Rupini (Roll: 23VV1A1210) 
**Branch:** Information Technology | **College:** JNTU-GV 
---

### 🖥️ Project Preview
<img width="1356" height="637" alt="image" src="https://github.com/user-attachments/assets/d827c8aa-ad79-4974-9355-77c64a3dc1bc" />
<img width="1364" height="637" alt="image" src="https://github.com/user-attachments/assets/0211f413-6d2d-4385-bd5a-2efc659826a6" />
<img width="1356" height="630" alt="image" src="https://github.com/user-attachments/assets/29d5053c-2171-4004-9e7b-c0a2d6cbc374" />
<img width="1363" height="624" alt="Screenshot 2026-06-12 124731" src="https://github.com/user-attachments/assets/b65e592e-8761-4d40-8f0f-344ee3ebce10" />





