var Color = require('color');
describe('color', function () {
    it('parse rgba right', function () {
        var rgba = Color.parse('rgba(1,2,3,0.4)');
        expect(rgba.getR()).to.be(1);
        expect(rgba.getG()).to.be(2);
        expect(rgba.getB()).to.be(3);
        expect(rgba.getA()).to.be(0.4);
    });
});