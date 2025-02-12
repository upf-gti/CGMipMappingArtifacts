// https://threejs.org/docs/index.html#api/en/materials/ShaderMaterial
// https://threejs.org/docs/#api/en/renderers/webgl/WebGLProgram -- cameraPosition matrices etc...
// https://webglfundamentals.org/webgl/lessons/webgl-shaders-and-glsl.html
// https://www.khronos.org/files/opengles_shading_language.pdf
// https://registry.khronos.org/OpenGL/specs/es/2.0/GLSL_ES_Specification_1.00.pdf // For WebGL




// Use VS plugin "glsl-literal" and add /* glsl */
export const myVertShader = /* glsl */ `

#define PI 3.141592653589793
precision lowp float;

uniform float u_time;
uniform mat4 u_cameraModelMatrix;
uniform vec3 u_cameraGridPosition;
uniform vec2 u_cameraViewportScale;

varying vec3 v_normal;
varying vec3 v_position;

void main() {
    // Buffer geometry
    // position
    // normal
    // uv

    // Built-in uniforms
    // modelMatrix = object.matrixWorld
    // projectionMatrix = camera.projectionMatrix
    // modelViewMatrix = camera.matrixWorldInverse * object.matrixWorld
    // viewMatrix = camera.matrixWorldInverse
    // cameraPosition = camera position in world space

    
    // Scale the vertices to fall inside the viewport
    vec3 scaledPosition = position;
    scaledPosition.x = position.x * u_cameraViewportScale.x;
    scaledPosition.y = position.y * u_cameraViewportScale.y;

    // Move vertices in front of the camera
    vec3 worldPosition = vec3(modelMatrix * vec4(scaledPosition, 1.0));

    // Project vertex in the XZ plane
    // Calculate intersection between plane and camera ray
    vec3 ray = normalize(worldPosition - u_cameraGridPosition);
    // Ray is not parallel to the horizon
    float t = -1.0;
    if (ray.y != 0.0)
        t = (0.0 - u_cameraGridPosition.y) / ray.y;

    // Intersection point
    vec3 intersectionPoint = u_cameraGridPosition + ray * t;

    // HACK -> if cameraForward is opposite from ray direction, move intersection point on the opposite side
    // TODO: this method assumes that the camera is close to the center 0,0,0
    // Extract forward vector from camera
    mat3 orientationMatrix = mat3(u_cameraModelMatrix);
    vec3 forwardCameraVector = -orientationMatrix[2];
    vec3 ray2 = intersectionPoint - u_cameraGridPosition;
    float dotResult = dot(forwardCameraVector, ray2);
    if (dotResult < 0.0)
        intersectionPoint = intersectionPoint * -1.0;


    float f = 2.0 * PI * u_time/1000.0 + intersectionPoint.x*10.0;
    intersectionPoint.y = intersectionPoint.y + 0.2 * sin(f);

    // Declare tangent and binormal
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);
    tangent.x = sin(f);
    tangent.y = cos(f);
    tangent = normalize(tangent);
    v_normal = normalize(cross(binormal, tangent));
    // Screen space position
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(intersectionPoint, 1.0); // Position on the XZ plane
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(posFrontCamera), 1.0); // Position in front of the camera
    intersectionPoint.y = 0.5;
    v_position = intersectionPoint;
    gl_Position = projectionMatrix * viewMatrix * vec4(intersectionPoint, 1.0);
    //gl_Position = projectionMatrix * viewMatrix * vec4(worldPosition, 1.0);
    //gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); // Default geometry
}
`




export const myFragShader = /* glsl */ `

precision lowp float;

// cameraPosition
// viewMatrix

varying vec3 v_normal;
varying vec3 v_position;


void main() {


    // Output color
    //gl_FragColor = vec4(((v_normal + 1.0) * 0.5), 0.7);


    int x = int(floor(v_position.x / 2.0));
    int y = int(floor(v_position.z / 2.0));
    int checker = (x + y) % 2;

    float alpha = 1.0;
    
    
    if (checker == 0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, alpha); // Red
    } else {
        gl_FragColor = vec4(0.0, 1.0, 0.0, alpha); // Green
    }

    //gl_FragColor = vec4(1.0, 1.0, 0.0, 0.7);
}
`