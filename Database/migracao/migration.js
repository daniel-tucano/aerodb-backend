require('dotenv').config()
const mongoose = require('mongoose')
const requireDir = require('require-dir')
const { Sequelize, QueryTypes } = require('sequelize');

// Conectando ao mongoose
mongoose.connect('mongodb://localhost:27017/aerodb', { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Conexão com o mongoose deu certo')
}).catch((erro) => {
    console.log('conexão com mongoose falhou')
    console.log(erro)
})

requireDir('./models')

// Instanciando modelos
const AirfoilModel = mongoose.model('Airfoil')
const UserModel = mongoose.model('User')
const RunModel = mongoose.model('Run')
const CounterModel = mongoose.model('Counter')

// Conectando ao MySQL
const sequelize = new Sequelize('aerodb', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});

// Testando a conexão com o banco de dados
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');

}).catch((error) => {
    console.error('Unable to connect to the database:', error);

})

// Inserindo o usuário Daniel no banco de dados
const DanielUser = new UserModel({
    uid: "jiy2AEaXb2WV3MI3hYhWEdyFRgC2",
    name: "Daniel",
    userName: "@danielTucano",
    email: "daanrsantiago@gmail.com",
    gender: "male",
    yearOfBirth: Date(1999, 2, 8, 0, 0, 0, 0),
    institution: "UFU",
    projects: [],
    userAirfoils: [],
    favoriteAirfoils: [],
})

// Inserindo Usuário
DanielUser.save()

// Iniciando variavel que é campo comum entre documentos

const DanielCreatorData = { name: DanielUser.name, userName: DanielUser.userName, userId: DanielUser.id }

// Adicionando documentos na collection de counters que vão permitir a criação de IDs numéricos
// Como ja temos esses IDs vindos do banco de dados SQL, iniciamos os valores com os ultimos de lá

const AirfoilIDCounter = new CounterModel({
    refCollection: "Airfoils",
    name: 'AirfoilID',
    counter: 1546,
})

const RunIDCounter = new CounterModel({
    refCollection: "Runs",
    name: 'RunID',
    counter: 377068,
})

AirfoilIDCounter.save().then(() => console.log('Counter AirfoilID salvo no banco de dados'))
RunIDCounter.save().then(() => console.log('Counter RunID salvo no banco de dados'))

// Função que converte dados em CSV para um POJO
function CSVtoPOJO(CSV_string) {
    const POJO = {}
    const key_values_strings = CSV_string.split(';')
    key_values_strings.map( (key_value_string) => {
        const key_values_array = key_value_string.split(' = ')
        try {
            const key = key_values_array[0].trim()
            const value = key_values_array[1].trim()
            POJO[key] = value
        } catch(error) {
            console.log(error)
        }
    })
    return POJO
}

