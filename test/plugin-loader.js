var PluginLoader = require('../')
  , mkdirp = require('mkdirp')
  , rimraf = require('rimraf')
  , fs = require('fs')
  , sinon = require('sinon');

var pluginCode = "module.exports = function(name, deps) { deps.done(name); }";

describe('PluginLoader', function(){
  var pluginLoader;
  var tempDir = __dirname + '/.tmp/';
  var pluginDir = tempDir + 'plugins/';

  beforeEach(function(){
    pluginLoader = new PluginLoader();
  });

  describe('#loadPlugins()', function(){
    var deps;

    beforeEach(function() {
      rimraf.sync(tempDir);
      mkdirp.sync(pluginDir);
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

    it('should pass the correct name to the plugin constructor', function() {
      var name = 'test';
      createPlugin(name);
      sinon.spy(deps, 'done');

      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          deps.done.getCall(0).args[0].should.eql(name);
        });
    });


    it('should read multiple plugins', function() {
      createPlugin('test1');
      createPlugin('test2');
      createPlugin('test3');

      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          result.should.be.ok;
          result.plugins.length.should.be.exactly(3);
          result.assets.length.should.be.exactly(0);
          result.styles.length.should.be.exactly(0);
        });
    });

    it('should load assets', function() {
      var name = 'test';
      var publicDir = pluginDir + 'test/public/';
      createPlugin(name);
      mkdirp.sync(publicDir);

      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          result.assets.length.should.be.exactly(1);
          result.assets[0].path.should.endWith(name);
          result.assets[0].assets.should.endWith('test/public');
        });
    });

    it('should load scripts', function() {
      var name = 'test';
      var jsDir = pluginDir + 'test/public/js/';
      createPlugin(name);
      mkdirp.sync(jsDir);
      fs.writeFileSync(jsDir + 'file.js', '');

      pluginLoader.loadPlugins(pluginDir, 'foo', deps,
        function(result) {
          result.scripts.length.should.be.exactly(1);
          result.scripts[0].should.endWith('file.js');
        });
    });
  });

  function createPlugin(name) {
    var dir = pluginDir + name + '/';
    mkdirp.sync(dir);
    fs.writeFileSync(dir + 'index.js', pluginCode);
  }
});

