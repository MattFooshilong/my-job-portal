describe('Nav login', () => {
    it('login', () => {
        cy.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        })
        cy.visit('/')
        cy.contains('Login').click()
        cy.get('#email').clear().type('admin@gmail.com')
        cy.findByPlaceholderText(/password/i).clear().type('Abc123!')
        cy.findByRole('button', {
            name: /login/i
        }).click()
        cy.contains('Job Applications')
    })
})