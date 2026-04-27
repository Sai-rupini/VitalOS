from flask import Flask, request, jsonify
from flask_cors import CORS 
import joblib
import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors

app = Flask(__name__)
CORS(app) 

# --- 1. LOAD MODELS & DATA ---
try:
    scaler = joblib.load('scaler.pkl')
    models = {
        "Logistic Regression": joblib.load('logistic_regression_model.pkl'),
        "Random Forest": joblib.load('random_forest_model.pkl'),
        "SVM": joblib.load('svm_model.pkl')
    }
    # Datasets for KNN Retrieval
    df_lifestyle = pd.read_csv('diabetes_012_health_indicators_BRFSS2015.csv')
    df_diet = pd.read_csv('Personalized_Diet_Recommendations.csv')
except Exception as e:
    print(f"Initialization Error: {e}")

# --- 2. INITIALIZE KNN ENGINES ---
knn_lifestyle = NearestNeighbors(n_neighbors=1).fit(df_lifestyle[['BMI', 'Age']])
knn_diet = NearestNeighbors(n_neighbors=5).fit(df_diet[['BMI', 'Age']])

def clean_val(val, default_text):
    if pd.isna(val) or str(val).lower() == 'nan' or str(val).strip() == '':
        return default_text
    return str(val)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    feature_names = ['Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 
                     'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age']
    
    user_values = data['values']
    user_bmi, user_age = user_values[5], user_values[7]
    
    # --- STEP 1: CURRENT ENSEMBLE RISK ---
    df_input = pd.DataFrame([user_values], columns=feature_names)
    scaled_input = scaler.transform(df_input)
    
    results_list = []
    for name, model in models.items():
        prob = float(model.predict_proba(scaled_input)[0][1]) * 100
        results_list.append({
            "model_name": name,
            "probability": round(prob, 2)
        })
    
    avg_prob = sum(r['probability'] for r in results_list) / len(results_list)

    # --- STEP 2: DYNAMIC CUSTOM GOAL SIMULATION ---
    # Create a unique target based on a 15% reduction of the user's current high markers
    target_values = list(user_values)
    if target_values[1] > 100: target_values[1] = max(90, target_values[1] * 0.85) # Glucose
    if target_values[5] > 25: target_values[5] = max(22, target_values[5] * 0.90)  # BMI

    scaled_target = scaler.transform(pd.DataFrame([target_values], columns=feature_names))
    target_probs = [float(models["Random Forest"].predict_proba(scaled_target)[0][1]) * 100]
    avg_target = sum(target_probs) / len(target_probs)

    # --- STEP 3: KNN CLINICAL RETRIEVAL (ROADMAP DATA) ---
    search_df = pd.DataFrame([[user_bmi, user_age]], columns=['BMI', 'Age'])
    
    try:
        # Lifestyle Peer (CDC - Hypertension Match)
        _, idx_l = knn_lifestyle.kneighbors(search_df)
        peer_l = df_lifestyle.iloc[idx_l[0][0]]
        
        # Diet Peer (Kaggle - Meal Plan Match)
        _, indices_d = knn_diet.kneighbors(search_df)
        peer_d = df_diet.iloc[np.random.choice(indices_d[0])]

        diet_plan = clean_val(peer_d['Recommended_Meal_Plan'], "Balanced Glycemic Plan")
        chronic_info = clean_val(peer_d['Chronic_Disease'], "baseline health")
        habit_info = clean_val(peer_d['Dietary_Habits'], "metabolic tracking")

        # Risk-Aware Habit Text
        if avg_prob > 75:
            habit_text = f"Urgent Recommendation: Based on your high-risk profile ({round(avg_prob)}%), focus on {habit_info} habits and immediate clinical consultation."
        elif avg_prob > 40:
            habit_text = f"Preventative Strategy: Based on your {chronic_info} profile, focus on {habit_info} habits to stabilize biomarkers."
        else:
            habit_text = f"Maintenance Protocol: Your data matches peers with {chronic_info} status; continue {habit_info} habits to stay in range."

        fact_text = f"Clinical Peer Match: Similar biological profiles in the CDC study (BMI: {int(peer_l['BMI'])}) show a {'high' if peer_l['HighBP']==1 else 'normal'} hypertension correlation."

    except Exception as e:
        diet_plan, fact_text, habit_text = "Balanced Plan", "Data syncing...", "Maintain active lifestyle."

    return jsonify({
        "results": results_list,
        "probability": round(avg_prob, 2),
        "target_probability": round(avg_target, 2),
        "improvement_diff": round(avg_prob - avg_target, 2),
        "target_metrics": {"glucose": round(target_values[1]), "bmi": round(target_values[5], 1)},
        "insights": {
            "diet": diet_plan,
            "fact": fact_text,
            "habit": habit_text
        }
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)