import os
import shutil
import json
import sys
import base64
import requests
from re import sub
from scipy.io import savemat


# Load enviroment variables if not in production enviroment
if ('NODE_ENV' in os.environ):
    if (os.environ['NODE_ENV'] != 'production'):
        from dotenv import load_dotenv
        load_dotenv()
else:
    from dotenv import load_dotenv
    load_dotenv()

def is_float(string) :
    try:
        float(string)
        return True
    except:
        return False

def camelCase(string):
    string = sub(r"(_|-)+", " ", string).title().replace(" ", "")
    return string[0].lower() + string[1:]

# Recebemos os argumentos fornecidos pela execução do script pela linha de comando
# a partir da api em node.js
request_args = sys.argv[1:]
# Inicializamos a lista que vai receber os argumentos fornecidos decodificados
request_args_decoded = []
# Inicializamos o dicionário que vai receber as chaves e valores de request_args_decoded
request_args_dict = dict()

# Loop que percorre os argumentos, decodifica eles e os adiciona a variavel apropriada
for arg in request_args:
    request_args_decoded.append(base64.b64decode(arg).decode('utf-8'))

# Agora percorremos um novo loop para migrarmos os argumentos na lista para uma variavel
# do tipo dict
for index,_ in enumerate(request_args_decoded):
    if (index%2 == 0):
        request_args_dict[request_args_decoded[index]] = request_args_decoded[index+1]

request_args = request_args_dict

if request_args and 'airfoilID' in request_args:
    # print(request_args['airfoilID'])
    if is_float(request_args['airfoilID']):
        airfoilID = float(request_args['airfoilID'])
        if airfoilID.is_integer():
            airfoilData = requests.get('http://'+os.environ['AERODB_BACKEND_LOADBALANCER_SERVICE_HOST']+'/airfoils/'+str(airfoilID), timeout=4.0).json()
            # print(airfoilData)
            if airfoilData:
                filteredAirfoilData = {'airfoil':{'name':airfoilData['name'],  'thickness':airfoilData['thickness'],'xThickness':airfoilData['xThickness'], 'camber':airfoilData['camber'], 'xCamber':airfoilData['xCamber'], 'geometrie': airfoilData['geometrie']}}

                fileName = camelCase(airfoilData['nameLowerCase'])+'.mat'
                # print('the file name is: {}'.format(fileName))
                    # Trying to change directory to projects
                try:
                    os.chdir('/tmp/airfoilMatFiles')
                except:
                    # If it don't exists, create it and then change to it
                    os.mkdir('/tmp/airfoilMatFiles')
                    os.chdir('/tmp/airfoilMatFiles')
                # print('o diretorio atual é: {}'.format(os.getcwd()))
                # print('nele tem: {}'.format(os.listdir()))

                # print('salvando o documento .mat com savemat')
                savemat(fileName, mdict=filteredAirfoilData)

                # print('fazendo a resposta')
                response = "/tmp/airfoilMatFiles/"+fileName
            else:
                response = 'airfoilID not found'
        else:
            response = 'airfoilID should be integer'
    else:
        response = 'airfoilID shoud be numeric'
else:
    response = "Your query should include an '?airfoilID=[number]' at the end"


print(response)