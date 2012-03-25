// main.js

  function snap(i) { return function() { return i; }; }


  var demo_info       =  {},
      inner_radius    =  20,
      outer_radius    = 120,
      degree          = Math.PI / 180,
      x_max           = 250,
      y_max           = 220;

  var demos     = { '#hv_1_1':   'ze_data.json',
                    '#hv_1_2':   'ze_test.json',
                    '#hv_1_3':   'ze_test.json',
                    '#hv_2_1':   'ze_test.json',
                    '#hv_2_2':   'ze_test.json',
                    '#hv_2_3':   'ze_test.json',
                    '#hv_3_1':   'ze_test.json',
                    '#hv_3_2':   'ze_test.json',
                    '#hv_3_3':   'ze_test.json' };

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
        'source-target':  { 'angle':  degree * 120 },
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