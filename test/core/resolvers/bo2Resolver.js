var expect = require('expect.js');
var mout = require('mout');
var path = require('path');
var Bo2Resolver = require('../../../lib/core/resolvers/Bo2Resolver');

describe('Bo2Resolver', function () {
    var testPackage = path.resolve(__dirname, '../../assets/package-bo2');

    describe('#bo2Path#resolve', function () {
        it('should return false', function () {

            var cwd = path.resolve(testPackage, 'repo/TestClients/TCbo2.Web.Telefon.Liste.Agent');
            var sources = {
                'bo2@bo2.Core.Web.Ui': path.resolve(testPackage, 'repo/Projects/Core/bo2.Core.Web.Ui'),
                'bo2://bo2.Web.Artikel.Suche.Ui': path.resolve(testPackage, 'repo/Projects/Web/bo2.Web.Artikel.Suche.Ui')
            };

            mout.object.forOwn(sources, function (expected, source) {
                expect(Bo2Resolver.bo2Path.resolve(cwd, source)).to.be(expected);
            });
        });
    });
});
