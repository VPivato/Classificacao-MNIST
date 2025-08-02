import io
import base64
import numpy as np
import tensorflow as tf

from flask import Flask, render_template, request, jsonify
from PIL import Image


app = Flask(__name__)
classificador = tf.keras.models.load_model('CNN_MNIST_aug.keras')

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
    image_array = image_array.reshape(28, 28, 1)
    return image_array # Retorna no shape=(28, 28, 1)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    image_data = data['image']
    X = np.expand_dims(preprocess_image(image_data), axis=0) # Transforma (28,28,1) em (1,28,28,1)
    predict = classificador.predict(X)
    return jsonify({ f'chance-{i}': float(p*100) for i, p in enumerate(predict[0]) })

if __name__ == '__main__':
    app.run(debug=True)