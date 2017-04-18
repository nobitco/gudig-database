'use strict'

const uuid = require('uuid-base62')

const fixtures = {
  getUser () {
    return {
      name: 'A random user',
      username: `user_${uuid.v4()}`,
      password: uuid.uuid(),
      email: `${uuid.v4()}@gudig.test`
    }
  }
}

module.exports = fixtures
