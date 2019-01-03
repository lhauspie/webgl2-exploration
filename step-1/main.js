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
}
