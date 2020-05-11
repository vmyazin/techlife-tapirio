const request = require('supertest')
const app = require('../app')
const preferences = require('../content/preferences.json');

describe('main route', () => {
    it('returns 200', async () => {
        const response = await request(app)
            .get("/")
        expect(response.statusCode).toBe(200);
    })
    it('contains blog info', async () => {
        const response = await request(app)
            .get("/")

        expect(response.text).toContain(preferences.blog.title);
    })

})