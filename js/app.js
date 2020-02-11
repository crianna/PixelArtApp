// store the selection colors in an array
var colorArr = [
    '#fe001a',
    '#85007d',
    '#63ff31',
    '#0a00f9',
    '#feff37',
    '#ff9b29',
    '#ffffff',
    '#000000',
    '#ffe1bf',
    '#ffb7c4',
    '#d15e27'
];

var currentColor;
var gridSize = 0;

// populate color palette row
var $colorsRow = $('.colors-row');
var paletteColorTemplate = '<div class="col color-col"><div class="palette-color"></div></div>';
colorArr.forEach(function(color) {
    var $color = $(paletteColorTemplate);
    $color.find('.palette-color').css('background-color', color);
    $color.click(function() {
        currentColor = color;
        $color.addClass('selected');
        $color.siblings().removeClass('selected');
    });
    $colorsRow.append($color);
});


var isMouseDown = false;
var useFill = false;
//set color on the selected square or its neighbours
function setColor($node, color) {
    $($node).css("background-color", color);
    $($node).attr("data-color", color);
}

//flil in neighboring pixels whose color value corresponds
function fillFrom($node, cellIndex, rowIndex, oldColor) {

    setColor($node, currentColor);
    var $table = $('#art-table');
    // up neighbors
    if (rowIndex - 1 >= 0) {
        var td_up = $table.find('tr').eq(rowIndex - 1).find('td').eq(cellIndex);
        if (td_up.attr('data-color') == oldColor) {
            fillFrom(td_up, cellIndex, rowIndex - 1, oldColor);
        }

    }
    // up left neighbors
    if ((rowIndex - 1 && cellIndex - 1) >= 0) {
        var td_left_to_test = $table.find('tr').eq(rowIndex).find('td').eq(cellIndex - 1);
        var td_up_to_test = $table.find('tr').eq(rowIndex - 1).find('td').eq(cellIndex);
        var is_left_ok = td_left_to_test.attr('data-color') == (oldColor || currentColor);
        var is_up_ok = td_up_to_test.attr('data-color') == (oldColor || currentColor);

        if (is_left_ok && is_up_ok) {
            var td_up_left = $table.find('tr').eq(rowIndex - 1).find('td').eq(cellIndex - 1);
            if (td_up_left.attr('data-color') == oldColor) {
                fillFrom(td_up_left, cellIndex - 1, rowIndex - 1, oldColor);
            }
        }

    }
    // up right neighbors
    if ((rowIndex + 1 && cellIndex + 1) < gridSize) {

        var td_right_to_test = $table.find('tr').eq(rowIndex).find('td').eq(cellIndex + 1);
        var td_up_to_test_2 = $table.find('tr').eq(rowIndex - 1).find('td').eq(cellIndex);
        var is_left_ok = td_right_to_test.attr('data-color') == (oldColor || currentColor);
        var is_up_ok = td_up_to_test_2.attr('data-color') == (oldColor || currentColor);

        if (is_left_ok && is_up_ok) {

            var td_up_right = $table.find('tr').eq(rowIndex - 1).find('td').eq(cellIndex + 1);
            if (td_up_right.attr('data-color') == oldColor) {
                fillFrom(td_up_right, cellIndex + 1, rowIndex - 1, oldColor);
            }
        }

    }
    // left neighbors
    if (cellIndex - 1 >= 0) {
        var td_left = $table.find('tr').eq(rowIndex).find('td').eq(cellIndex - 1);
        if (td_left.attr('data-color') == oldColor) {
            fillFrom(td_left, cellIndex - 1, rowIndex, oldColor);
        }
    }
    // right neighbors
    if (cellIndex + 1 < gridSize) {
        var td_right = $table.find('tr').eq(rowIndex).find('td').eq(cellIndex + 1);
        if (td_right.attr('data-color') == oldColor) {
            fillFrom(td_right, cellIndex + 1, rowIndex, oldColor);
        }
    }
    // bottom neighbors
    if (true) {
        var td_bottom = $table.find('tr').eq(rowIndex + 1).find('td').eq(cellIndex);
        if (td_bottom.attr('data-color') == oldColor) {
            fillFrom(td_bottom, cellIndex, rowIndex + 1, oldColor);
        }

    }
}

//create grid according to the size selected by user
function generateDrawingTable(size) {

    $('#art-table tbody').empty();

    for (var i = 0; i < size; i++) {
        var $tr = $('<tr/>');
        for (var j = 0; j < size; j++) {
            var $td = $('<td/>');
            $td.css('height', (1 / size) * 384 + 'px');
            setColor($td, '#ffffff');

            $tr.append($td);

            $td.on('mouseover', function(e) {
                if (isMouseDown) {
                    setColor($(this), currentColor);
                }

            });

            $td.on('mousedown', function(e) {

                var $td = $(this);

                //if fill button is clicked prevent mouse down draw
                if (useFill) {
                    fillFrom($td, $td[0].cellIndex, $td.parent()[0].rowIndex, $td.attr('data-color'));
                    return;
                }

                setColor($(this), currentColor);

                isMouseDown = true;
            });


            $td.on('mouseup', function(e) {
                isMouseDown = false;
            });
        }

        $('#art-table tbody').append($tr);

    }

}

//dropDown selection
$('.drop-down-grid').change(function() {
    gridSize = $(this).val();
    generateDrawingTable(gridSize);
    setTimeout(showBtn, 1000);

});
//show Export image button
function showBtn() {
    $('#btnContainer').removeClass('d-none')
}

//export grid to image
$('#exportTd').click(function() {
    $('#art-table').addClass('no-border');
    html2canvas($('#art-table')[0]).then(function(canvas) {
        canvas.toBlob(function(blob) {
            $('#art-table').removeClass('no-border');
            window.saveAs(blob, 'pixel-art.png');
        })
    });
})

//fill button
$('#fill').click(function() {
    $(this).toggleClass('btn-primary');
    useFill = !useFill;
});