function insertInDatabase(inicio, i) {
    const insertPromise = new Promise(async (resolve, reject) => {
        // PRIMEIRO PROCURAMOS PELOS AEROFOLIOS NA TABELA DE AEROFOLIOS NO BANCO DE DADOS
        let Airfoils = await sequelize.query(`SELECT * FROM Airfoils LIMIT ${inicio + i},1;`, { type: QueryTypes.SELECT })

        // PRA CADA AEROFOLIO ENCONTRADO FAZEMOS O SEGUINTE
        for (Airfoil of Airfoils) {

            // INSERIMOS AS INFORMAÇÕES BASICAS DAQUELE AEROFOLIO NA BANCO DE DADOS
            let AirfoilNoSQLData = new AirfoilModel({
                airfoilID: Airfoil.AirfoilID,
                name: Airfoil.Name,
                nameLowerCase: Airfoil.Name.toLowerCase(),
                fileName: Airfoil.File_name,
                thickness: Airfoil.Thickness,
                xThickness: Airfoil.X_Thickness,
                camber: Airfoil.Camber,
                xCamber: Airfoil.X_Camber,
                source: Airfoil.Source,
                postedDate: Date.now(),
                creator: DanielCreatorData,
            })

            // PROCURAMOS TODAS AS LINHAS QUE DESCREVEM A GEOMETRIA DELE NA TABELA GEOMETRIES
            let Geometries = await sequelize.query(`SELECT * FROM Geometries WHERE AirfoilID = ${Airfoil.AirfoilID};`, { type: QueryTypes.SELECT })

            // CRIAMOS UM OBJETO JSON QUE VAI ARMAZENAR ESSAS INFORMAÇÕES DE UMA FORMA MAIS FACIL DE SEREM GUARDADAS
            const GeometrieMap = { x: [], y: [], side: [] }

            // POPULAMOS ESSE OBJETO COM OS VALORES DA GEOMETRIA
            Geometries.map(Geometrie => {
                GeometrieMap.x.push(Geometrie.X)
                GeometrieMap.y.push(Geometrie.Y)
                GeometrieMap.side.push(Geometrie.Side)
            })

            // ENTÃO USAMOS ESSE OBJETO PARA POPULAR ESSE CAMPO NO BANCO DE DADOS
            AirfoilNoSQLData.set({
                geometrie: GeometrieMap
            })

            // AGORA PROCURAMOS TODAS AS RUNS CORRESPONDENTES A ESSE AIRFOILID NA TABELA RUNS
            let Runs = await sequelize.query(`SELECT * FROM Runs WHERE AirfoilID = ${Airfoil.AirfoilID};`, { type: QueryTypes.SELECT })

            const runIDs = []
            const runObjIDs = []

            // PRA CADA RUN FAZEMOS O SEGUINTE
            for ([RunIndex, Run] of Runs.entries()) {

                let runAdditionalData = CSVtoPOJO(Run.AdditionalData)
                runAdditionalData.nCrit = Run.Ncrit
                
                // PREENCHEMOS AS INFORMAÇÕES BASICAS DA RUN NO BANCO DE DADOS
                let RunNoSQLData = new RunModel({
                    runID: Run.RunID,
                    airfoilID: Airfoil.AirfoilID,
                    airfoilObjID: AirfoilNoSQLData.id,
                    reynolds: Run.Reynolds,
                    mach: Run.Mach,
                    source: Run.Source,
                    creator: DanielCreatorData,
                    postedDate: Run.RunDate,
                    additionalData: runAdditionalData,
                })

                runIDs.push(Run.RunID)
                runObjIDs.push(RunNoSQLData.id)

                // PROCURAMOS PELAS LINHAS DA POLAR QUE CORRESPONDE A ESSE RUNID
                let Polars = await sequelize.query(`SELECT * FROM Polars WHERE RunID = ${Run.RunID}`, { type: QueryTypes.SELECT })

                // CRIAMOS UM OBJETO JSON PARA ARMAZENAR ESSES DADOS DE UMA MANEIRA MAIS FACIL
                PolarMap = { alpha: [], cl: [], cd: [], cm: [] }

                // POPULAMOS ESSE OBJETO
                Polars.map(PolarRow => {
                    PolarMap.alpha.push(PolarRow.Alpha)
                    PolarMap.cl.push(PolarRow.Cl)
                    PolarMap.cd.push(PolarRow.Cd)
                    PolarMap.cm.push(PolarRow.Cm)
                })

                // ENTÃO PREECHEMOS ESSES DADOS A RUN CORRESPONDENTE NO BANCO DE DADOS
                RunNoSQLData.set({
                    polar: {
                        alpha: PolarMap.alpha,
                        cl: PolarMap.cl,
                        cd: PolarMap.cd,
                        cm: PolarMap.cm
                    }
                })

                // PROCURAMOS PELA POLAR PROPERTIE CORRESPONDENTE A ESSA RUN NO BANCO DE DADOS
                let PolarProperties = await sequelize.query(`SELECT * FROM PolarProperties WHERE RunID = ${Run.RunID}`, { type: QueryTypes.SELECT,  })

                // SÓ PARA NOS CERTIFICARMOS, USAMOS UM MAP NO PARAMETRO ENVIADO PELO BANCO DE DADOS
                PolarProperties.map(PolarPropertie => {

                    // E SALVAMOS OS DADOS NO BANCO DE DADOS
                    RunNoSQLData.set({
                        polarProperties: {
                            clMax: PolarPropertie.Cl_max,
                            cl0: PolarPropertie.Cl_0,
                            clAlpha: PolarPropertie.Cl_alpha,
                            cdMin: PolarPropertie.Cd_min,
                            cdMax: PolarPropertie.Cd_max,
                            clCdMax: PolarPropertie.Cl_Cd_max,
                            cm0: PolarPropertie.Cm_0,
                            alphaStall: PolarPropertie.Alpha_stall,
                            alpha0Cl: PolarPropertie.Alpha_0_Cl,
                            alphaClCdMax: PolarPropertie.Alpha_Cl_Cd_max,
                        }
                    })
                })

                RunNoSQLData.save().then(() => {
                    console.log(`O Run ${Run.RunID} do aerofólio ${Airfoil.AirfoilID} foi adicionado com sucesso`)
                }).catch(error => {
                    console.log(`Houve um problema ao adicionar o run ${Run.RunID} do aerofólio ${Airfoil.AirfoilID}`)
                    console.log(error)
                })

                if (RunIndex === (Runs.length - 1)) {

                    AirfoilNoSQLData.set({
                        runs: {runIDs, runObjIDs},
                    })

                    AirfoilNoSQLData.save().then(() => {
                        console.log(`O aerofólio ${Airfoil.AirfoilID} foi adicionado com sucesso`)
                    }).catch(error => {
                        console.log(`Houve um problema ao adicionar o aerofólio ${Airfoil.AirfoilID}`)
                        console.log(error)
                    })

                    console.log('acabou até o airfoil ' + Airfoil.AirfoilID)
                    resolve()
                }
            }

            // E PASSAMOS PARA O PROXIMO AEROFOLIO

        }
    })
    return insertPromise
}

async function insertAirfoilsFunction() {
    for (let i = 0; i < 1546; i++) {
        let inicio = 0;

        try {
            console.log('começo iteração ' + i)
            await insertInDatabase(inicio, i)
            console.log('fim iteração ' + i)
        } catch {
            console.log('erro na iteração ' + i)
        }
    }
}

insertAirfoilsFunction()



// sequelize.query('SELECT * FROM airfoils LIMIT 3;', {type: QueryTypes.SELECT}).then((results) => {

// })

// sequelize.end(() => {})