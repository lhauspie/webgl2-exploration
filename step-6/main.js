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
  
  gl.clearColor(0.0, 0.0, 0.0, 0.2);
  gl.clear(gl.COLOR_BUFFER_BIT);


  let vsSource = document.getElementById("vertex-shader").text;
  let fsSource = document.getElementById("fragment-shader").text;
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  const buffers = initBuffers(gl);
  
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
    },
  };
  console.log(programInfo);

  // squareRotation = 0.3;
  // drawScene(gl, programInfo, buffers);

  // Draw the scene repeatedly
  var render = function(now) {
    now *= 0.001;  // convert to seconds
    squareRotation += (now - then);
    then = now;

    drawScene(gl, programInfo, buffers);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}


var squareRotation = 0.0;
var then = 0;

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

function initBuffers(gl) {
  // Create a buffer for the square's positions.
  const squarePositionBuffer = gl.createBuffer();

  // Select the squarePositionBuffer as the one to apply buffer operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);

  // Now create an array of positions for the square.
  const squareVertices = [
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

  // Now pass the list of positions into WebGL to build the shape.
  // We do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(squareVertices),
                gl.STATIC_DRAW);
  squarePositionBuffer.itemSize=3;
  squarePositionBuffer.numItems=squareVertices.length / squarePositionBuffer.itemSize;

  // ------------------------------------------------------------------------------
  
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  const faceColors = [
      [1.0,  1.0,  1.0,  1.0],    // Front face: white
      [1.0,  0.0,  0.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],    // Left face: purple
  ];

  // Convert the array of colors into a table for all the vertices.
  var colors = [];
  for (var j = 0; j < faceColors.length; ++j) {
    const c = faceColors[j];
    // Repeat each color four times for the four vertices of the face
    colors = colors.concat(c, c, c, c);
  }

  // colors = [
  //     1.0,  1.0,  1.0,  1.0,    // Front face: white
  //     1.0,  0.0,  0.0,  1.0,    // Back face: red
  //     0.0,  1.0,  0.0,  1.0,    // Top face: green
  //     0.0,  0.0,  1.0,  1.0,    // Bottom face: blue
  // ];
  colorBuffer.itemSize=4;
  colorBuffer.numItems=colors.length / colorBuffer.itemSize;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  // ------------------------------------------------------------------------------
  
  const squareIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);

  // This array defines each face as two triangles, using the
  // indices into the vertex array to specify each triangle's
  // position.
  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];
  squareIndexBuffer.itemSize=1;
  squareIndexBuffer.numItems=indices.length / squareIndexBuffer.itemSize;

  // Now send the element array to GL
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

  // ------------------------------------------------------------------------------

  const trianglePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  
  const triangleVertices = [
    -1.50, -1.50,
    -1.75, -1.25,
    -1.25, -1.25,
  ];
  trianglePositionBuffer.itemSize=2;
  trianglePositionBuffer.numItems=3;

  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(triangleVertices),
                gl.STATIC_DRAW);

  // ------------------------------------------------------------------------------

  return {
    squarePosition: squarePositionBuffer,
    squareIndices: squareIndexBuffer,
    trianglePosition: trianglePositionBuffer,
    color: colorBuffer,
  };
}


function drawScene(gl, programInfo, buffers, rotation) {
  gl.clearColor(0.0, 0.0, 0.0, 0.2);  // Clear to black, fully opaque
  gl.clearDepth(1.0);                 // Clear everything
  gl.enable(gl.DEPTH_TEST);           // Enable depth testing
  gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

  // Clear the canvas before we start drawing on it.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Create a perspective matrix, a special matrix that is
  // used to simulate the distortion of perspective in a camera.
  // Our field of view is 45 degrees, with a width/height
  // ratio that matches the display size of the canvas
  // and we only want to see objects between 0.1 units
  // and 100 units away from the camera.

  const fieldOfView = 45 * Math.PI / 180;   // in radians
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // note: glmatrix.js always has the first argument as the destination to receive the result.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  // Set the drawing position to the "identity" point, which is the center of the scene.
  const modelViewMatrix = mat4.create();

  // Now move the drawing position a bit to where we want to start drawing the square.
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [0.0, 0.0, -6.0]);  // amount to translate

  // move to center of the cube (0.5, 0.5, 0.5)
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [0.5, 0.5, 0.5]);  // amount to translate
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      squareRotation,   // amount to rotate in radians
      [0, 0, 1]);   // axis to rotate around
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      squareRotation*0.9,   // amount to rotate in radians
      [0, 1, 0]);   // axis to rotate around
  mat4.rotate(modelViewMatrix,    // destination matrix
      modelViewMatrix,  // matrix to rotate
      squareRotation*1.1,   // amount to rotate in radians
      [1, 0, 0]);   // axis to rotate around
  // go back to origine (0, 0, 0)
  mat4.translate(modelViewMatrix,     // destination matrix
      modelViewMatrix,     // matrix to translate
      [-0.5, -0.5, -0.5]);  // amount to translate

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
  
  draw_buffer(gl, buffers.trianglePosition, programInfo.attribLocations.vertexPosition, gl.FLOAT);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.trianglePosition.numItems);

  draw_buffer(gl, buffers.color, programInfo.attribLocations.vertexColor, gl.FLOAT);
  draw_buffer(gl, buffers.squarePosition, programInfo.attribLocations.vertexPosition, gl.FLOAT);
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffers.squarePosition.numItems);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.squareIndices);
  gl.drawElements(gl.TRIANGLES, buffers.squareIndices.numItems, gl.UNSIGNED_SHORT, 0);
}

function draw_buffer(gl, buffer, attribLocation, type) {
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