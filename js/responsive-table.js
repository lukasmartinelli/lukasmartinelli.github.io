(function(){
    var tables = document.querySelectorAll("table");
    var addDataAttributes = function(table) {
        var headertext = [],
        headers = table.querySelectorAll("table th"),
        tablerows = table.querySelectorAll("table th"),
        tablebody = table.querySelector("table tbody");

        for(var i = 0; i < headers.length; i++) {
            var current = headers[i];
            headertext.push(current.textContent.replace(/\r?\n|\r/,""));
        }
        for (var i = 0, row; row = tablebody.rows[i]; i++) {
            for (var j = 0, col; col = row.cells[j]; j++) {
                col.setAttribute("data-th", headertext[j]);
            }
        }
    };

    for (var i = 0; i < tables.length; i++) {
        addDataAttributes(tables[i]);
    }
})();
