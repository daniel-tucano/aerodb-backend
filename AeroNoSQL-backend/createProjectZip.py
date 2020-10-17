import os
import shutil
import json
import sys
import base64
import requests
from re import sub
from scipy.io import savemat


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

if request_args and 'airfoil' in request_args:
    # Trying to change directory to projects
    try:
        os.chdir('/tmp/projects')
    except:
        # If it don't exists, create it and then change to it
        os.mkdir('/tmp/projects')
        os.chdir('/tmp/projects')
    projectName = camelCase(request_args['projectName'])
    # Trying to delete the folder if it exists
    try:
        shutil.rmtree(projectName)
    except:
        oi = 'oi'
    
    # Creating folder to hold data and entering it
    os.mkdir(projectName)
    os.chdir(projectName)

    airfoils = request_args['airfoil'].split(' ')

    for airfoil in airfoils:
        id, runs = airfoil.split('@')
        id = id.replace('id=','')
        runs = runs.replace('runs=','')
        runs = runs.split(';')
        airfoilData = requests.get('http://'+os.environ['AERODB_BACKEND_LOADBALANCER_SERVICE_HOST']+'/airfoils/'+id, timeout=4.0).json()
        airfoilData.pop('creator',None)
        airfoilData.pop('postedDate',None)
        airfoilData.pop('fileName',None)

        # Creating folder for airfoilData and entering it
        os.mkdir(camelCase(airfoilData['nameLowerCase']))
        os.chdir(camelCase(airfoilData['nameLowerCase']))

        airfoilFileName = camelCase(airfoilData['nameLowerCase'])+'.json'
        airfoilFileVar = open(airfoilFileName, 'w+')
        airfoilFileVar.write(json.dumps(airfoilData, indent=4))
        airfoilFileVar.close()

        os.mkdir('runs')
        os.chdir('runs')
        for run in runs:
            runData = requests.get('http://'+os.environ['AERODB_BACKEND_LOADBALANCER_SERVICE_HOST']+'/runs/'+run, timeout=4.0).json()
            runData.pop('airfoil',None)
            runData.pop('creator',None)
            runData.pop('_id',None)
            runData.pop('runDate',None)

            runFileVar = open('Run'+run+'.json', 'w+')
            runFileVar.write(json.dumps(runData, indent= 4))
            runFileVar.close()
        os.chdir('../')
        os.chdir('../')

    os.chdir('/tmp/projects')
    # Creating .zip file
    shutil.make_archive(projectName,'zip',projectName)
    # Deleting previous folder
    shutil.rmtree(projectName)
    # Printing file path
    print('/tmp/projects/'+projectName+'.zip')
