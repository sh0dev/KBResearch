// 주간전략 코스피차트
function initKospiChart(){  
    var cosChartTitle = $("#cosChartTitle").val();
    var cosChartData1 = Number($("#cosChartData1").val());
    var cosChartData2 = Number($("#cosChartData2").val());
    var title = cosChartTitle;
    var startDate = moment().date(1).format('YYYYMMDD');
    var baseDate = moment().endOf('month').format('YYYYMMDD');
    var bandHigh = cosChartData1;
    var bandLow = cosChartData2;

    return getChartData({
        dataStrtDt: baseDate,
        dyWkMmMTClsf: "D",
        inqClsf: "2",
        isCd: 'KGG01P',
        mktClsf: '5',
        mnTkIndx: "",
        range: 12,
        rqsDataKey: "300"
    }).then(function(res){
        if(res.errorCode) return;
        
        var lineData = [];
        var highData = [];
        var lowData = [];
        var dotData = [];
            
        var arr = res.response.record1;
        for(var i=arr.length; i--;) {
            var data = arr[i];
            var date = moment(data.dt, "YYYYMMDD");
            var close = Number(data.clsPrc) / 100;
            
            if(date.isBefore(moment(baseDate,"YYYYMM").subtract(1,'years')) || date.isAfter(moment(baseDate,"YYYYMMDD"))) continue;
            
            lineData.push([Number(date), Number(close)]);
        }

        if(dotData.length == 0){
            dotData.push(lineData[lineData.length-1]);
        }

        var tempDate = lineData[0][0];
        for(var i=70;i--;) {
            tempDate -= (24*60*60*1000);
        }

        tempDate = moment(startDate, "YYYYMMDD")
        tempDate += (9*60*60*1000);

        for(var i=90;i--;) {
            highData.push({ x: tempDate, y: bandHigh });
            lowData.push({ x: tempDate, y: bandLow });
            tempDate += (24*60*60*1000);
        }

        Highcharts.setOptions({
            lang: {
                thousandsSep:',' 
            },
            time: {
                timezoneOffset: -(9 * 60)
            },
        })

        new Highcharts.chart({
          chart: {
            renderTo : $("#kospiChart")[0],
            width: 355,
            height: 350,
            panning: false,
            marginTop: 70,
            marginLeft: 0,
            spacing: [5,5,5,5],
            events: {
                load: function() {
                    var yAxis = this.yAxis[0];
                    var yTickPositions = yAxis.tickPositions;
                    var maxTick = yTickPositions[yTickPositions.length-1];
                    var minTick = yTickPositions[0];

                    // 실제 픽셀 위치 계산
                    var highPx = yAxis.toPixels(bandHigh);
                    var lowPx  = yAxis.toPixels(bandLow);
                    var gap = Math.abs(highPx - lowPx);

                    // 라벨 높이 기준 (px)
                    var labelHeight = 26;

                    // 기본 offset
                    var highY = -10;
                    var lowY  = 36;

                    // 겹치는 경우 동적 보정
                    if (gap < labelHeight * 2) {
                        highY = -(labelHeight + 4);
                        lowY  =  (labelHeight + 4);
                    }

                    // KB예상치 박스
                    var width = (this.series[3].data[this.series[3].data.length-1].plotX - this.series[3].data[0].plotX + 2) + 'px';
                    var height = '43px';

                    // KB예상치 박스 annotation
                    this.addAnnotation({
                        zIndex: 2,
                        draggable: '',
                        shapes: [{
                            points: [
                                { x: highData[0].x, y: maxTick, xAxis: 0, yAxis: 0 },
                                { x: highData[0].x, y: minTick, xAxis: 0, yAxis: 0 },
                                { x: highData[highData.length-1].x, y: minTick, xAxis: 0, yAxis: 0 },
                                { x: highData[highData.length-1].x, y: maxTick, xAxis: 0, yAxis: 0 },
                            ],
                            type: 'path',
                            fill: 'none',
                            stroke: '#ffcc00',
                            strokeWidth: 2
                        }],
                        labels: [{
                            useHTML: true,
                            align: 'left',
                            overflow: 'allow',
                            allowOverlap: true,
                            borderRadius: 3,
                            borderWidth: 0,
                            padding: 0,
                            crop: false,
                            backgroundColor: '#ffcc00',
                            shape: 'rect',
                            style: {
                                fontFamily: "\"KBFGTextM\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
                                fontSize: "13px",
                                color: '#666',
                            },
                            point: { x: highData[0].x, y: maxTick, xAxis: 0, yAxis: 0 },
                            text: '<div style="width:'+width+';height:'+height+';text-align:center;margin-top:9px;">KB<br/>예상치<div>',
                            y: -1,
                            x: -1
                        }]
                    }, true);

                    // 밴드 상/하단 값 라벨 (동적 y offset 적용)
                    this.addAnnotation({
                        zIndex: 3,
                        draggable: '',
                        labelOptions: {
                            useHTML: true,
                            overflow: 'allow',
                            allowOverlap: true,
                            borderRadius: 5,
                            borderWidth: 0,
                            padding: 0,
                            style: {
                                fontFamily: "\"KBFGTextL\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
                                fontSize: "13px"
                            }
                        },
                        labels: [{
                            backgroundColor: '#d50057',
                            point: {
                                x: highData[Math.ceil(highData.length/2)-1].x,
                                y: bandHigh,
                                xAxis: 0,
                                yAxis: 0
                            },
                            text: '<div style="width:54px;height:20px;text-align:center;margin-top:5px;">'+String(bandHigh).commify()+'</div>',
                            y: highY
                        },{
                            backgroundColor: '#0047ba',
                            point: {
                                x: lowData[Math.ceil(lowData.length/2)-1].x,
                                y: bandLow,
                                xAxis: 0,
                                yAxis: 0
                            },
                            text: '<div style="width:54px;height:20px;text-align:center;margin-top:5px;">'+String(bandLow).commify()+'</div>',
                            y: lowY
                        }]
                    }, true);

                    // clipPath 제거 (기존 버그 우회)
                    var defs = this.container.getElementsByTagName('defs')[0];
                    var clipPaths = defs.getElementsByTagName('clipPath');
                    defs.removeChild(clipPaths[clipPaths.length-1]);
                    defs.removeChild(clipPaths[clipPaths.length-1]);
                    defs.removeChild(clipPaths[clipPaths.length-1]);
                }
            }
          },
          credits: { enabled:false },
          legend: { enabled:false },  
          exporting: { enabled:false },
          tooltip: {
                zIndex: 100,
                shared: true,
                split: true,
                followPointer:true,
                borderColor: null,
                backgroundColor: null,
                shadow: false,
                borderRadius: 100,
                borderWidth: 0,
                useHTML: true,
                padding: 0,
                style: {
                      fontFamily: "'KB금융 본문체 Medium','KBFGTextM',sans-serif",
                      fontSize: "13px",
                      color : '#fff',
                    },
                formatter: function () {
                    return [''].concat(
                        this.points.map(function (point) {
                            var name = null;
                            var format = '%y.%m.%d';
                            name = Highcharts.time.dateFormat(format, point.x); 
                            if(!name) name = point.series.name + ' ' + point.key;
                            var decimals = point.series.userOptions.valueDecimals ? Number(point.series.userOptions.valueDecimals) : undefined;
                            var value = Highcharts.numberFormat(point.y, decimals);
                            var backgroundColor = Highcharts.Color(point.color).setOpacity(1).get();
                            return '<div style="background-color:' + backgroundColor + '" class="kb-chart-tooltip">' + name + '  ' + value + '</div>'
                        })
                    )
                }
            },
          title: {
            text: title,
            align: 'left',
            useHTML: true,
            style: {
              fontFamily: "\"KBFGTextM\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
              fontSize: "13px",
              color: "#FFF",
              background: "#666",
              padding: "5px 15px",
              borderRadius: "20px"
            },
            x:-5
          },
          xAxis: {
            type: 'datetime',
            title: { text: null },
            tickWidth: 0,
            lineWidth: 2,
            gridLineWidth: 1,
            gridLineDashStyle: 'dot',
            showFirstLabel: false,
            lineColor: "#ccc",
            tickPositions:[
                Number(moment(baseDate,"YYYYMM").subtract(12,'months')),
                Number(moment(baseDate,"YYYYMM").subtract(9,'months')),
                Number(moment(baseDate,"YYYYMM").subtract(6,'months')),
                Number(moment(baseDate,"YYYYMM").subtract(3,'months')),
                Number(moment(baseDate,"YYYYMM"))
            ],
            ordinal: false,
            crosshair: true,
            labels: {
              formatter:function(){
                return moment(this.value).format('YY-MM')
              },
              style: {
                "fontFamily": "\"KBFGTextL\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
                "fontSize":"12px"
              }
            },
            dateTimeLabelFormats: {
              millisecond: '%H:%M:%S.%L',
              second: '%H:%M:%S',
              minute: '%H:%M',
              hour: '%H:%M',
              day: '%m-%d',
              week: '%m-%d',
              month: '%y-%m',
              year: '%Y'
            }
          },
          yAxis: {
            offset: -50,
            showFirstLabel: false,
            tickAmount: 6,
            minTickInterval : 200,
            title: {
              align: 'high',
              text: '(pt)',
              offset: 0,
              rotation: 0,
              y: -15,
              x: -26,
              style: {
                "fontFamily": "\"KBFGTextL\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
                "fontSize":"12px"
              }
            },
            labels: {
              style: {
                "fontFamily": "\"KBFGTextL\",\"KB금융 본문체\",Arial,Helvetica,sans-serif",
                "fontSize":"12px"
              },
              formatter: function(){
                return String(this.value).commify()
              },
              y: 20,
            }
          },
          plotOptions: {
            area : {
                enableMouseTracking:false,
                dashStyle: 'shortdot',
                lineWidth: 2,
                color: 'rgb(213,0,87)',
                fillColor:{
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [[0, 'rgba(213,0,87,0.1)'], [1, 'rgba(255,255,255,0.1)']]
                },
                negativeColor: 'rgb(0,71,186)',
                negativeFillColor: {
                    linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                    stops: [[0, 'rgba(255,255,255,0.1)'], [1, 'rgba(0,71,186,0.1)']]
                }
            }
          },
          series: [{
            name: 'KOSPI',
            type: 'spline',
            data: lineData,
            lineWidth: 1.5,
            color: "rgb(213,0,87)",
            marker: {
              enabled: false
            },
            states: {
                hover: {
                    marker: { enabled: false }
                }
            }
          },{
            type: 'spline',
            enableMouseTracking:false,
            data: dotData,
            color: "rgb(213,0,87)",
            marker: {
              enabled: true,
              symbol: 'circle',
              radius: 5
            }
          },{
            type: 'area',
            data: highData,
            threshold: bandLow
          },{
            type: 'area',
            data: lowData,
            dashStyle: 'shortdot',
            threshold: bandHigh
          }]
        });
    })
}
// ============================================================================================== //CHART
