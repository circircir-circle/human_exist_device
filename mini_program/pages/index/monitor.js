import * as echarts from '../../components/ec-canvas/echarts';

const app = getApp()
let {MoveData, MoveTh, SilentData, SilentTh} = getApp().globalData;
var MoveLineChart = null
var SilentLineChart = null
var SumLineChart = null
var SumData = []
var SumCategories = []
var sum_x = 0
var LD2410_Sim_Data = new ArrayBuffer(18)
var LD2410_Sim_Data_uint8view = new Uint8Array(LD2410_Sim_Data)
var symbolSize = 30
let that = null

function BLEWriteLD2410_Th() {
  console.log("拼接两个 array 到一个 buffer")
  let tt = MoveTh.concat(SilentTh)
  let ttu8 = new Uint8Array(tt)
  console.log(ttu8.buffer)
  wx.writeBLECharacteristicValue({
    deviceId:app.globalData.deviceId,
    serviceId:app.globalData.SERVICE_UUID_LD2410,
    characteristicId:app.globalData.CHARACTERISTIC_UUID_LD2410_Th,
    value: ttu8.buffer,
    fail(res) {
      console.error('writeBLECharacteristicValue', res)
    }
  })
}

function onMovePointDragging(dataIndex, pos) {
  let t = MoveLineChart.convertFromPixel('grid', pos);
  MoveTh[dataIndex] = t[1]
  // Update data
  MoveLineChart.setOption({
    series: [
      {
        id: 'b',
        data: MoveTh
      }
    ]
  });
}

function onSilentPointDragging(dataIndex, pos) {
  let t = SilentLineChart.convertFromPixel('grid', pos);
  SilentTh[dataIndex] = t[1]
  // Update data
  SilentLineChart.setOption({
    series: [
      {
        id: 'b',
        data: SilentTh
      }
    ]
  });
}

function getSilentLineDragOption() {    
  return {
    // 声明一个 graphic component，里面有若干个 type 为 'circle' 的 graphic elements。
    // 这里使用了 echarts.util.map 这个帮助方法，其行为和 Array.prototype.map 一样，但是兼容 es5 以下的环境。
    // 用 map 方法遍历 data 的每项，为每项生成一个圆点。
    graphic: echarts.util.map(SilentTh, function(dataItem, dataIndex) {
      return {
        // 'circle' 表示这个 graphic element 的类型是圆点。
        type: 'circle',
        
        shape: {
          // 圆点的半径。
          r: symbolSize / 2
        },
        // 用 transform 的方式对圆点进行定位。position: [x, y] 表示将圆点平移到 [x, y] 位置。
        // 这里使用了 convertToPixel 这个 API 来得到每个圆点的位置，下面介绍。
        position: SilentLineChart.convertToPixel('grid', [dataIndex, dataItem] ),

        // 这个属性让圆点不可见（但是不影响他响应鼠标事件）。
        invisible: true,
        // 这个属性让圆点可以被拖拽。
        draggable: true,
        // 把 z 值设得比较大，表示这个圆点在最上方，能覆盖住已有的折线图的圆点。
        z: 100,
        // 此圆点的拖拽的响应事件，在拖拽过程中会不断被触发。
        ondrag: function (dx, dy) {
          onSilentPointDragging(dataIndex, [this.x, this.y]);
        },
        ondragend: function () {
          for (var i = 0; i < SilentTh.length; i++)
          {
            SilentTh[i] = Math.round(SilentTh[i])
          }      
          BLEWriteLD2410_Th();    
          SilentLineChart.setOption(getSilentLineDragOption());
        }
      };
    })
  };
}



function getMoveLineDragOption() {    
  return {
    // 声明一个 graphic component，里面有若干个 type 为 'circle' 的 graphic elements。
    // 这里使用了 echarts.util.map 这个帮助方法，其行为和 Array.prototype.map 一样，但是兼容 es5 以下的环境。
    // 用 map 方法遍历 data 的每项，为每项生成一个圆点。
    graphic: echarts.util.map(MoveTh, function(dataItem, dataIndex) {
      return {
        // 'circle' 表示这个 graphic element 的类型是圆点。
        type: 'circle',
        
        shape: {
          // 圆点的半径。
          r: symbolSize / 2
        },
        // 用 transform 的方式对圆点进行定位。position: [x, y] 表示将圆点平移到 [x, y] 位置。
        // 这里使用了 convertToPixel 这个 API 来得到每个圆点的位置，下面介绍。
        position: MoveLineChart.convertToPixel('grid', [dataIndex, dataItem] ),

        // 这个属性让圆点不可见（但是不影响他响应鼠标事件）。
        invisible: true,
        // 这个属性让圆点可以被拖拽。
        draggable: true,
        // 把 z 值设得比较大，表示这个圆点在最上方，能覆盖住已有的折线图的圆点。
        z: 100,
        // 此圆点的拖拽的响应事件，在拖拽过程中会不断被触发。
        ondrag: function (dx, dy) {
          onMovePointDragging(dataIndex, [this.x, this.y]);
        },
        ondragend: function () {             
          for (var i = 0; i < MoveTh.length; i++)
          {
            MoveTh[i] = Math.round(MoveTh[i])
          }         
          BLEWriteLD2410_Th();   
          MoveLineChart.setOption(getMoveLineDragOption());
        }
      };
    })
  };
}

