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
        //也许可以整个输入框输入N
        let N=10000;
        let i,j;
        Complete_graph.init(lng_base,lat_base,lng_offset,lat_offset,LENGTH);
        build_graph(N);
        Complete_graph.hide_all();
        //Complete_graph.show_all(); 
        Small_graph.init(lng_base-lng_offset*7.5,lat_base-lat_offset*7.5,lng_offset*15,lat_offset*15,BLOCK_LENGTH2);
        build_Small_graph();
        Small_graph.hide_all();
        Big_graph.init(lng_base-lng_offset*15,lat_base-lat_offset*15,lng_offset*30,lat_offset*30,BLOCK_LENGTH1);
        build_Big_graph();
        Big_graph.show_all();
        //创建图的控件可以隐藏，其他控件可以出现
        create_graph.hide();
        road_Graph.show();
        traffic_show.show();
        Expansion.show();
        Reduction.show();
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
    map.flyTo(Complete_graph.place_list[12].point,13);//跳转到中心点处，并设置缩放等级
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
var traffic_show = new traffic_graph(150,20);
map.addControl(traffic_show);
traffic_show.hide();

function road_graph(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
road_graph.prototype = new BMapGL.Control();
road_graph.prototype.initialize = function(map) 
{
    var black_road = document.createElement('blue_road');
    black_road.appendChild(document.createTextNode('测试道路图'));
    black_road.style.cursor = "pointer";
    black_road.style.padding = "7px 10px";
    black_road.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    black_road.style.borderRadius = "5px";
    black_road.style.backgroundColor = "white";

    black_road.onclick = function()
    {
        //恢复颜色的函数
        Complete_graph.default_color();
    }
    map.getContainer().appendChild(black_road);
    return black_road;
}
var road_Graph = new road_graph(20,20);
map.addControl(road_Graph);
road_Graph.hide();


//自定义的放缩控件

//放大的控件
function expand(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_BOTTOM_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
expand.prototype = new BMapGL.Control();
expand.prototype.initialize = function(map) 
{
    var expansion = document.createElement('expansion');
    expansion.appendChild(document.createTextNode('+'));
    expansion.style.cursor = "pointer";
    expansion.style.padding = "7px 10px";
    expansion.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    expansion.style.borderRadius = "5px";
    expansion.style.backgroundColor = "white";

    expansion.onclick = function()
    {
        //放大
        map.zoomIn();
        //进行的操作
        change_graph_to_show(map.getZoom()+1);
    }
    map.getContainer().appendChild(expansion);
    return expansion;
}
var Expansion = new expand(20,20);
map.addControl(Expansion);
Expansion.hide();

//缩小的控件
function reduce(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_BOTTOM_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
reduce.prototype = new BMapGL.Control();
reduce.prototype.initialize = function(map) 
{
    var reduction = document.createElement('reduction');
    reduction.appendChild(document.createTextNode('-'));
    reduction.style.cursor = "pointer";
    reduction.style.padding = "7px 10px";
    reduction.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    reduction.style.borderRadius = "5px";
    reduction.style.backgroundColor = "white";

    reduction.onclick = function()
    {
        //缩小
        map.zoomOut();
        //进行的操作
        change_graph_to_show(map.getZoom()-1);
    }
    map.getContainer().appendChild(reduction);
    return reduction;
}
var Reduction = new reduce(60,20);
map.addControl(Reduction);
Reduction.hide();
