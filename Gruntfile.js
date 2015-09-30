var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.timed_squalls/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
    },
    clean: ['pa', modPath],
    proc: {
      drone: {
        targets: [
          'pa_ex1/units/sea/drone_carrier/drone/drone.json'
        ],
        process: function(spec) {
          delete spec.passive_health_regen
          spec.build_metal_cost = 30
          spec.tools.push( {
            "aim_bone": "bone_root", 
            "record_index": 0,
            "spec_id": "/pa/units/sea/drone_carrier/drone/drone_tool_death.json"
          })
        }
      },
      death_weapon: {
        src: [
          'pa_ex1/units/land/titan_structure/titan_structure_tool_weapon.json'
        ],
        cwd: media,
        dest: 'pa/units/sea/drone_carrier/drone/drone_tool_death.json',
        process: function(spec) {
          spec.ammo_id = '/pa/units/sea/drone_carrier/drone/drone_death_pbaoe.json'
          spec.fire_delay = 0
          spec.ammo_capacity = 30
          spec.ammo_per_shot = 30
          spec.self_destruct = true
          return spec
        }
      },
      death_ammo: {
        src: [
          'pa_ex1/units/land/titan_structure/titan_structure_pbaoe.json'
        ],
        cwd: media,
        dest: 'pa/units/sea/drone_carrier/drone/drone_death_pbaoe.json',
        process: function(spec) {
          delete spec.planet_impact_spec
          return spec
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerMultiTask('proc', 'Process unit files into the mod', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'copy:mod']);

};