function getMoveLineOption() {
  return {    
    title: {
      text: "运动状态信号强度",
      left: "center",
      top: "5%", //"top",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal"
      },
    },
    legend: {
      top: "88%" //"bottom"
    },
    xAxis: {
      type: 'category',
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    series: [
      {
        id: 'a',
        name: "运动状态",
        data: MoveData,
        animation: false,
        type: 'line',
        lineStyle: {
          normal: {
            color: "#E6399B",
            width: 2,
            type: 'solid'
          }
        }
      },
      {
        id: 'b',
        name: "阈值",
        data: MoveTh,
        animation: false,
        type: 'line',
        lineStyle: {
          normal: {
            color: '#BFBF30',
            width: 1,
            type: 'dashed'
          }
        }
      }
    ]
  };
}
function getSilentLineOption() {
  return {
    title: {
      text: "静止状态信号强度",
      left: "center",
      top: "5%", //"top",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal"
      },
    },
    legend: {
      top: "88%" //"bottom"
    },
    xAxis: {
      type: 'category',
      data: [0, 1, 2, 3, 4, 5, 6, 7, 8]
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100
    },
    series: [
      {
        id: "a",
        name: "静止状态",
        data: SilentData,
        animation: false,
        type: 'line',
        lineStyle: {
          normal: {
            color: "#6A48D7",
            width: 2,
            type: 'solid'
          }
        }
      },
      {
        id: 'b',
        name: "阈值",
        data: SilentTh,
        animation: false,
        type: 'line',
        lineStyle: {
          normal: {
            color: '#BFBF30',
            width: 1,
            type: 'dashed'
          }
        }
      }
    ]
  };
}
function getSumLineOption() {
  return {
    title: {
      text: "判定结果",
      left: "center",
      top: "5%", //"top",
      textStyle: {
        fontSize: 14,
        fontWeight: "normal"
      },
    },
    legend: {
      top: "88%" //"bottom"
    },
    xAxis: {
      type: 'category',
      data: SumCategories
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 2
    },
    series: [
      {
        name: "判定结果",
        data: SumData,
        animation: true,
        type: 'line',
        lineStyle: {
          normal: { 
            color: "#E6399B",
            width: 2,
            type: 'solid'
          }
        }
      },
    ]
  };
}


