describe('Test login', () => {
  it('should be able to login with email and password', () => {
    cy.visit('https://my-job-portal-client.vercel.app/login')
    cy.get('#email').clear().type('user1@gmail.com')
    cy.get(':nth-child(2) > .form-control').clear().type('Abc123!')
    cy.get('button[type=submit]').click()
    cy.contains('Logout')
  })
})
