'use strict'

const test = require('ava')
const uuid = require('uuid-base62')
const r = require('rethinkdb')
const Db = require('../')

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
