describe('A simple test', () => {
  it('have logo text', () => {
    cy.visit('https://my-job-portal-client.vercel.app/')
    cy.contains('My Job Portal')
  })
})
