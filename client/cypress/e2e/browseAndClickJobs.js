describe('Test browsing jobs', () => {
  it('click jobs', () => {
    cy.visit('/')
    cy.get('.Jobs_row_clickable__H6ime:visible').each(($el) => cy.wrap($el).click())

  })
})

