
from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import os

app = Flask(__name__)

# Load the best model (StackingRegressor), PolynomialFeatures transformer, and StandardScaler
try:
    stacking_model = joblib.load('stacking_model.pkl')
    poly_transformer = joblib.load('poly_transformer.pkl')
    scaler_poly = joblib.load('scaler_poly.pkl')
    print("Models and transformers loaded successfully.")
except Exception as e:
    print(f"Error loading models or transformers: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)

        feature_names_original = [
            'Cement',
            'Blast_Furnace_Slag',
            'Fly_Ash',
            'Water',
            'Superplasticizer',
            'Coarse_Aggregate',
            'Fine_Aggregate',
            'Age'
        ]

        input_features = [data[name] for name in feature_names_original]

        raw_features_array = np.array(input_features).reshape(1, -1)

        poly_features = poly_transformer.transform(raw_features_array)

        scaled_poly_features = scaler_poly.transform(poly_features)

        prediction = stacking_model.predict(scaled_poly_features)

        return jsonify({'prediction': prediction[0]})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
   