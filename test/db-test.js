'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')
const utils = require('../lib/utils')
const fixtures = require('./fixtures')

test.beforeEach('setup database', async t => {
  const dbName = `gudig_${uuid.v4()}`
  const db = new Db({ db: dbName, setup: true })
  await db.connect()
  t.context.db = db
  t.context.dbName = dbName
  t.true(db.connected, 'should be connected')
})

test.afterEach.always('clenaup database', async t => {
  let db = t.context.db
  let dbName = t.context.dbName

  await db.disconnect()
  t.false(db.connected, 'should be disconnected')

  let conn = await r.connect({})
  await r.dbDrop(dbName).run(conn)
})

test('save user', async t => {
  let db = t.context.db

  t.is(typeof db.saveUser, 'function', 'saveUser is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  let created = await db.saveUser(user)

  t.is(user.username, created.username)
  t.is(user.email, created.email)
  t.is(user.name, created.name)
  t.is(utils.encrypt(plainPassword), created.password)
  t.is(typeof created.id, 'string')
  t.truthy(created.createdAt)
})

test('get user', async t => {
  let db = t.context.db

  t.is(typeof db.getUser, 'function', 'getUser is a function')

  let user = fixtures.getUser()
  let created = await db.saveUser(user)
  let result = await db.getUser(user.username)

  t.deepEqual(created, result)
})

test('authenticate user', async t => {
  let db = t.context.db

  t.is(typeof db.authenticate, 'function', 'authenticate is a function')

  let user = fixtures.getUser()
  let plainPassword = user.password
  await db.saveUser(user)

  let success = await db.authenticate(user.username, plainPassword)
  t.true(success)

  let fail = await db.authenticate(user.username, 'foo')
  t.false(fail)

  let failure = await db.authenticate('foo', 'bar')
  t.false(failure)
})
