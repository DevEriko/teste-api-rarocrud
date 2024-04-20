import { faker } from '@faker-js/faker';
const { METHOD_HTTP } = require('../support/method-http.js');
describe('Teste da rota /users', function () {
  describe('Teste de Bad request', function () {
    it('Deve rebecer Bad request ao cadastrar um usuário sem e-mail', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'eriko fernando',
        },
        failOnStatusCode: false,
      }).then(function (response) {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.undefined;
      });
    });

    it('Deve receber Bad request ao cadastrar um usuário sem nome', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          email: 'e@.com',
        },
        failOnStatusCode: false,
      }).its('status').should('to.equal', 400)
    });

    it('Deve receber Bad request ao tentar cadastrar um usuário com email inválido', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: 'eriko fernando',
          email: '.com',
        },
        failOnStatusCode: false,
      }).its('status').should('to.equal', 400)
    });
  });

  describe('Testes de criação de usuários', function () {

    var idUsuario;

    afterEach(function () {
      cy.deletarUsuario(idUsuario);
    });

    it('Deve ser possível criar um usuário com dados válidos', function () {
      let name = faker.internet.userName();

      let email = faker.internet.email();
      cy.request('POST', '/users', {
        name: name,
        email: email,
      }).then(function (response) {
        expect(response.status).to.equal(201);
        expect(response.body).to.have.property('id');
        expect(response.body).to.have.property('createdAt');
        expect(response.body).to.have.property('updatedAt');
        expect(response.body.createdAt).to.be.an('string');
        expect(response.body.updatedAt).to.be.an('string');
        expect(response.body.createdAt).to.equal(response.body.updatedAt);
        expect(response.body.name).to.equal(name);
        expect(response.body.email).to.equal(email);

        idUsuario = response.body.id;
      });
    });

    it('Não deve ser possível cadastrar um usuário com e-mail já cadastrado', function () {
      let name = faker.person.fullName();
      let email = faker.internet.email();

      cy.request('POST', '/users', {
        name: name,
        email: email,
      }).then(function (response) {
        idUsuario = response.body.id;

        cy.request({
          method: 'POST',
          url: '/users',
          body: {
            name: name,
            email: email,
          },
          failOnStatusCode: false,
        }).then(function (response) {
          expect(response.status).to.equal(422)
          expect(response.body.error).to.equal('User already exists.');
        });
      });
    });
  });

  describe('Testes de consulta de usuário', function () {
    var usuarioCriado;

    before(function () {
      cy.criarUsuario().then(function (dados) {
        usuarioCriado = dados;
      });
    });

    after(function () {
      cy.deletarUsuario(usuarioCriado.id);
    });

    it('Deve ser possível consultar um usuário por id', function () {
      cy.request('/users/' + usuarioCriado.id).then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal(usuarioCriado);
        expect(response.body.email).to.equal(usuarioCriado.email);
      });
    });

    it('Não deve ser possível consultar um usuário que não esta cadastrado', function () {
      cy.request({
        method: 'GET',
        url: '/users/3fa85f64-5717-4562-b3fc-2c963f66afa6',
        failOnStatusCode: false,
      }).then(function (response) {
        expect(response.status).to.equal(404);
        expect(response.body).to.be.empty;
      });
    });

    it('Deve receber BAD REQUEST ao consultar um ID inválido', function () {
      cy.request({
        method: 'GET',
        url: '/users/1234-sdfjjdcjzb',
        failOnStatusCode: false,
      }).then(function (response) {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.empty;
      });
    });

    it('Deve ser possível consultar a lista de todos os usuários', function () {
      cy.request('/users').then(function (response) {
        expect(response.status).to.equal(200);
        expect(response.body).to.be.an('array');
        expect(response.body).to.deep.includes(usuarioCriado);
      });
    });
  });

  describe.only('Testes relacionados a atualização de usuários', function () {
    var usuarioCriado;

    before(function () {
      cy.criarUsuario().then(function (dados) {
        usuarioCriado = dados;
      });
    });

    after(function () {
      cy.deletarUsuario(usuarioCriado.id);
    });

    it('Atualizar usuário com sucesso', function () {
      var userComId = '/users/' + usuarioCriado.id
      var bodyRequisicao = {
        name: faker.person.fullName(),
        email: faker.internet.email(),
      }

      cy.request({ method: METHOD_HTTP.PUT, url: userComId, body: bodyRequisicao }).then(function (response) {
        var bodyToAssert = {
          id: usuarioCriado.id,
          name: bodyRequisicao.name,
          email: bodyRequisicao.email,
          createdAt: response.body.createdAt,
          updatedAt: response.body.updatedAt
        }
        expect(response.status).to.be.equal(200);
        expect(response.body.createdAt).to.be.an('string');
        expect(response.body.updatedAt).to.be.an('string');
        expect(response.body).to.deep.equal(bodyToAssert);
      });
    });
  });
});






