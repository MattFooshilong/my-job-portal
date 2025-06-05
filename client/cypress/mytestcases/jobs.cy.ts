describe('See if jobs are loaded after login', () => {
  it('login', () => {
    cy.visit('https://my-job-portal-client.vercel.app/login')
    cy.get('#email').clear().type('user1@gmail.com')
    cy.get('#password').clear().type('Abc123!')
    cy.get('button[type=submit]').click()
    cy.contains('Logout')
  })

  it('should have at least one job', () => {
    cy.visit('https://my-job-portal-client.vercel.app/jobs')
    cy.location('pathname').should('eq', '/jobs')
    cy.get('[data-testid="job-0"]')
  })
})
