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

  // VERTEX SHADER
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vColor = aVertexColor;
    }
  `;

  // FRAGMENT SHADER
  const fsSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    varying lowp vec4 vColor;

    void main() {
      gl_FragColor = vColor;
    }
  `;

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

  drawScene(gl, programInfo, buffers);
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

function initBuffers(gl) {
  // Create a buffer for the square's positions.
  const squarePositionBuffer = gl.createBuffer();

  // Select the squarePositionBuffer as the one to apply buffer operations to from here out.
  gl.bindBuffer(gl.ARRAY_BUFFER, squarePositionBuffer);

  // Now create an array of positions for the square.
  const squareVertices = [
      0.25, 0.75,
      0.75, 0.75,
      0.25, 0.25,
      0.75, 0.25,
  ];

  // Now pass the list of positions into WebGL to build the shape.
  // We do this by creating a Float32Array from the JavaScript array,
  // then use it to fill the current buffer.
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(squareVertices),
                gl.STATIC_DRAW);
  squarePositionBuffer.itemSize=2;
  squarePositionBuffer.numItems=4;
  
  // ------------------------------------------------------------------------------
  const colorVertices = [
    0.0, 0.0, 0.0, 0.0, // TRANSPARENT BLACK
    0.0, 0.0, 1.0, 1.0, // BLUE
    0.0, 1.0, 0.0, 1.0, // GREEN
    1.0, 0.0, 0.0, 1.0, // RED
  ];
  const colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(colorVertices),
                gl.STATIC_DRAW);
  colorBuffer.itemSize=4;
  colorBuffer.numItems=4;

  // ------------------------------------------------------------------------------
  const triangleVertices = [
    -1.50, -1.50,
    -1.75, -1.25,
    -1.25, -1.25,
  ];
  const trianglePositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, trianglePositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
                new Float32Array(triangleVertices),
                gl.STATIC_DRAW);
  trianglePositionBuffer.itemSize=2;
  trianglePositionBuffer.numItems=3;

  // ------------------------------------------------------------------------------

  return {
    squarePosition: squarePositionBuffer,
    trianglePosition: trianglePositionBuffer,
    color: colorBuffer,
  };
}



function drawScene(gl, programInfo, buffers) {
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
                 [-0.0, 0.0, -6.0]);  // amount to translate

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

  draw_buffer(gl, programInfo, buffers.color, programInfo.attribLocations.vertexColor);
  draw_buffer(gl, programInfo, buffers.squarePosition, programInfo.attribLocations.vertexPosition);
  draw_buffer(gl, programInfo, buffers.trianglePosition, programInfo.attribLocations.vertexPosition);
}

function draw_buffer(gl, programInfo, buffer, attribLocation) {
    // Tell WebGL how to pull out the positions from the position
    // buffer into the vertexPosition attribute.
    const type = gl.FLOAT;    // the data in the buffer is 32bit floats
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
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, buffer.numItems);
}