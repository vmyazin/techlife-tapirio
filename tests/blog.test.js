const request = require('supertest');
const app = require('../app');
const router = require('../routes/index');
const Compiler = require('../scripts/compiler')
const path = router.blogPath;

let compiler;
describe('blog posts', () => {
    beforeAll(async () => {
        compiler = new Compiler(path);
    })
    it('can open all posts', async () => {
        const meta = await compiler.listMeta();
        for (let i = 0; i < meta.length; i++) {
            const response = await request(app)
                .get(`/blog/${meta[i].slug}`);
            expect(response.text).toContain(meta[i].title);
            expect(response.text).toContain(meta[i].image);
        }
    })
    it('All blog posts compile', async () => {
        expect(await compiler.compileAll()).toBe(true);
    })
})