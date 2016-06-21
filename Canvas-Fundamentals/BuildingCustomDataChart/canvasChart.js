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

        createOverlay = function () {

        },

        mouseMove = function (evt) {

        }

    //public members
    return {
        render: render,
        renderType: renderType
    };
};