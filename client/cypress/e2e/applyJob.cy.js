describe('apply while logout', () => {
    it('logged out, click apply', () => {
        cy.visit('/')

        cy.findByRole('button', {
            name: /apply/i
        }).click()
        cy.url().should('include', 'login')
    })
    it('login', () => {
        cy.findByRole('button', {
            name: /login/i
        }).click()
    })
    it('logged in, apply first job', () => {
        cy.findByRole('button', {
            name: /apply/i
        }).click()
    })

    // it('check job applications', () => {
    //     cy.findByRole('link', {
    //         name: /job applications/i
    //     }).click()
    //     cy.url().should('include', 'job applications')
    //     cy.contains('choosee')
    // })
})