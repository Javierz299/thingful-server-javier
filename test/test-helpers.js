const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      nickname: 'TU1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      nickname: 'TU2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      nickname: 'TU3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
      nickname: 'TU4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}
function makeThingsArray(users) {
  return [
    {
      id: 1,
      title: 'First test post!',
      style: 'How-to',
      author_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      title: 'Second test post!',
      style: 'Interview',
      author_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      title: 'Third test post!',
      style: 'News',
      author_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 4,
      title: 'Fourth test post!',
      style: 'Listicle',
      author_id: users[3].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}
function makereviewsArray(users, Things) {
  return [
    {
      id: 1,
      text: 'First test comment!',
      Thing_id: Things[0].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      text: 'Second test comment!',
      Thing_id: Things[0].id,
      user_id: users[1].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      text: 'Third test comment!',
      Thing_id: Things[0].id,
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      text: 'Fourth test comment!',
      Thing_id: Things[0].id,
      user_id: users[3].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 5,
      text: 'Fifth test comment!',
      Thing_id: Things[Things.length - 1].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 6,
      text: 'Sixth test comment!',
      Thing_id: Things[Things.length - 1].id,
      user_id: users[2].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 7,
      text: 'Seventh test comment!',
      Thing_id: Things[3].id,
      user_id: users[0].id,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ];
}
function makeExpectedThing(users, Thing, reviews=[]) {
  const author = users
    .find(user => user.id === Thing.author_id)
  const number_of_reviews = reviews
    .filter(comment => comment.Thing_id === Thing.id)
    .length
  return {
    id: Thing.id,
    style: Thing.style,
    title: Thing.title,
    content: Thing.content,
    date_created: Thing.date_created.toISOString(),
    number_of_reviews,
    author: {
      id: author.id,
      user_name: author.user_name,
      full_name: author.full_name,
      nickname: author.nickname,
      date_created: author.date_created.toISOString(),
      date_modified: author.date_modified || null,
    },
  }
}
function makeExpectedThingreviews(users, ThingId, reviews) {
  const expectedreviews = reviews
    .filter(comment => comment.Thing_id === ThingId)
  return expectedreviews.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)
    return {
      id: comment.id,
      text: comment.text,
      date_created: comment.date_created.toISOString(),
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        nickname: commentUser.nickname,
        date_created: commentUser.date_created.toISOString(),
        date_modified: commentUser.date_modified || null,
      }
    }
  })
}
function makeMaliciousThing(user) {
  const maliciousThing = {
    id: 911,
    style: 'How-to',
    date_created: new Date(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedThing = {
    ...makeExpectedThing([user], maliciousThing),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousThing,
    expectedThing,
  }
}
function makeThingsFixtures() {
  const testUsers = makeUsersArray()
  const testThings = makeThingsArray(testUsers)
  const testreviews = makereviewsArray(testUsers, testThings)
  return { testUsers, testThings, testreviews }
}
function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        thingful_reviews,
        thingful_users,
        thingful_things
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE thingful_Things_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE thingful_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE thingful_reviews_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('thingful_Things_id_seq', 0)`),
        trx.raw(`SELECT setval('thingful_users_id_seq', 0)`),
        trx.raw(`SELECT setval('thingful_reviews_id_seq', 0)`),
      ])
    )
  )
}
function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('thingful_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('thingful_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}
function seedThingsTables(db, users, Things, reviews=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('thingful_Things').insert(Things)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('thingful_Things_id_seq', ?)`,
      [Things[Things.length - 1].id],
    )
    // only insert reviews if there are some, also update the sequence counter
    if (reviews.length) {
      await trx.into('thingful_reviews').insert(reviews)
      await trx.raw(
        `SELECT setval('thingful_reviews_id_seq', ?)`,
        [reviews[reviews.length - 1].id],
      )
    }
  })
}
function seedMaliciousThing(db, user, Thing) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('thingful_test')
        .insert([Thing])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeThingsArray,
  makeExpectedThing,
  makeExpectedThingreviews,
  makeMaliciousThing,
  makereviewsArray,
  makeThingsFixtures,
  cleanTables,
  seedThingsTables,
  seedMaliciousThing,
  makeAuthHeader,
  seedUsers,
}