var Tilemap = function (parameters) {

  'use strict';

  parameters = parameters || { tileset: {} };

  this.tileSize = parameters.tileSize;
  this.numOfCols = parameters.numOfCols;
  this.numOfRows = parameters.numOfRows;
  this.numOfCells = this.numOfCols * this.numOfRows;

  console.log(this.numOfCells);

  this.width = this.tileSize * this.numOfCols;
  this.height = this.tileSize * this.numOfRows;

  var tileset = parameters.tileset;

  tileset.tileSizeU = tileset.tileSize / tileset.width;
  tileset.tileSizeV = tileset.tileSize / tileset.height;
  tileset.spacingU = tileset.spacing / tileset.width;
  tileset.spacingV = tileset.spacing / tileset.height;

  this.tileset = tileset;

  var indices = new Uint16Array(this.numOfCells * 6);
  var vertices = new Float32Array(this.numOfCells * 4 * 3);
  var normals = new Float32Array(this.numOfCells * 4 * 3);
  var uvs = new Float32Array(this.numOfCells * 4 * 2);
  var colors = new Float32Array(this.numOfCells * 4 * 3);

  // for (var i = 0; i < normals.length; i += 3) {
  //   normals[i + 0] = 0;
  //   normals[i + 1] = 0;
  //   normals[i + 2] = 1; // Z
  //
  //   colors[i + 0] = Math.random();
  //   colors[i + 1] = Math.random();
  //   colors[i + 2] = Math.random();
  // }

  var offset12 = 0;
  var offset6 = 0;
  var offset4 = 0;
  var ix, iy;
  var x, y;

  for (iy = 0; iy < this.numOfRows; iy += 1) {

    y = iy * this.tileSize - this.height / 2;

    for (ix = 0; ix < this.numOfCols; ix += 1) {

      x = ix * this.tileSize - this.width / 2;

      vertices[offset12 + 0 ] = x;
      vertices[offset12 + 1 ] = y;
      vertices[offset12 + 2 ] = 0;

      vertices[offset12 + 3 ] = x + this.tileSize;
      vertices[offset12 + 4 ] = y;
      vertices[offset12 + 5 ] = 0;

      vertices[offset12 + 6 ] = x;
      vertices[offset12 + 7 ] = y + this.tileSize;
      vertices[offset12 + 8 ] = 0;

      vertices[offset12 + 9 ] = x + this.tileSize;
      vertices[offset12 + 10] = y + this.tileSize;
      vertices[offset12 + 11] = 0;

      indices[offset6 + 0] = offset4 + 0;
      indices[offset6 + 1] = offset4 + 1;
      indices[offset6 + 2] = offset4 + 2;

      indices[offset6 + 3] = offset4 + 1;
      indices[offset6 + 4] = offset4 + 3;
      indices[offset6 + 5] = offset4 + 2;

      offset12 += 12;
      offset6 += 6;
      offset4 += 4;
    }
  }

  var geometry = new THREE.BufferGeometry();
  geometry.dynamic = true;
  geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
  // geometry.addAttribute('normal', new THREE.BufferAttribute(normals, 3));
  geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  // geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

  var material = new THREE.MeshPhongMaterial({
    map: tileset.texture,
    side: THREE.DoubleSide
    // vertexColors: THREE.VertexColors
    // color: 0x00ff00
    // shading: THREE.FlatShading,
    // blending: THREE.AdditiveBlending,
    // wireframe: true,
    // depthTest: false,
    // transparent: true
  });
  var mesh = new THREE.Mesh(geometry, material);

  this.mesh = mesh;
}

Tilemap.prototype.fill = function (tile) {

  var map = [];
  for (var i = 0; i < this.numOfCells; i += 1)
    map.push(tile);

  this.setMap(map);
};

// Tilemap.prototype.setTile = function (tile, x, y) {
//
//   var tileset = this.tileset;
//   var geometry = this.mesh.geometry;
//   var uvs = geometry.attributes.uv.array;
//   var iv = Math.floor(tile / tileset.numOfCols);
//   var iu = tile - (tileset.numOfCols * iv);
//   var offset = 8 * (y * tileset.numOfCols + x);
//
//   v0 = 1 - ((iv * (tileset.tileSizeV + 2 * tileset.spacingV)) + tileset.spacingV);
//   u0 = iu * (tileset.tileSizeU + 2 * tileset.spacingU) + tileset.spacingU;
//
//   v1 = v0 - tileset.tileSizeV;
//   u1 = u0 + tileset.tileSizeU;
//
//   uvs[offset + 0] = u0;
//   uvs[offset + 1] = v0;
//
//   uvs[offset + 2] = u1;
//   uvs[offset + 3] = v0;
//
//   uvs[offset + 4] = u0;
//   uvs[offset + 5] = v1;
//
//   uvs[offset + 6] = u1
//   uvs[offset + 7] = v1;
// };

// TODO: dedupe code from above
Tilemap.prototype.setMap = function (map) {

  var iu, iv, u0, v0, u1, v1, tile;
  var offset8 = 0;
  var geometry = this.mesh.geometry;
  var uvs = geometry.attributes.uv.array;
  var tileset = this.tileset;

  if (map.length !== this.numOfCells) {
    console.log('Error: map has wrong dimensions');
    return;
  }

  for (var i = 0; i < map.length; i += 1) {

    tile = map[i];
    iv = Math.floor(tile / tileset.numOfCols);
    iu = tile - (tileset.numOfCols * iv);

    v0 = 1 - ((iv * (tileset.tileSizeV + 2 * tileset.spacingV)) + tileset.spacingV);
    u0 = iu * (tileset.tileSizeU + 2 * tileset.spacingU) + tileset.spacingU;

    v1 = v0 - tileset.tileSizeV;
    u1 = u0 + tileset.tileSizeU;

    uvs[offset8 + 0] = u0;
    uvs[offset8 + 1] = v0;

    uvs[offset8 + 2] = u1;
    uvs[offset8 + 3] = v0;

    uvs[offset8 + 4] = u0;
    uvs[offset8 + 5] = v1;

    uvs[offset8 + 6] = u1
    uvs[offset8 + 7] = v1;

    offset8 += 8;
  }

  geometry.attributes.uv.needsUpdate = true;
};

window.Tilemap = Tilemap;
