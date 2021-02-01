const { Router } = require('express')
const { pool } = require('./../config/database')
var sha1 = require('sha1');
const router = Router()

router.get('/login', async(req, res) => {
    let client = await pool.connect()
    const {
        user, 
        pass
    } = req.query
    try {
        let result = await client.query(`select * from actores where contrasena = $1 and correo = $2`, [pass, user])
        console.log(result)
        return res.json(result)
    } catch (error) {
        console.log(error)
    }finally{
        client.release(true)
    }
})

router.get('/actor', async (req, res) => {
    let client = await pool.connect()
    try{
    client.query(`SELECT * FROM actores`, (error, resulset) => {
        client.release(true)
        if (error) {
            console.log(error)
            return res.status(500).send('Se presento un error en la base de datos.')
        } else {
            return res.json(resulset.rows)
        }
    })
    }catch(error){
        console.log(error)
    }
})

router.get('/actor/:id', async (req, res) => {
    const id = req.params.id
    const client = await pool.connect()
    try {
        const result = await client.query(`SELECT * FROM actores WHERE id = ${id}`, [])

        if (result.rows[0]) {
            res.json(result.rows[0])
        } else {
            res.json({})
        }
    } catch (error) {
        console.log(error)
    }finally{
        client.release(true)
    }
})

router.post('/actor', async (req, res) => {
    try {
        const {
            documento,
            tipo_documento,
            nombres,
            apellidos,
            contrasena,
            correo,
            telefono_celular,
            numero_expediente,
            genero,
            fecha_nacimiento,
            estado_actor_id,
            institucion_id,
            tipo_actor_id,
            fecha_creacion,
            fecha_actualizacion
        } = req.body
        const client = await pool.connect()
        const response = await client.query(`INSERT INTO actores(documento, tipo_documento, nombres, apellidos, contrasena, correo, telefono_celular, numero_expediente, genero, fecha_nacimiento, estado_actor_id, institucion_id, tipo_actor_id, fecha_creacion,fecha_actualizacion) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`, [documento, tipo_documento, nombres, apellidos, contrasena, correo, telefono_celular, numero_expediente, genero, fecha_nacimiento, estado_actor_id, institucion_id, tipo_actor_id, fecha_creacion, fecha_actualizacion])
        
       // console.log(response)
        if (response.rowCount > 0) {
            res.json({
                id: response.rows[0].id,
                documento: documento,
                tipo_documento: tipo_documento,
                nombres: nombres,
                apellidos: apellidos,
                contrasena: contrasena,
                correo: correo,
                telefono_celular: telefono_celular,
                numero_expediente: numero_expediente,
                genero: genero,
                fecha_nacimiento: fecha_nacimiento,
                estado_actor_id: estado_actor_id,
                institucion_id: institucion_id,
                tipo_actor_id: tipo_actor_id,
                fecha_creacion: fecha_creacion,
                fecha_actualizacion: fecha_actualizacion
            })
        } else {
            res.json({})
        } 
    } catch (e) {  
        console.log(e)
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
})

router.put('/actor/:id', (req, res) => { })

router.patch('/actor/:id', async (req, res) => {
    try {
        if (Object.keys(req.body).length > 0) {
            const id = req.params.id
            let SQL = 'UPDATE actores SET '
            const params = []

            for (const elment in req.body) {
                SQL += `${elment} = ?, `
                params.push(req.body[elment])
            }
            SQL = SQL.slice(0, -2)
            SQL += ` WHERE id = ?`
            params.push(id)
            // console.log(SQL, params)
            let [rows] = await cnn_mysql.promise().execute(SQL, params)

            if (rows.affectedRows > 0) {
                [rows] = await cnn_mysql.promise().query(`SELECT * FROM actores WHERE id = ?`, [id])
                res.json(rows[0])
            } else {
                res.json({})
            }
        } else {
            res.status(401).json({ message: 'No existe campos a modificar' })
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({ errorCode: e.errno, message: "Error en el servidor" })
    }
})



router.delete('/actor/:id', (req, res) => { })

router.get('/modulos-estudiantes', async (req, res) => {
    const [rows] = await cnn_mysql.promise().query(`SELECT a.documento, CONCAT(a.nombres, ' ', a.apellidos) nombreActor, ta.perfil AS perfilActor, g.grado, g.letra, m.modulo
    FROM actores AS a
    INNER JOIN tipo_actores AS ta ON ta.id = a.tipo_actor_id
    JOIN integrantes_grupos AS ig ON ig.estudiante_id = a.id
    JOIN grupos g ON g.id = ig.grupo_id
    JOIN clases c ON c.grupo_id = g.id
    JOIN modulos m ON m.id = c.docente_id
    WHERE ta.id = 1
    ORDER BY g.institucion_id DESC`)
    return res.json(rows)
})

router.get('/numero-sesiones-estudiantes', async (req, res) => {
    const [rows] = await cnn_mysql.promise().query(`SELECT a.documento, CONCAT(a.nombres, ' ', a.apellidos) nombreActor, ta.perfil AS perfilActor, COUNT(ig.id) AS numero_sesiones
    FROM actores AS a
    INNER JOIN tipo_actores AS ta ON ta.id = a.tipo_actor_id
    JOIN integrantes_grupos AS ig ON ig.estudiante_id = a.id
    JOIN asistencias_sesiones ase ON ase.integrante_grupo_id = ig.id
    WHERE ta.id = 1
    GROUP BY ig.id`)
    return res.json(rows)
})

module.exports = router