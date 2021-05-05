function createVbo(gl, array) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return vbo;
}

function createIbo(gl, array) {
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, array, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  return ibo;
}

function createShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw `Shader compile is failed.\n${gl.getShaderInfoLog(shader)}\n${source}`;
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw `Program link is faield.\n${gl.getProgramInfoLog(program)}`;
  }

  return program;
}

function getAttribLocs(gl, program, names) {
  const locs = new Map();
  names.forEach(name => locs.set(name, gl.getAttribLocation(program, name)));
  return locs;
}

function getUniformLocs(gl, program, names) {
  const locs = new Map();
  names.forEach(name => locs.set(name, gl.getUniformLocation(program, name)));
  return locs;
}

function addVertex2(vertices, i, x, y) {
  vertices[i++] = x;
  vertices[i++] = y;
  return i;
}

function addVertex3(vertices, i, x, y, z) {
  vertices[i++] = x;
  vertices[i++] = y;
  vertices[i++] = z;
  return i;
}

function addQuad(indices, i, v00, v10, v01, v11) {
  indices[i] = v00;
  indices[i + 1] = indices[i + 5] = v10;
  indices[i + 2] = indices[i + 4] = v01;
  indices[i + 3] = v11;
  return i + 6;
};

function createTorus(majorRadius, minorRadius, majorSegment, minorSegment) {
  const vertexNum = majorSegment * minorSegment;
  const indices = new Uint16Array(6 * vertexNum);
  const positions = new Float32Array(3 * vertexNum);
  const normals = new Float32Array(3 * vertexNum);

  const stepMa = Math.PI * 2 / majorSegment;
  const stepMi = Math.PI * 2 / minorSegment;

  let pc = 0;
  let nc = 0;

  for (let mai = 0; mai < majorSegment; ++mai) {
    const angMa = -mai * stepMa;
    const center = [majorRadius * Math.cos(angMa), 0, majorRadius * Math.sin(angMa)];
    for (let mii = 0; mii < minorSegment; ++mii) {
      const angMi = mii * stepMi;
      const minorX = majorRadius + minorRadius * Math.cos(angMi);
      const pos = [minorX * Math.cos(angMa), minorRadius * Math.sin(angMi), minorX * Math.sin(angMa)];
      pc = addVertex3(positions, pc, pos[0], pos[1], pos[2]);
      const dir = [pos[0] - center[0], pos[1] - center[1], pos[2] - center[2]];
      const dist = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1] + dir[2] * dir[2]);
      nc = addVertex3(normals, nc, dir[0] / dist, dir[1] / dist, dir[2] / dist);
    }
  }

  let ic = 0;
  for (let mai = 0; mai < majorSegment; ++mai) {
    const maj = mai !== majorSegment - 1 ? mai + 1 : 0;
    for (let mii = 0; mii < minorSegment; ++mii) {
      const mij = mii !== minorSegment - 1 ? mii + 1 : 0;
      ic = addQuad(indices, ic, mii + mai * minorSegment, mii + maj * minorSegment, mij + mai * minorSegment, mij + maj * minorSegment);
    }
  }

  return {
    indices,
    positions,
    normals,
  };
}