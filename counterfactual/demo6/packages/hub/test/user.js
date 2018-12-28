describe('/user', function () {
  var server = require('../server/server')
  var request = require('supertest')(server)
  var expect = require('expect.js')

  var User

  before(function() {
    User = server.models.User
  })

  beforeEach(function (done) {
    User.upsert({
      id: 1,
      email: 'alice1@example.com',
      password: 'helloworld123',
    }, function() {
        done()
      })
  })

  it('Post - a new user', function (done) {
    request.post('/api/users').send({
      email: 'alice@example.com',
      password: 'helloworld123',
    }).expect(200, done)
  })

  it('Post - reset password', function (done) {
    request.post('/api/users/reset').send({
      email: 'alice@example.com'
    }).expect(200, done)
  })
})
