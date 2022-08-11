const canvas = document.querySelector("canvas");
const CTX = canvas.getContext("2d");

const cellBoundaryPath =
  "M0 80.954C0 51.64 21.5 14.865 53 7.5 87.452-.555 118.061 1 153.226 1 198.529 1 260.839 5.124 312 9.5c38.609 3.302 68 40.941 68 75.494 0 39.247-32.985 78.645-78.5 74.506-44.469-4.043-89.804-7.763-129.887-7.763-33.017 0-55.544.952-87.113 4.263C37.391 160.941 0 125.911 0 80.954z";
const objectPath =
  "m8.8248 6.17225c0 .62539-.02729.83998-.27251 1.38756-.35155.78504-.62273.72377-.901 1.11465-.52174.36734-.85301.87696-1.50555 1.05263-.49354.13286-.75763.27291-1.29989.27291-.66208 0-1.08113-.20217-1.66686-.39694-.5283-.17567-1.23231-1.14896-1.66686-1.45492-.733221-.51624-.989024-.47315-1.340578-1.25818-.2452152-.54758-.155553-.66648-.155553-1.29187 0-.75543.339213-1.13504.689588-1.77034.224392-.40686.467443-1.34286.806543-1.67464.44074-.43122.32356-.94658.91408-1.211819.72729-.326667 2.19455-.94128808 3.06488-.94128808.97938 0 1.14482.75931608 1.9357 1.16641708.55011.28317 1.46876.55488 1.87338.98669.54745.58425.51118 1.5735.69634 2.3445.07779.32399-1.17171 1.32999-1.17171 1.67464z";
const cellBoundaryPathObject = new Path2D(cellBoundaryPath);
let objectLocation = { x: 50, y: 50 };
let objectHeading = 15;
let objectSpeed = 1.2;
let objectSize = 10;
let objectRotationAngle = 0;

// helpers
const nextPositionAlongHeading = (position, speed, headingInDeg) => ({
  x: position.x + speed * Math.cos(headingInDeg * (Math.PI / 180)),
  y: position.y + speed * Math.sin(headingInDeg * (Math.PI / 180))
});

const randomBetween = (min, max) => Math.random() * (max - min) + min;

// test all corners of a square against a boundary
const isShapeInPath = (path, location, size) =>
  CTX.isPointInPath(path, location.x, location.y) &&
  CTX.isPointInPath(path, location.x + size, location.y) &&
  CTX.isPointInPath(path, location.x + size, location.y + size) &&
  CTX.isPointInPath(path, location.x, location.y + size);

// recurse until new location inside boundary is found
const getNewLocationInBoundary = () => {
  // add jitter to movement
  objectHeading = objectHeading + randomBetween(-20, 20);

  // test new locations
  return new Promise((resolve) => {
    const prospectiveNewLocation = nextPositionAlongHeading(
      objectLocation,
      objectSpeed,
      objectHeading
    );

    if (
      !isShapeInPath(cellBoundaryPathObject, prospectiveNewLocation, objectSize)
    ) {
      objectHeading = randomBetween(1, 360);
      return resolve(getNewLocationInBoundary());
    } else {
      return resolve(prospectiveNewLocation);
    }
  });
};

// animation cycle
const drawFrame = () => {
  // fill in background
  CTX.fillStyle = "black";
  CTX.fillRect(0, 0, canvas.width, canvas.height);

  // fill in cell shape
  const x = 182,
    y = 78,
    // Radii of the inner glow
    innerRadius = 2,
    outerRadius = 220;
  const gradient = CTX.createRadialGradient(
    x,
    y,
    innerRadius,
    x,
    y,
    outerRadius
  );
  gradient.addColorStop(0, "#6F559E");
  gradient.addColorStop(1, "#7584AD");
  CTX.fillStyle = gradient;
  CTX.fill(cellBoundaryPathObject);

  // fill in dot
  getNewLocationInBoundary().then(({ x, y }) => {
    // fill in dot shape
    const shapeCenter = { x: x + objectSize / 2, y: y + objectSize / 2 };
    const rotationAmount = (Math.PI / 180) * objectRotationAngle;

    CTX.fillStyle = "#FFFFFF";
    CTX.save();
    CTX.translate(shapeCenter.x, shapeCenter.y);
    CTX.rotate(rotationAmount);
    CTX.translate(-objectSize / 2, -objectSize / 2);
    CTX.fill(new Path2D(objectPath));
    CTX.restore();

    // update props
    objectRotationAngle = objectRotationAngle + 2;
    objectLocation = { x, y };
  });

  window.requestAnimationFrame(drawFrame);
};

window.requestAnimationFrame(drawFrame);
