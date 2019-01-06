var cubeRotation = 0.0;

const projectionMatrix = mat4.create();
function initProjectionMatrix(gl) {
  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;

  // note: glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);
  // mat4.rotate(projectionMatrix, projectionMatrix, 0.3, [0, 1, 0]);
  // mat4.translate(
  //   projectionMatrix,
  //   projectionMatrix,
  //   [-0.5, -0.5, 0]);
}

function init() {

  var body = document.body;
  var html = document.documentElement;

  var height = Math.max(
      body.scrollHeight,
      body.offsetHeight, 
      html.clientHeight,
      html.scrollHeight,
      html.offsetHeight
  ) - 3;

  canvas = document.getElementById("canvas");
  canvas.width = document.body.clientWidth;
  canvas.height = height;

  var gl = canvas.getContext('webgl2');
  if (gl === null) {
    alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
    return;
  }
  initProjectionMatrix(gl);
  clearScene(gl);  

  let vsSource = document.getElementById("vertex-shader").text;
  let fsSource = document.getElementById("fragment-shader").text;
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const buffers = initBuffers(gl);
  const woodTexture = loadTexture(gl, "./dice.jpg");

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
      vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    },
  };
  console.log(programInfo);

  var then = 0;
  // Draw the scene repeatedly
  var render = function(now) {
    now *= 0.001;  // convert to seconds
    cubeRotation += (now - then);
    then = now;

    drawScene(gl, programInfo, buffers, woodTexture);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}



function initBuffers(gl) {
  const textureCoordinates = [
    // Front : 1
    0.0,  0.0,
    0.493,  0.0,
    0.493,  0.325,
    0.0,  0.325,
    // Back : 6
    0.503,  0.66,
    1.0,  0.66,
    1.0,  1.0,
    0.503,  1.0,
    // Top : 5
    0.0,  0.66,
    0.493,  0.66,
    0.493,  1.0,
    0.0,  1.0,
    // Bottom : 2
    0.51,  0.0,
    1.0,  0.0,
    1.0,  0.325,
    0.51,  0.325,
    // Right : 4
    0.51,  0.33,
    1.0,  0.33,
    1.0,  0.66,
    0.51,  0.66,
    // Left : 3
    0.0,  0.33,
    0.493,  0.33,
    0.493,  0.66,
    0.0,  0.66,
  ];
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl.STATIC_DRAW);
  textureCoordBuffer.itemSize = 2;
  textureCoordBuffer.numItems = textureCoordinates.length / textureCoordBuffer.intemSize;

  // ------------------------------------------------------------------------------
  
  const cubeVertices = [
    // Front face
    0.25, 0.25, 0.75,
    0.75, 0.25, 0.75,
    0.75, 0.75, 0.75,
    0.25, 0.75, 0.75,
    
    // Back face
    0.25, 0.25, 0.25,
    0.25, 0.75, 0.25,
    0.75, 0.75, 0.25,
    0.75, 0.25, 0.25,
    
    // Top face
    0.25, 0.75, 0.25,
    0.25, 0.75, 0.75,
    0.75, 0.75, 0.75,
    0.75, 0.75, 0.25,
    
    // Bottom face
    0.25, 0.25, 0.25,
    0.75, 0.25, 0.25,
    0.75, 0.25, 0.75,
    0.25, 0.25, 0.75,
    
    // Right face
    0.75, 0.25, 0.25,
    0.75, 0.75, 0.25,
    0.75, 0.75, 0.75,
    0.75, 0.25, 0.75,
    
    // Left face
    0.25, 0.25, 0.25,
    0.25, 0.25, 0.75,
    0.25, 0.75, 0.75,
    0.25, 0.75, 0.25,
  ];
  const cubePositionBuffer = gl.createBuffer();
  cubePositionBuffer.itemSize = 3;
  cubePositionBuffer.numItems = cubeVertices.length / cubePositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
  // ------------
  const cubeIndices = [
     0,  1,  2,    0,  3,  2,   // front
     4,  5,  6,    4,  6,  7,   // back
     8,  9, 10,    8, 10, 11,   // top
    12, 13, 14,   12, 14, 15,   // bottom
    16, 17, 18,   16, 18, 19,   // right
    20, 21, 22,   20, 22, 23,   // left
  ];
  const cubeIndexBuffer = gl.createBuffer();
  cubeIndexBuffer.itemSize=1;
  cubeIndexBuffer.numItems=cubeIndices.length / cubeIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
  // ------------
  var cubeNormals = [
    // Front face
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back face
     0.0,  0.0, -1.0,    
     0.0,  0.0, -1.0,    
     0.0,  0.0, -1.0,    
     0.0,  0.0, -1.0,
    
    // Top face
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom face
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
    
    // Right Face
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
    
    // Left face
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
  ];
  const cubeNormalsBuffer = gl.createBuffer();
  cubeNormalsBuffer.itemSize=3;
  cubeNormalsBuffer.numItems=cubeNormals.length / cubeNormalsBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);

  // ------------------------------------------------------------------------------

  const pyramidVertices = [
    // front face
    -0.50,  1.00, -0.50,
    -0.25, -0.25, -0.75,
    -0.75, -0.25, -0.75,

    // back face
    -0.50,  1.00, -0.50,
    -0.25, -0.25, -0.25,
    -0.75, -0.25, -0.25,

    // right face
    -0.50,  1.00, -0.50,
    -0.75, -0.25, -0.25,
    -0.75, -0.25, -0.75,

    // left face
    -0.50,  1.00, -0.50,
    -0.25, -0.25, -0.75,
    -0.25, -0.25, -0.25,

    // bottom face
    -0.25, -0.25, -0.25,
    -0.75, -0.25, -0.25,
    -0.25, -0.25, -0.75,
    -0.75, -0.25, -0.75,
  ];
  const pyramidPositionBuffer = gl.createBuffer();
  pyramidPositionBuffer.itemSize = 3;
  pyramidPositionBuffer.numItems = pyramidVertices / pyramidPositionBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidVertices), gl.STATIC_DRAW);
  // ------------
  const pyramidIndices = [
    0,  1,  2,                // front
    3,  4,  5,                // back
    6,  7,  8,                // right
    9, 10, 11,                // left
    12, 13, 14,   13, 14, 15,  // bottom
  ];
  const pyramidIndexBuffer = gl.createBuffer();
  pyramidIndexBuffer.itemSize=1;
  pyramidIndexBuffer.numItems=pyramidIndices.length / pyramidIndexBuffer.itemSize;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
  // ------------
  var pyramidNormals = [
    // Front face
     0.0,  0.25, -1.25,
     0.0,  0.25, -1.25,
     0.0,  0.25, -1.25,

    // Back face
     0.0,  0.25,  1.25,
     0.0,  0.25,  1.25,
     0.0,  0.25,  1.25,

    // Right face
    -1.25,  0.25,  0.0,
    -1.25,  0.25,  0.0,
    -1.25,  0.25,  0.0,

    // Left face
    1.25,  0.25,  0.0,
    1.25,  0.25,  0.0,
    1.25,  0.25,  0.0,

    // Bottom face
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
  ];
  const pyramidNormalsBuffer = gl.createBuffer();
  pyramidNormalsBuffer.itemSize=3;
  pyramidNormalsBuffer.numItems=pyramidNormals.length / pyramidNormalsBuffer.itemSize;
  gl.bindBuffer(gl.ARRAY_BUFFER, pyramidNormalsBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pyramidNormals), gl.STATIC_DRAW);

  // ------------------------------------------------------------------------------

  return {
    cubePosition: cubePositionBuffer,
    cubeIndices: cubeIndexBuffer,
    cubeNormals: cubeNormalsBuffer,
    pyramidPosition: pyramidPositionBuffer,
    pyramidIndices: pyramidIndexBuffer,
    pyramidNormals: pyramidNormalsBuffer,
    textureCoord: textureCoordBuffer,
  };
}


