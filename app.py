import io
import base64
import pickle
import numpy as np

from flask import Flask, render_template, request, jsonify
from PIL import Image


app = Flask(__name__)
classificador = pickle.load(open('ANN_MNIST-9261.sav', 'rb'))

@app.route('/')
def index():
    return render_template('index.html')

def preprocess_image(image_data):
    # Decodifica imagem base64
    image = Image.open(io.BytesIO(base64.b64decode(image_data.split(',')[1])))
    # Converte para escala de cinza, redimensiona para 28x28 e inverte (se necessário)
    image = image.convert('L').resize((28, 28))
    # Normaliza os pixels
    image_array = np.asarray(image)
    image_array = image_array / 255.0
    return image_array.reshape(1, -1)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_data = data['image']
    X = preprocess_image(image_data)
    prediction_proba = classificador.predict_proba(X)
    prediction_proba = prediction_proba * 100
    return jsonify({'chance-0': prediction_proba[0][0],
                    'chance-1': prediction_proba[0][1],
                    'chance-2': prediction_proba[0][2],
                    'chance-3': prediction_proba[0][3],
                    'chance-4': prediction_proba[0][4],
                    'chance-5': prediction_proba[0][5],
                    'chance-6': prediction_proba[0][6],
                    'chance-7': prediction_proba[0][7],
                    'chance-8': prediction_proba[0][8],
                    'chance-9': prediction_proba[0][9]})

if __name__ == '__main__':
    app.run(debug=True)