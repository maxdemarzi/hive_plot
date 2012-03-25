// lib_plot.js

var setup_plot = function(plot_info) {

  var g = plot_info.global;

  g.angle_dom = [], g.angle_rng = [];

  axes_info = plot_info.axes;
  for (var axis_name in axes_info) {
    axis_info = axes_info[axis_name];
    g.angle_dom.push(axis_name);
    g.angle_rng.push(axis_info.angle);
  }

  g.angle_f     = d3.scale.ordinal().domain(g.angle_dom).range(g.angle_rng);

  var radii     = [ g.inner_radius, g.outer_radius ]
  g.radius_f    = d3.scale.linear().range(radii);

  g.color_f     = d3.scale.category10();

  g.transform   = 'translate(' + g.x_off + ',' + g.y_off + ')';

  g.svg         = d3.select(g.selector + ' .chart')
                    .append('svg')
                      .attr('width',      g.x_max)
                      .attr('height',     g.y_max)
                      .append('g')
                        .attr('transform',  g.transform);

  // console.log('plot_info', plot_info); //T
};


var degrees = function(radians) { return radians / Math.PI * 180 - 90; }


var display_plot = function(plot_info) {

  var g = plot_info.global;

  // Set the radius domain.

  var index   = function(d) { return d.index; };

  var extent  = d3.extent(g.nodes, index);
  g.radius_f.domain(extent);


  // Draw the axes.

  var transform = function(d) {
    return 'rotate(' + degrees( g.angle_f(d.key) ) + ')';
  };

  var x1 = g.radius_f(0) - 10;
  var x2 = function(d) { return g.radius_f(d.count) + 10; };

  g.svg.selectAll('.axis')
    .data(g.nodesByType)
    .enter().append('line')
      .attr('class', 'axis')
      .attr('transform', transform)
      .attr('x1', x1)
      .attr('x2', x2);

  // Draw the links.

  var link_classes = function(d) {
    if (d.source.type === 'source' ||
        d.target.type === 'target') return 'link im';

    var link_dir = d.ib_edge ? 'ib' : 'im'; //D

    return 'link ' + link_dir;
  };

  var path_angle  = function(d) { return g.angle_f(d.type);    };
  var path_radius = function(d) { return g.radius_f(d.node.index); };

  g.svg.append('g')
    .attr('class', 'links')
    .selectAll('.link')
    .data(g.links)
    .enter().append('path')
      .attr('d', make_link().angle(path_angle).radius(path_radius) )
      .attr('class', link_classes)
      .on('mouseover', on_mouseover_link)
      .on('mouseout',  on_mouseout);

  // Draw the nodes.  Note that each node can have up to two connectors,
  // representing the source (outgoing) and target (incoming) links.

  var connectors  = function(d) { return d.connectors; };
  var cx          = function(d) { return g.radius_f(d.node.index); };
  var fill        = function(d) { return g.color_f(d.packageName); };

  var transform   = function(d) {
    return 'rotate(' + degrees( g.angle_f(d.type) ) + ')';
  };

  g.svg.append('g')
    .attr('class', 'nodes')
    .selectAll('.node')
    .data(g.nodes)
    .enter().append('g')
      .attr('class', 'node')
      .style('fill', fill)
      .selectAll('ellipse')
      .data(connectors)
      .enter().append('ellipse')
        .attr('transform', transform)
        .attr('cx', cx)
        .attr('rx', 4)
        .attr('ry', 6)
        .on('mouseover', on_mouseover_node)
        .on('mouseout',  on_mouseout);
};