function clearScene(gl) {
  gl.clearColor(0.0, 0.0, 0.0, 0.2);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function drawScene(gl, programInfo, buffers, texture) {
  clearScene(gl);
  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.


  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to start drawing the cube.
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [0.0, 0.0, -6.0]);  // amount to translate

  // move to center of the cube (0.5, 0.5, 0.5)
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [0.5, 0.5, 0.5]);  // amount to translate
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      cubeRotation*0.9,   // amount to rotate in radians
      [0, 0, 1]);   // axis to rotate around
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      cubeRotation*0.5,   // amount to rotate in radians
      [0, 1, 0]);   // axis to rotate around
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      cubeRotation*1.1,   // amount to rotate in radians
      [1, 0, 0]);   // axis to rotate around
  // go back to origine (0, 0, 0)
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [-0.5, -0.5, -0.5]);  // amount to translate


  const normalMatrix = mat4.create();
  mat4.invert(normalMatrix, modelViewMatrix);
  mat4.transpose(normalMatrix, normalMatrix)

  // Tell WebGL to use our program when drawing
  gl.useProgram(programInfo.program);

  // Set the shader uniforms
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.normalMatrix,
      false,
      normalMatrix);
  
  bind_buffer_to_attribute(gl, buffers.pyramidPosition, programInfo.attribLocations.vertexPosition, gl.FLOAT);
  bind_buffer_to_attribute(gl, buffers.pyramidNormals, programInfo.attribLocations.vertexNormal, gl.FLOAT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.pyramidIndices);
  gl.drawElements(gl.TRIANGLES, buffers.pyramidIndices.numItems, gl.UNSIGNED_SHORT, 0);
  
  bind_buffer_to_attribute(gl, buffers.textureCoord, programInfo.attribLocations.textureCoord, gl.FLOAT);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);
  
  bind_buffer_to_attribute(gl, buffers.cubePosition, programInfo.attribLocations.vertexPosition, gl.FLOAT);
  bind_buffer_to_attribute(gl, buffers.cubeNormals, programInfo.attribLocations.vertexNormal, gl.FLOAT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.cubeIndices);
  gl.drawElements(gl.TRIANGLES, buffers.cubeIndices.numItems, gl.UNSIGNED_SHORT, 0);
}

function bind_buffer_to_attribute(gl, buffer, attribLocation, type) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    // const type = gl.FLOAT;    // the data in the buffer is 32bit floats
    const normalize = false;  // don't normalize
    const stride = 0;         // how many bytes to get from one set of values to the next
                              // 0 = use type and numComponents above
    const offset = 0;         // how many bytes inside the buffer to start from
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(
        attribLocation,
        buffer.itemSize,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(attribLocation);
}

//
// A 'Shader Programm' is composed of both 'Vertex Shader' and 'Fragement Shader'.
// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//
// creates a shader of the given type, uploads the source and compiles it.
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object
  gl.shaderSource(shader, source);

  // Compile the shader program
  gl.compileShader(shader);

  // See if it didn't compile successfully, alert
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the '+type+' shader: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
function loadTexture(gl, url) {
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  image.src = url;

  return texture;
}
