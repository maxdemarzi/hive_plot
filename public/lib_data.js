// lib_data.js


var prep_data = function(plot_info, nodes) {

  var g       = plot_info.global
      g.nodes = nodes;

  /*
    The input data file, flare-imports.json, is firmly rooted in the
    problem domain.  It uses a list of hashes (aka objects) to define
    a directed graph.  Each hash defines a software module, giving its
    name, size, and a list of names for modules it imports.

    g.nodes = [
      { "name":     "flare.analytics.cluster.AgglomerativeCluster",
        "size":     3938,
        "imports":  [ "flare.animate.Transitioner", ... ]
      }, ...
    ];
  */

  var check_nodes = function(nodes) {
    var defined = {};

    for (var i=0; i<nodes.length; i++) {
      var node_name  = nodes[i].name;
      if (!defined[node_name]) defined[node_name] = true;
    }

    for (var i=0; i<nodes.length; i++) {
      var node_name  = nodes[i].name;
      var imports    = nodes[i].imports;
      for (var j=0; j<imports.length; j++) {
        var imp_name = imports[j];
        if (!defined[imp_name]) {
          var msg = 'Error: Target node (' + imp_name +
                    ') not found for source node (' + node_name + ').';
          console.log (msg);
  } } } };

  check_nodes(nodes);


  /*  Construct nodesByName, an index by node name:

    g.nodesByName = {
      "flare.animate.Pause": {
         "connectors":    [ <links object>, ... ],
         "imports":       [ "flare.animate.Transition", ... ],
         "index":         17,
         "name":          "flare.animate.Pause",
         "packageName":   "animate",
         "size":          449,
         "source":        <links object>,
         "target":        <links object>,
         "type":          "target-source"
      }, ... };
  */

  var index_by_node_name = function(d) {
    d.connectors          = [];
    d.packageName         = d.name.split('.')[1];
    g.nodesByName[d.name] = d;
  };

  g.nodesByName   = {};
  g.nodes.forEach(index_by_node_name);

  /*  Convert the import lists into links with sources and targets.
      Save an index hash for looking up sources.

    g.links = [
      {
        "source":  {
          "degree":   0,
          "node":     <nodesByName object>,
          "type":     "source"
        },

        "target":  {
          "degree":   0,
          "node":     <nodesByName object>,
          "type":     "source-target"
      }, ... ];

    g.sources = {
      <target name>:  <source name>, ...
    }
  */

  var do_source = function(source) {

    var do_target = function(targetName) {
      var target = g.nodesByName[targetName];

      if (!source.source) {
        source.source = { node: source,  degree: 0 };
        source.connectors.push(source.source);
      }

      if (!target.target) {
        target.target = { node: target,  degree: 0 };
        target.connectors.push(target.target);
      }

      g.links.push( { source: source.source,  target: target.target } );

      if ( !g.sources[targetName] ) g.sources[targetName] = {};
      g.sources[targetName][source.name]  = true;
    }

    source.imports.forEach(do_target);
  };

  g.links     = [];
  g.sources   = {};
  nodes.forEach(do_source);

  // Determine the type of each node, based on incoming and outgoing links.

  var node_type = function(node) {
    if (node.source && node.target) {
      node.type         = node.source.type = 'target-source';
      node.target.type  = 'source-target';
    } else if (node.source) {
      node.type         = node.source.type = 'source';
    } else if (node.target) {
      node.type         = node.target.type = 'target';
    } else {
      node.connectors   = [{ node: node }];
      node.type         = 'source';
    }
  };

  nodes.forEach(node_type);

  /* Nest nodes by type, for computing the rank.

     Normally, Hive Plots sort nodes by degree along each axis.
     However, since this example visualizes a package hierarchy,
     we get more interesting results if we group nodes by package.

     We don't need to sort explicitly because the data file is
     already sorted by class name.

    g.nodesByType = [
      {
         "count":         80, 
         "key":           "source",
         "values":        [ <nodesByName object>, ... ]
      }, ... ]
  */

  g.nodesByType = d3.nest()
    .key(function(d) { return d.type; })
    .sortKeys(d3.ascending)
    .entries(nodes);

  // Duplicate the target-source axis as source-target.

  g.nodesByType.push({ key:     'source-target',
                       values:  g.nodesByType[2].values });

  // Compute the rank for each type, with padding between packages.

  var type_rank = function(type) {

    var count     = 0,
        lastName  = type.values[0].packageName;

    var node_rank = function(d, i) {
      if (d.packageName != lastName) {
        lastName  = d.packageName;
        count    += 2;
      }
      d.index   = count++;
    };

    type.values.forEach(node_rank);
    type.count  = count - 1;
  };

  g.nodesByType.forEach(type_rank);

  // Console logging calls.
  
  if (false) {
    console.log('g.links',          g.links); //T
    console.log('g.nodes',          g.nodes); //T
    console.log('g.nodesByType',    g.nodesByType); //T
    console.log('g.nodesByName',    g.nodesByName); //T
    console.log('g.sources',        g.sources); //T
  }

};