var PluginLoader = require('../')
  , mkdirp = require('mkdirp')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , sinon = require('sinon');

var pluginCode = "module.exports = function(name, deps) { deps.done(); }";

describe('PluginLoader', function(){
  var pluginLoader;
  var tempDir = __dirname + '/.tmp/';
  var pluginDir = tempDir + 'plugins/';

  beforeEach(function(){
    pluginLoader = new PluginLoader();
    mkdirp.sync(pluginDir);
  });

  afterEach(function() {
    rimraf.sync(tempDir);
  });

  describe('#loadPlugins()', function(){
    var deps;

    beforeEach(function() {
      deps = { done: function() {} };
    });

    it('should find a plugin with no assets', function() {
      createPlugin('test1');
      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          result.should.be.ok;
          result.plugins.length.should.be.exactly(1);
          result.assets.length.should.be.exactly(0);
          result.styles.length.should.be.exactly(0);
        });
    });

    it('should call the "done" method on the plugin', function() {
      createPlugin('test1');
      sinon.spy(deps, "done");

      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          deps.done.calledOnce.should.be.true;
        });
    });


  });

  function createPlugin(name) {
    var dir = pluginDir + name + '/';
    mkdirp.sync(dir);
    fs.writeFileSync(dir + 'index.js', pluginCode);
  }
});

