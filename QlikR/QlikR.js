var socketio_port = 33344;


require.config({
        paths: {
            socketio: 'http://localhost:'+socketio_port+'/socket.io/socket.io'
        }
});

define(["jquery", "text!./css/qlikR.css", "qlik", "socketio"], function($, cssContent, qlik, io) {
    $("<style>").html(cssContent).appendTo("head");
    return {
        initialProperties: {
            version: 1.0,
            qHyperCubeDef: {
                qDimensions: [],
                qMeasures: [],
                qInitialDataFetch: [{
                    qWidth: 10,
                    qHeight: 10000
                }],
                // qTable: [{
                //     qTargetTableName: "WhatIf"
                // }],
                qSocket: [{
                    qSocketIOPort: "33344"
                }]
                // , 
                // qWebService: [{
                //     qWebServiceUrl: "https://win-8ebv7me9ruc:12334/WritebackSenseDesktop"
                // }]
            }
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                dimensions: {
                    uses: "dimensions",
                    min: 0
                },
                measures: {
                    uses: "measures",
                    min: 0
                },
                sorting: {
                    uses: "sorting"
                },
                settings: {
                    uses: "settings",
                    items: {
                        initFetchRows: {
                            ref: "qHyperCubeDef.qInitialDataFetch.0.qHeight",
                            label: "Initial fetch rows",
                            type: "number",
                            defaultValue: 1000
                        },
                        // ,
                        // webService: {
                        //     ref: "qHyperCubeDef.qWebService.0.qWebServiceUrl",
                        //     label: "Web Service Url",
                        //     type: "string",
                        //     defaultValue: "https://win-8ebv7me9ruc:12334/WritebackSenseDesktop"
                        // },
                        socketService: {  
                            ref: "qHyperCubeDef.qSocket.0.qSocketIOPort",
                            label: "Socket.IO Port",
                            type: "string",
                            defaultValue: "33344"
                        }
                        // ,  //This should be for sense server version
                        // tableName: {
                        //     ref: "qHyperCubeDef.qTable.0.qTargetTableName",
                        //     label: "Target Table Name",
                        //     type: "string"
                        // }
                    }
                }
            }
        },
        snapshot: {
            canTakeSnapshot: true
        },
        resize: function() {
        },
        paint: function($element, layout) {
        	console.log(qlik)
            var _this = this,
            self = this,
            lastrow = 0,
            morebutton = false,
            QVDataTable = {},
            _layout = layout;

            var qData = layout.qHyperCube.qDataPages[0];
		 	var qMatrix = qData.qMatrix;
                //webServiceUrl = _layout.qHyperCube.qWebService[0].qWebServiceUrl,
                //socketServiceUrl = _layout.qHyperCube.qSocket[0].qSocketServiceUrl; //"wss://WIN-KAG9MEG77E6:12345";
            var rowcount=_this.backendApi.cacheCube.cube.pages[0].qMatrix.length;
            var html = "<div id='notifybar' align='center' style='padding: 5px 5px 5px 5px;' class='notifystatus'><div id='testnotify'></div></div><div border='1px'><div class='row fixed-table'><div class='table-content' border='2px'><table width='400' class='table table-striped table-fixed-header table-bordered table-responsive table-hover'><thead><tr>";
            var app = qlik.currApp();
            var appNameRaw = app.id;
            var appNameSplit = appNameRaw.split("\\");
            var appNameSplitLast = appNameSplit.length-1;
            var appName = appNameSplit[appNameSplitLast]
            console.log(appName)
            html += "<th width='100px'><a href='#' id='selectall'>&nbsp;</a></th>"
                //render titles
            $.each(this.backendApi.getDimensionInfos(), function(key, value) {
                html += "<th>" + value.qFallbackTitle + "</th>";
            });
            $.each(this.backendApi.getMeasureInfos(), function(key, value) {
                html += "<th>" + value.qFallbackTitle + "</th>";
            });
            html += "</tr></thead><tbody id='tbody'></div></div>";

			var socket = io.connect('http://localhost:'+socketio_port);
            
             var socketstatus;
             if (socket) {
                socketstatus = 'Connected'
             } else {
                socketstatus = 'Not Connected'
             }

            socket.on('connect', function(err) {
                console.log('connected to socket.io')
                if (err) {
                    console.log(err);
                } else {
                	
                }

            });

            socket.on('CalcResponse', function(data) {
            	console.log(JSON.parse(data)[0]);
            	var calcresp=JSON.parse(data)[0];
            	$("#notifybar")[0].innerText='Std Deviation: '+calcresp;
		    });


            function isEven(n) {
                n = Number(n);
                return n === 0 || !!(n && !(n % 2));
            }

            function isOdd(n) {
                return isEven(Number(n) + 1);
            }

			//render data
            this.backendApi.eachDataRow(function(rownum, row) {
                lastrow = rownum;
                if (isEven(rownum) === true) {
                    html += "<tr class='bodyrows' id='row" + rownum + "' style='background: #F0F0F0'>";
                } else {
                    html += "<tr class='bodyrows' id='row" + rownum + "' style='background: #FFFFFF'>";
                }

                html += "<td width='100px'  align='center'><input type='checkbox' id='chk" + rownum + "' class='ChkBox' data-rownum=" + rownum + " name='chkbox' value=1></td>";

                $.each(row, function(key, cell) {
                    if (cell.qIsOtherCell) {
                        cell.qText = self.backendApi.getDimensionInfos()[key].othersLabel;
                    }
                    html += "<td id='cell" + rownum + key + "' class='CellText' data-cellnum='" + rownum + key + "' data-rownum=" + rownum + "><div >" + cell.qText + "</div></td>";
                    var cellnum = $("#cell" + rownum + key);
                });
                html += '</tr>';
            });
            html += "</tbody></table>";

            //add 'more...' button
            if (this.backendApi.getRowCount() > lastrow + 1) {
                html += "<button id='more' style='width:100%'>More...</button>";
                morebutton = true;
            }

            html += "</div><div align='center'><br><button id='submitws' style='width=100%;' class='qirby-button'>Submit Checked To R</button>";
            html += "<br><br><div id='statusdiv'></div></div>";

            //function to update the cell.  I put it into a function because we need to use it when removing the input box also.
            function updateCell(celltext, input, el) {
                var attribute = celltext.attr("data-rownum");
                var chkbx = $("#chk" + attribute)
                chkbx.attr('checked', 'checked');
                el.firstChild.innerText = input[0].value.replace(/(\r\n|\n|\r)/gm, "");
                input.remove();
                celltext.css('background-color', 'rgb(255,255,153)');
                celltext.append($(el.firstChild.innerText));
                var clicks = $(el).data('clicks');
                $(el).data("clicks", !clicks);
            }
          
            $element.html(html);
            $(".ChkBox").attr('checked', 'checked')

            $element.find(".CellText").on("qv-activate", function() {
                //attach click data to this DOM element to track on and off state of cell 
                var clicks = $(this).data('clicks');
                var cellattribute = $(this).attr("data-cellnum");
                //if the cell has text in it, store the value on the cell so we can use it later if the user doesn't change the input
                if ($(this).text()) {
                    $(this).data("textVal", $(this).text());
                }

                var celltext = $("#cell" + cellattribute);
                var el = this;
                //if this isn't the first click....
                if (clicks) {
                    //you're getting rid of the input box, so find out what the value should be
                    var cellVal = $(this).data("textVal");
                    var cellattribute = $(this).attr("data-cellnum");
                    var input = $("#input" + cellattribute);
                    //if the values aren't the same we need to check the box, etc.
                    if (input[0].value != cellVal) {
                        $(this).data("textVal", input[0].value);
                        updateCell(celltext, input, el);
                    } else {
                        el.firstChild.innerText = $(this).data("textVal");
                        input.remove();
                    }

                } else {
                    //there's no input box, so let's make one and attach the event
                    celltext.append("<input id='input" + cellattribute + "' value='" + el.firstChild.innerText + "'>");
                    el.firstChild.innerText = "";
                    var input = $("#input" + cellattribute)

                    input.on("keypress", function(event) {
                        if (event.keyCode == 13) {
                            updateCell(celltext, input, el);
                        }

                    });
                    input.width("98%")
                    input.select();
                    input.focus();
                }
                $(this).data("clicks", !clicks);


            });




            if (morebutton) {
                var requestPage = [{
                    qTop: lastrow + 1,
                    qLeft: 0,
                    qWidth: 10, //should be # of columns
                    qHeight: Math.min(rowcount, this.backendApi.getRowCount() - lastrow)
                }];
                $element.find("#more").on("qv-activate", function() {
                    self.backendApi.getData(requestPage).then(function(dataPages) {
                        self.paint($element, layout);
                    });
                });

            }

            $element.find("#selectall").on("click", function() {
                $(".ChkBox").attr('checked', 'checked')

            });


            $element.find("#submitws").on("qv-activate", function() {
                submitButton_Click();
            });


            function submitButton_Click() {
            	$("#notifybar")[0].innerText='Data Submitted'
                var resultsFromData = getResults();
                resultsFromData.dataframeName='New_Data_Frame';
                resultsFromData.appId=appName;//qlik.currApp();
                var stringJSON = JSON.stringify(resultsFromData);
                console.log(stringJSON);
                socket.emit('PushToR',stringJSON)
                //console.log(qData)

                // for (var i in QVDataTable) {
                // 	console.log(i)
                // }
            }

            function getResults() {

                $.each(_this.backendApi.getDimensionInfos(), function(key, value) {
                    var header = {};
                    var headername = value.qFallbackTitle;
                    QVDataTable[headername] = []

                    header.Name = value.qFallbackTitle;
                });
                $.each(_this.backendApi.getMeasureInfos(), function(key, value) {
                    var header = {};
                    var headername = value.qFallbackTitle;
                    QVDataTable[headername] = []
                });

                var headerlength = _this.backendApi.getDimensionInfos().length + _this.backendApi.getMeasureInfos().length + 1;

                var rowcount=_this.backendApi.cacheCube.cube.pages[0].qMatrix.length;

                _this.backendApi.eachDataRow(function(rownum, row) {
                    var chk = $("#chk" + rownum);

                    if (chk[0].checked === true) {

                        var rowdata = $("#row" + rownum+" td");

                        for (var c = 1; c < headerlength ; c++) {
                            var x = c-1;
                            var keyname=Object.keys(QVDataTable)[x]

                            if (row[x].qState === "O") {
                                QVDataTable[keyname].push(rowdata[c].innerText.replace("\n",""))
                            } else {
                                QVDataTable[keyname].push(parseInt(rowdata[c].innerText.replace("\n","")))
                            }

                        }
                    }
                });

                return QVDataTable;

            }

        }
    };
});