// main.js

  function snap(i) { return function() { return i; }; }


  var demo_info       =  {},
      inner_radius    =  20,
      outer_radius    = 120,
      degree          = Math.PI / 180,
      x_max           = 250,
      y_max           = 220;

  var demos     = { '#hv_1_1':   '/hive/Boo',
                    '#hv_1_2':   '/hive/Dylan',
                    '#hv_1_3':   '/hive/Factor',
                    '#hv_2_1':   '/hive/Gosu',
                    '#hv_2_2':   '/hive/Mirah',
                    '#hv_2_3':   '/hive/Nemerle',
                    '#hv_3_1':   '/hive/Nu',
                    '#hv_3_2':   '/hive/Parrot',
                    '#hv_3_3':   '/hive/Self' };

  for (var demo in demos) {

    var demo_f = snap(demo);

    demo_info[demo]  = {
      'global': {
        'selector':       demo_f(),
        'x_max':          x_max,          'x_off':          x_max * 0.50,
        'y_max':          y_max,          'y_off':          y_max * 0.65,
        'inner_radius':   inner_radius,   'outer_radius':   outer_radius,
      },

      'axes': {
        'source':         { 'angle':  degree *   0 },
        'target-source':  { 'angle':  degree * 120 },
        'target':         { 'angle':  degree * 240 }
      }
    };

    var func_f = function() {
      var info  = demo_info[demo];

      var func  = function(nodes) {
        prep_data(info, nodes);
        setup_mouse(info);
        display_plot(info);
      };
      return func;
    };

    setup_plot(demo_info[demo]);
    d3.json(demos[demo], func_f() );
  }