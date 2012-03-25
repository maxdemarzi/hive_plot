// lib_mouse.js

var setup_mouse = function(plot_info) {

  var g = plot_info.global;

  // Initialize the info display.

  var default_precis,
      formatNumber  = d3.format(',d'),
      indent        = '&nbsp;&nbsp;';

  var notes   = d3.select('.notes')

  on_mouseout = function() {
  //
  // Clear any highlighted nodes or links.

    g.svg.selectAll('.active').classed('active', false);

    notes.html('');
  }


  on_mouseover_h = function(css_class, html_inp) {
  //
  // Helper for on_mouseover_{link,node}.

    if (!html_inp) return '';

    if (css_class == 'ib')
      hdr  = '<h4 class="ib">Imported by:</h4>';
    else
      hdr  = '<h4 class="im">Imports:</h4>';

    return '<span class="' + css_class+ '">'
         + hdr + html_inp + '</span>';
  };


  on_mouseover_link = function(d) {
  //
  // Highlight the link and connected nodes on mouseover.

    var active_l  = function(p) { return p === d; };

    var active_n  = function(p) { return p === d.source ||
                                         p === d.target; };

    g.svg.selectAll('.link'        ).classed('active', active_l);
    g.svg.selectAll('.node ellipse').classed('active', active_n);

    var html_ib   = on_mouseover_h('ib', d.source.node.name);
    var html_im   = on_mouseover_h('im', d.target.node.name);
    var html      = '<h3>Link:</h3>' + html_ib + html_im;

    notes.html(html);
  }


  on_mouseover_node = function(d) {
  //
  // Highlight the node and connected links on mouseover.

    var active_l = function(p) { return d === p.source ||
                                        d === p.target;   };

    g.svg.selectAll('.link').classed('active', active_l);

    d3.select(this).classed('active', true);

    var src_tmp   = g.sources[d.node.name];
    var sources   = src_tmp ? Object.keys(src_tmp).sort().join('<br>') : '';

    var targets   = d.node.imports.sort().join('<br>');

    var html_ib   = on_mouseover_h('ib', sources);
    var html_im   = on_mouseover_h('im', targets);
    var html      = '<h3>Node:</h3>' + d.node.name
                  + html_ib + html_im;

    notes.html(html);
  }
};