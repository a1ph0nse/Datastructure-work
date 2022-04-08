//按钮控件，用于执行一定的功能
//该按钮用于测试地图的生成
//一些控件需要在地图生成之后才能出现，否则会出错
function create_map(x_offset,y_offset) {
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
create_map.prototype = new BMapGL.Control();
create_map.prototype.initialize = function(map)
{
    var div = document.createElement('div');
     //添加文字标识
    div.appendChild(document.createTextNode('测试图的生成'));
      // 设置样式
    div.style.cursor = "pointer";
    div.style.padding = "7px 10px";
    div.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    div.style.borderRadius = "5px";
    div.style.backgroundColor = "white";
    // 设置相关事件函数
    div.onclick = function()
    {
        let N=10000;
        init_Places();
        build_graph(N);      
        //增加一个隐藏该按键的功能
    }
   // 添加相关DOM元素
    map.getContainer().appendChild(div);
   // 将DOM元素返回
    return div;
};
var create_graph = new create_map(20,20);
map.addControl(create_graph);

//搜索函数,输入坐标后显示周围100个点和边,用于测试显示
function search()
{    
    //var x=document.getElementById("x");//输入的x坐标
    //var y=document.getElementById("y");//输入的y坐标
    //map.clearOverlays();//清除所有覆盖物
    map.flyTo(Place_list[12].point,13);//跳转到中心点处，并设置缩放等级
    //map_show(x,y);//调用函数显示

    //window.alert("x坐标是:"+x.value+" y坐标是:"+y.value)
    
}

//显示路况图的控件,之后说不定还要补充一个恢复颜色的控件
function traffic_graph(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
traffic_graph.prototype = new BMapGL.Control();
traffic_graph.prototype.initialize = function(map) 
{
    var traffic = document.createElement('traffic');
    traffic.appendChild(document.createTextNode('测试路况显示'));
    traffic.style.cursor = "pointer";
    traffic.style.padding = "7px 10px";
    traffic.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    traffic.style.borderRadius = "5px";
    traffic.style.backgroundColor = "white";

    traffic.onclick = function()
    {
        Traffic_graph();
    }
    map.getContainer().appendChild(traffic);
    return traffic;
}
var trffic_show = new traffic_graph(50,20);
map.addControl(traffic_show);

function road_graph(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
road_graph.prototype = new BMapGL.Control();
road_graph.prototype.initialize = function(map) 
{
    var blue_road = document.createElement('blue_road');
    blue_road.appendChild(document.createTextNode('测试道路图'));
    blue_road.style.cursor = "pointer";
    blue_road.style.padding = "7px 10px";
    blue_road.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    blue_road.style.borderRadius = "5px";
    blue_road.style.backgroundColor = "white";

    blue_road.onclick = function()
    {
        //恢复颜色的函数
        
    }
    map.getContainer().appendChild(blue_road);
    return blue_road;
}

//放缩的控件