const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('things Endpoints', function() {
  let db

  const { testUsers, testthings, testComments, } = helpers.makeThingsFixtures()

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

  describe(`GET /api/things`, () => {
    context(`Given no things`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/things')
          .expect(200, [])
      })
    })

    context('Given there are things in the database', () => {
      beforeEach('insert things', () =>
        helpers.seedThingsTables(
          db,
          testUsers,
          testthings,
          testComments,
        )
      )

      it('responds with 200 and all of the things', () => {
        const expectedthings = testthings.map(thing =>
          helpers.makeExpectedthing(
            testUsers,
            thing,
            testComments,
          )
        )
        return supertest(app)
          .get('/api/things')
          .expect(200, expectedthings)
      })
    })

    context(`Given an XSS attack thing`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousThing,
        expectedthing,
      } = helpers.makeMaliciousThing(testUser)

      beforeEach('insert malicious thing', () => {
        return helpers.seedMaliciousThing(
          db,
          testUser,
          maliciousThing,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/things`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedthing.title)
            expect(res.body[0].content).to.eql(expectedthing.content)
          })
      })
    })
  })

  describe(`GET /api/things/:thing_id`, () => {
    context(`Given no things`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const thingId = 123456
        return supertest(app)
          .get(`/api/things/${thingId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `thing doesn't exist` })
      })
    })

    context('Given there are things in the database', () => {
      beforeEach('insert things', () =>
        helpers.seedthingsTables(
          db,
          testUsers,
          testthings,
          testComments,
        )
      )

      it('responds with 200 and the specified thing', () => {
        const thingId = 2
        const expectedthing = helpers.makeExpectedthing(
          testUsers,
          testthings[thingId - 1],
          testComments,
        )

        return supertest(app)
          .get(`/api/things/${thingId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedThing)
      })
    })

    context(`Given an XSS attack thing`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousThing,
        expectedthing,
      } = helpers.makeMaliciousThing(testUser)

      beforeEach('insert malicious thing', () => {
        return helpers.seedMaliciousThing(
          db,
          testUser,
          maliciousThing,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/things/${maliciousthing.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedthing.title)
            expect(res.body.content).to.eql(expectedthing.content)
          })
      })
    })
  })

  describe(`GET /api/things/:thing_id/comments`, () => {
    context(`Given no things`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const thingId = 123456
        return supertest(app)
          .get(`/api/things/${thingId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `thing doesn't exist` })
      })
    })

    context('Given there are comments for thing in the database', () => {
      beforeEach('insert things', () =>
        helpers.seedThingsTables(
          db,
          testUsers,
          testthings,
          testComments,
        )
      )

      it('responds with 200 and the specified comments', () => {
        const thingId = 1
        const expectedComments = helpers.makeExpectedthingComments(
          testUsers, thingId, testComments
        )

        return supertest(app)
          .get(`/api/things/${thingId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComments)
      })
    })
  })
})