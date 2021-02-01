
const request = require('supertest')
const faker = require('faker')
const dateFormat = require('dateformat')
const app = require('./../index')
describe("Pruebas para los servicios de actor", function(){
    it('Verificar creacion de usuarios', async() => {
        const res = await request(app)
            .post('/api/actor')
            .send({
                "documento": faker.random.number(20),
                "tipo_documento": faker.random.arrayElement(["CC", "CE", "NIP", "NIT", "PAP", "TI"]), 
                "nombres": faker.name.firstName(),
                "apellidos": faker.name.lastName(),
                "contrasena": faker.internet.password(),
                "correo": faker.internet.email(),
                "telefono_celular": faker.phone.phoneNumber(),
                "numero_expediente": faker.random.number(),
                "genero": faker.random.arrayElement(["hombre", "mujer"]),
                "fecha_nacimiento": dateFormat(faker.date.past(), "yyyy-mm-d"), 
                "estado_actor_id": faker.random.arrayElement([1,2,3]),
                "institucion_id": faker.random.arrayElement([1,2]),
                "tipo_actor_id": faker.random.arrayElement([1,2,3,4]),
                "fecha_creacion": dateFormat(faker.date.recent(), "yyyy-mm-d"),
                "fecha_actualizacion": null
              })
            expect(res.statusCode).toEqual(200)
            expect(res.body).toHaveProperty("id")
    })
})