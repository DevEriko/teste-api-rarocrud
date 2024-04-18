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
      }).its('status').should('to.equal', 400)
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
});