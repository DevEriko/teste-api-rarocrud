import { faker } from '@faker-js/faker';


describe('Teste da rots /users', function () {
  describe('Teste de Bad request', function () {
    it('Deve recer Bad request ao cadastrar um usuario em e-mail', function () {
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
      })
    });

    it('Deve recer Bad request ao cadastrar um usuario sem nome', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          email: 'e@.com',
        },
        failOnStatusCode: false,
      }).its('status').should('to.equal', 400)
    });

    it('Deve recer Bad request ao tentar cadastrar um usuario com email inválido', function () {
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

    it('Deve ser possivel criar um usuário com dados válidos', function () {
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
        expect(response.body.name).to.equal(name);
        expect(response.body.email).to.equal(email);

        idUsuario = response.body.id;
      });
    });

    it('Não deve ser possivel cadastrar com um e-mail já cadastrado', function () {
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
});
