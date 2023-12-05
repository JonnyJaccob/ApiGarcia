const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

let app = 'http://localhost:8083';

const expect = chai.expect;

describe("Prueba la ruta de alumnos", ()=>{
    it("Prueba metodo get",(done)=>{
        chai.request(app)
            .get("/alumnos")
            .end((err,res)=>{
                expect(err).to.be.null;
                expect(res).to.have.status(200);
                done();
            })
    })
})