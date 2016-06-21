var CanvasChart = function () {
    var ctx,
        margin = { top: 40, left: 75, right: 0, bottom: 75 },
        chartHeight, chartWidth, yMax, xMax, data,
        maxYValue = 0,
        ratio = 0,
        pointRadius = 10,
        renderType = { lines: 'lines', points: 'points' },
        finalDataPoints = [],
        selectedDataPoint = null,
        timerID,
        overlayDiv,

        render = function (canvasID, dataObj) {
            data = dataObj;
            createOverlay();

            var canvas = document.getElementById(canvasID);
            chartHeight = canvas.getAttribute('height');
            chartWidth = canvas.getAttribute('width');
            canvas.addEventListener('mousemove', mouseMove, false);
            ctx = canvas.getContext('2d');

            xMax = chartWidth - (margin.left + margin.right);
            yMax = chartHeight - (margin.bottom + margin.top);

            maxYValue = getMaxDataYValue();
            ratio = yMax / maxYValue;
            if (data.renderTypes == undefined || data.renderTypes == null) {
                data.renderTypes = [renderType.lines];
            }
            renderParts();
        },

        renderParts = function () {
            renderBackground();
            renderText();
            renderLinesAndLabels(true);
            renderData();
        },

        renderBackground = function () {
            var lingrad = ctx.createLinearGradient(margin.left, margin.top, xMax - margin.right, yMax);
            lingrad.addColorStop(0, '#d4d4d4');
            lingrad.addColorStop(.2, '#fff');
            lingrad.addColorStop(.8, '#fff');
            lingrad.addColorStop(1, '#d4d4d4');
            ctx.fillStyle = lingrad;
            ctx.fillRect(margin.left, margin.top, xMax - margin.left, yMax - margin.top);
            ctx.fillStyle = 'black';
        },

        renderText = function () {
            var labelFont = (data.labelFont != null) ? data.labelFont : '20pt Arial';
            ctx.font = labelFont;
            ctx.textAlign = 'center';
            ctx.fillText(data.title, (chartWidth / 2), margin.top / 2);
            var txtSize = ctx.measureText(data.xLabel);
            ctx.fillText(data.xLabel, margin.left + (xMax / 2) - (txtSize.width / 2), yMax + (margin.bottom / 1.2));
            ctx.save();
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(data.yLabel, (yMax / 2) * -1, margin.left / 4);
            ctx.restore();
        },

        renderLinesAndLabels = function (shouldRenderText) {
            var yInc = yMax / data.dataPoints.length;
            var yPos = 0;
            var xInc = getXInc();
            var xPos = margin.left;

            for (var i = 0; i < data.dataPoints.length; i++) {
                yPos += (i == 0) ? margin.top : yInc;
                drawLine({ x: margin.left, y: yPos, x2: xMax, y2: yPos }, '#e8e8e8');

                if (shouldRenderText) {
                    ctx.font = (data.dataPointFont != null) ? data.dataPointFont : '10pt Calibri';
                    var txt = Math.round(maxYValue - ((i == 0) ? 0 : yPos / ratio));
                    var txtSize = ctx.measureText(txt);
                    ctx.fillText(txt, margin.left - ((txtSize.width >= 14) ? txtSize.width : 10) - 7, yPos + 4);
                    txt = data.dataPoints[i].x;
                    txtSize = ctx.measureText(txt);
                    ctx.fillText(txt, xPos, yMax + (margin.bottom / 3));
                    xPos += xInc;
                }
            }
        },

        renderData = function () {
            var xInc = getXInc(),
                prevX = 0,
                prevY = 0;
            for (var i = 0; i < data.dataPoints.length; i++) {
                var pt = data.dataPoints[i];
                var y = (maxYValue - pt.y) * ratio;
                if (y < margin.top) {
                    y = margin.top;
                }

                var x = (i * xInc) + margin.left;
                var dataPoint = { x: x, y: y, currX: margin.left, x2: prevX, y2: prevY, originalY: pt.y };
                finalDataPoints.push(dataPoint);

                prevX = x;
                prevY = y;
            }

            if (data.renderTypes.indexOf(renderType.lines) > -1) {
                drawLines();
            }

            if (data.renderTypes.indexOf(renderType.points) > -1) {
                drawPoints();
            }
        },

        drawPoints = function () {
            if (data.animatePoints) {
                animate();
            }
            else {
                for (var i = 0; i < finalDataPoints.length; i++) {
                    var pt = finalDataPoints[i];
                    drawCircle(pt.x, pt.y);
                }
            }
        },

        animate = function () {
            var speed = (data.animationSpeed == null) ? 20 : data.animationSpeed;
            timerID = requestAnimationFrame(animate);
            clear();
            drawLines();
            for (var i = 0; i < finalDataPoints.length; i++) {
                var pt = finalDataPoints[i];
                pt.currX += speed;
                if (pt.currX >= pt.x) {
                    pt.currX = pt.x;
                }
                drawCircle(pt.currX, pt.y);
                if (i == finalDataPoints.length - 1 && pt.currX == pt.x) {
                    cancelAnimationFrame(timerID);
                }
            }
        },

        clear = function () {
            ctx.clearRect(margin.left - pointRadius - 2, margin.top - pointRadius - 2, xMax, yMax - margin.bottom / 3);
            renderBackground();
            renderLinesAndLabels(false);
        }

        drawCircle = function (x, y, highlightColor) {
            var radgrad = ctx.createRadialGradient(x, y, pointRadius, x - 5, y - 5, 0);
            radgrad.addColorStop(0, (highlightColor == null) ? 'blue' : highlightColor);
            radgrad.addColorStop(.9, 'white');
            ctx.beginPath();
            ctx.fillStyle = radgrad;
            ctx.arc(x, y, pointRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'black';
            ctx.stroke();
            ctx.closePath();
        }

        drawLines = function () {
            for (var i = 0; i < finalDataPoints.length; i++) {
                var pt = finalDataPoints[i];
                if (pt.x2 > 0) {
                    drawLine(pt);
                }
            }
        },

        drawLine = function (pt, strokeStyle) {
            ctx.strokeStyle = (strokeStyle == null) ? 'black' : strokeStyle;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x2, pt.y2);
            ctx.lineTo(pt.x, pt.y);
            ctx.stroke();
            ctx.closePath();
        }

        getMaxDataYValue = function () {
            var maxY = 0;
            for (var i = 0; i < data.dataPoints.length; i++) {
                var y = data.dataPoints[i].y;
                if (y > maxY) {
                    maxY = y;
                }
            }
            return maxY;
        },

        getXInc = function () {
            return Math.round(xMax / data.dataPoints.length) - 1;
        },

        createOverlay = function () {
            overlayDiv = document.createElement('div');
            overlayDiv.style.display = 'none';
            overlayDiv.style.backgroundColor = '#efefef';
            overlayDiv.style.border = '1px solid black';
            overlayDiv.style.position = 'absolute';
            overlayDiv.style.padding = '5px';
            document.body.appendChild(overlayDiv);
        },

        showOverlay = function (pt) {
            overlayDiv.innerHTML = pt.originalY;
            overlayDiv.style.left = pt.x + 'px';
            overlayDiv.style.top = pt.y + 'px';
            overlayDiv.style.display = 'block';
        },

        clearCircle = function (x, y) {
            ctx.beginPath();
            ctx.fillStyle = 'white';
            ctx.arc(x, y, pointRadius + 1, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.closePath();
        },

        mouseMove = function (ev) {
            var x, y;
            if (ev.offsetX || ev.offsetY == 0) {
                x = ev.offsetX;
                y = ev.offsetY;
            }
            else if (ev.layerX || ev.layerY == 0) {
                x = ev.layerX - margin.left + (pointRadius * 2) + 5;
                y = ev.layerY - margin.top - 5;
            }

            if ((x > margin.left) && (y > margin.top)) {
                var radius = pointRadius + 4;
                for (var i = 0; i < finalDataPoints.length; i++) {
                    var pt = finalDataPoints[i];
                    var xMin = pt.x - radius;
                    var xMax = pt.x + radius;
                    var yMin = pt.y - radius;
                    var yMax = pt.y + radius;
                    if ((x >= xMin && x <= xMax) && (y >= yMin && y <= yMax)) {
                        clearCircle(pt.x, pt.y);
                        drawCircle(pt.x, pt.y, 'red');
                        selectedDataPoint = pt;
                        showOverlay(pt);
                        break;
                    }
                    else {
                        if (selectedDataPoint != null) {
                            overlayDiv.style.display = 'none';
                            clearCircle(selectedDataPoint.x, selectedDataPoint.y);
                            drawCircle(selectedDataPoint.x, selectedDataPoint.y);
                            selectedDataPoint = null;
                        }
                    }
                }
            }
        }

    //public members
    return {
        render: render,
        renderType: renderType
    };
};

(function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'o', 'ms'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());
