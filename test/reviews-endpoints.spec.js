const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('reviews Endpoints', function() {
  let db

  const { testThings, testUsers, } = helpers.makeThingsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/reviews`, () => {
    beforeEach('insert Things', () =>
      helpers.seedThingsTables(
        db,
        testUsers,
        testThings,
      )
    )

    it(`creates an review, responding with 201 and the new review`, function() {
      this.retries(3)
      const testArticle = testThings[0]
      const testUser = testUsers[0]
      const newreview = {
        text: 'Test new review',
        article_id: testArticle.id,
      }
      return supertest(app)
        .post('/api/reviews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newreview)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.text).to.eql(newreview.text)
          expect(res.body.article_id).to.eql(newreview.article_id)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`)
          const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('thing_reviews')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(newreview.text)
              expect(row.article_id).to.eql(newreview.article_id)
              expect(row.user_id).to.eql(testUser.id)
              const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['text', 'article_id']

    requiredFields.forEach(field => {
      const testArticle = testThings[0]
      const testUser = testUsers[0]
      const newreview = {
        text: 'Test new review',
        article_id: testArticle.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newreview[field]

        return supertest(app)
          .post('/api/reviews')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newreview)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })
})