Page({
	data: {
    ecline_move: {
      onInit: function (canvas, width, height, dpr) {
        MoveLineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(MoveLineChart);
        MoveLineChart.setOption(getMoveLineOption());
        MoveLineChart.setOption(getMoveLineDragOption());

        return MoveLineChart;
      }
    },
    ecline_silent: {
      onInit: function (canvas, width, height, dpr) {
        SilentLineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(SilentLineChart);
        SilentLineChart.setOption(getSilentLineOption());
        SilentLineChart.setOption(getSilentLineDragOption());

        return SilentLineChart;
      }
    },
    ecline_sum: {
      onInit: function (canvas, width, height, dpr) {
        SumLineChart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(SumLineChart);
        SumLineChart.setOption(getSumLineOption());

        return SumLineChart;
      }
    },
		//用户全局信息
		userInfo: {},
		text: `<p style="text-align: center;"><span style="color: #e03e2d; font-size: 20px;">——— 第二步: 观察传感器状态 ———</span></p>`,
		text7: `<p><span style="font-size: 18px;">&nbsp; 运动状态</span></p>`,
		text2: `<p><span style="font-size: 18px;">&nbsp; 静止状态</span></p>`,
    text1: `<p><span style="font-size: 18px;">&nbsp; 判定结果 0-无人  1-有人静止  2-有人运动</span></p>`,
    Interval_timing: null,
    notouch: false
	},
	onLoad(option) {
    this.init();
    that = this
    let array = new Uint8Array(1);
    array[0] = 0x01;
    console.log("切换到监控页面")
    wx.writeBLECharacteristicValue({
      deviceId:app.globalData.deviceId,
      serviceId:app.globalData.SERVICE_UUID_LD2410,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Send_CMD,
      value: array.buffer,
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
	},
	onShareAppMessage() {},
	onShareTimeline() {},
  onShow() {},
  onHide() {
    if (that.data.Interval_timing != null)
    {
      clearInterval(that.data.Interval_timing)
    }
    that = null
  },
  onUnload() {
    if (that.data.Interval_timing != null)
    {
      clearInterval(that.data.Interval_timing)
    }
    that = null
  },
	async init() {
    wx.onBLECharacteristicValueChange((result) => {
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_LD2410_Th.toUpperCase())
      {        
        MoveTh = Array.from(new Uint8Array(result.value.slice(0, 9)))
//        console.log(MoveData)
        MoveLineChart.setOption(getMoveLineOption());
        SilentTh = Array.from(new Uint8Array(result.value.slice(9, 18)))
//        console.log(SilentData)
        SilentLineChart.setOption(getSilentLineOption());
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_LD2410_Status.toUpperCase())
      {        
        MoveData = Array.from(new Uint8Array(result.value.slice(0, 9)))
//        console.log(MoveData)
        MoveLineChart.setOption(getMoveLineOption());
        SilentData = Array.from(new Uint8Array(result.value.slice(9, 18)))
//        console.log(SilentData)
        SilentLineChart.setOption(getSilentLineOption());
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_LD2410_Result.toUpperCase())
      {
        let rx_data = new Uint8Array(result.value)
        console.log("LD2410_Result = ", rx_data)
        sum_x = sum_x + 1
        if (SumData.length > 300) {
          SumData.shift()
          SumCategories.shift()
        }
        SumData.push(rx_data[0])
        SumCategories.push(sum_x)     
        SumLineChart.setOption({
          xAxis: [
            {
              data: SumCategories
            },
          ],
          series: [
            {
              data: SumData
            },
          ]    
        })
      }
      /*
      console.log('index: onBLECharacteristicValueChange',result.value)
      console.log('index: characteristicId',result.characteristicId)
      let hex = that.ab2hex(result.value)
      console.log('index: hextoString',that.hextoString(hex))
      console.log('hex',hex)
      */
    })
  },
  test_test: function()
  {
    console.log("开始测试")
    let t = 0;
    for (var i = 0; i < 18; i++)
    {
      t = this.randomLD2410Data()
      // console.log(t)
      LD2410_Sim_Data_uint8view[i] = t
    }
    console.log("LD2410_Sim_Data = ", LD2410_Sim_Data)
    MoveData = Array.from(new Uint8Array(LD2410_Sim_Data.slice(0, 9)))
    console.log(MoveData)
    MoveLineChart.setOption(getMoveLineOption());
    SilentData = Array.from(new Uint8Array(LD2410_Sim_Data.slice(9, 18)))
    console.log(SilentData)
    SilentLineChart.setOption(getSilentLineOption());
    console.log("拼接两个 array 到一个 buffer")
    let tt = MoveData.concat(SilentData)
    let ttu8 = new Uint8Array(tt)
    console.log(ttu8.buffer)

/*
    let silent_data_buffer = LD2410_Sim_Data.slice(9, 18)
    SilentData = new Uint8Array(silent_data_buffer)
    console.log("SilentData = ", SilentData)
    SilentLineChart.setOption(getSilentLineOption());
*/    
  },

  test_test2: function() {
    console.log("测试2")    
    let that = this
    this.data.Interval_timing = setInterval(function() {
      if (SumData.length > 300) {
        SumData.shift()
        SumCategories.shift()
      }
      let t = that.randomSumData()
      sum_x = sum_x + 1
      SumData.push(t)
      SumCategories.push(sum_x)     
      SumLineChart.setOption({
        xAxis: [
          {
            data: SumCategories
          },
        ],
        series: [
          {
            data: SumData
          },
        ]
      })
    }, 1000)  
  }, 
  randomSumData: function() {
    let value = Math.random() * 2;
    return Math.round(value)
  },
  randomLD2410Data: function() {
    let value = Math.random() * 100;
    return Math.round(value)
  },
  move_line_touch_move: function () {
  },
  move_line_touch_start: function () {
  },
  move_line_touch_end: function () {
  }
});


