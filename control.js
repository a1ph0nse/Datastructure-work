//按钮控件，用于执行一定的功能
//该按钮用于测试地图的生成
//一些控件需要在地图生成之后才能出现，否则会出错
var flag=0;//flag=1表示路况图正在使用
function create_map(x_offset,y_offset) {
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
create_map.prototype = new BMapGL.Control();
create_map.prototype.initialize = function(map)
{
    var div = document.createElement('div');
     //添加文字标识
    div.appendChild(document.createTextNode('生成地图数据'));
      // 设置样式
    div.style.cursor = "pointer";
    div.style.padding = "7px 10px";
    div.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    div.style.borderRadius = "5px";
    div.style.backgroundColor = "white";
    // 设置相关事件函数
    div.onclick = function()
    {
        //输入框在这里
        var N=prompt("请输入图中点的个数N(0<N<=14400):");
        if(N<=0||N>14400)
        {
            window.alert("输入的个数N的大小超出允许的范围!");
            return;
        }
        //先把图清掉
        Complete_graph.place_list.splice(0,14400);
        Small_graph.place_list.splice(0,64);
        Big_graph.place_list.splice(0,16);
        map.clearOverlays();
        //初始化图
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
        //traffic_show.show();
        Expansion.show();
        Reduction.show();
        Send_graph.show();
    }
   // 添加相关DOM元素
    map.getContainer().appendChild(div);
   // 将DOM元素返回
    return div;
};
var create_graph = new create_map(20,20);
map.addControl(create_graph);


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
    traffic.appendChild(document.createTextNode('模拟车流'));
    traffic.style.cursor = "pointer";
    traffic.style.padding = "7px 10px";
    traffic.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    traffic.style.borderRadius = "5px";
    traffic.style.backgroundColor = "white";

    traffic.onclick = function()
    {
        Traffic_graph();
        flag=1;
        traffic_show.hide();
        create_graph.hide();
        road_Graph.show();
    }
    map.getContainer().appendChild(traffic);
    return traffic;
}
var traffic_show = new traffic_graph(20,20);
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
    black_road.appendChild(document.createTextNode('恢复地图数据'));
    black_road.style.cursor = "pointer";
    black_road.style.padding = "7px 10px";
    black_road.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    black_road.style.borderRadius = "5px";
    black_road.style.backgroundColor = "white";

    black_road.onclick = function()
    {
        //恢复颜色的函数
        Complete_graph.default_color();
        flag=0;
        //road_Graph.hide();
        traffic_show.show();
        change_graph_to_show(map.getZoom()+1);
    }
    map.getContainer().appendChild(black_road);
    return black_road;
}
var road_Graph = new road_graph(20,60);
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
        if(flag==0)//表明此时可以对点进行缩放
        {
            change_graph_to_show(map.getZoom()+1);
        }
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
        if(flag==0)//表明此时可以对点进行缩放
        {
            change_graph_to_show(map.getZoom()-1);
        }
    }
    map.getContainer().appendChild(reduction);
    return reduction;
}
var Reduction = new reduce(60,20);
map.addControl(Reduction);
Reduction.hide();

//发送图的按钮
function send(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_BOTTOM_LEFT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
send.prototype = new BMapGL.Control();
send.prototype.initialize = function(map) 
{
    var send_graph = document.createElement('send_graph');
    send_graph.appendChild(document.createTextNode('存储地图数据'));
    send_graph.style.cursor = "pointer";
    send_graph.style.padding = "7px 10px";
    send_graph.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    send_graph.style.borderRadius = "5px";
    send_graph.style.backgroundColor = "white";

    send_graph.onclick = function()
    {
        //发送图
        send_to(Complete_graph);
        map.removeControl(Send_graph);
    }
    map.getContainer().appendChild(send_graph);
    return send_graph;
}
var Send_graph = new send(20,80);
map.addControl(Send_graph);
Send_graph.hide();

//请求得到图
function get_graph(x_offset, y_offset)
{
    this.defaultAnchor=BMAP_ANCHOR_BOTTOM_LEFT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
get_graph.prototype = new BMapGL.Control();
get_graph.prototype.initialize = function(map) 
{
    var Get_Graph = document.createElement('get_graph');
    Get_Graph.appendChild(document.createTextNode('获取地图数据'));
    Get_Graph.style.cursor = "pointer";
    Get_Graph.style.padding = "7px 10px";
    Get_Graph.style.boxShadow = "0 2px 6px 0 rgba(27, 142, 236, 0.5)";
    Get_Graph.style.borderRadius = "5px";
    Get_Graph.style.backgroundColor = "white";

    Get_Graph.onclick = async function()
    {
        //获取文件名的列表
        var file_list = await get_file_list();
        console.log(file_list);

        //将文件名列表转化为输出显示的格式
        var output_string='请输入要选择的文件名前面的序号:';
        for(let i=0;i<file_list.length;i++)
        {
            output_string+='\n  ';
            output_string+=(i+1).toString();
            output_string+='.';
            output_string+=file_list[i];
        }

        //输入文件名，转成string作为get_form的参数
        var choice=prompt(output_string);
        console.log(typeof(choice));
        var filename='';
        if(parseInt(choice)>file_list.length||parseInt(choice)<=0)
        {
            window.alert("输入的序号错误错误!");
            return;
        }
        else
        {
            filename=file_list[parseInt(choice)-1];
            console.log(filename);
        }
        //先把图清掉
        Complete_graph.place_list.splice(0,14400);
        Small_graph.place_list.splice(0,64);
        Big_graph.place_list.splice(0,16);
        map.clearOverlays();
        //重新将图初始化
        Complete_graph.init(lng_base,lat_base,lng_offset,lat_offset,LENGTH);
        Small_graph.init(lng_base-lng_offset*7.5,lat_base-lat_offset*7.5,lng_offset*15,lat_offset*15,BLOCK_LENGTH2);
        Big_graph.init(lng_base-lng_offset*15,lat_base-lat_offset*15,lng_offset*30,lat_offset*30,BLOCK_LENGTH1);
        //请求得到图,并根据获取的图更新三个图
        await get_from(filename);
        //没执行完get_from()之前不准继续
        build_Small_graph();
        build_Big_graph();
        //按键的显示
        Complete_graph.hide_all();
        Small_graph.hide_all();
        Big_graph.show_all();
        traffic_show.show();
        Expansion.show();
        Reduction.show();
        //调整缩放等级
        map.setZoom(8);
        flag=0;
    }
    map.getContainer().appendChild(Get_Graph);
    return Get_Graph;
}
var Get_graph = new get_graph(20,40);
map.addControl(Get_graph);
//Send_graph.hide();

//---------------怡姐部分
function get_out_hundred(all_data)//拿出数据
{
    let i=all_data;
    show_point(i);
    //测试打印数据
    //console.log(i[0]);
}
function show_point(all_data)//地图上打印点
{
    // let x, y,lng,lat;
    // map.clearOverlays();
    // for(let i=0;i<100;++i)
    // {
    //     x=parseInt(all_data[i]/120);
    //     y=all_data[i]%120;
    //     //测试索引坐标
    //     //console.log(x,y);
    //     lat=y*lat_offset+lat_base;//纬度
    //     lng=x*lng_offset+lng_base;//经度
    //     console.log(lat,lng);
    //     var point = new BMapGL.Point(lng, lat);   
    //     var marker = new BMapGL.Marker(point);        // 创建标注   
    //     map.addOverlay(marker);
    // }
    Complete_graph.hide_all();
    for(let i=0;i<all_data.length;++i)
    {
        Complete_graph.place_list[all_data[i].start].marker.show();
        Complete_graph.place_list[all_data[i].end].marker.show();//就start就行了？还是再修改
        Complete_graph.place_list[all_data[i].start].road_list[all_data[i].road_index].line.show()

    }

}
function show_hundred()//发送请求，获得数据
{
    // map.clearOverlays();
    // var point = new BMapGL.Point(116.404+i, 39.915+i);   
    // var marker = new BMapGL.Marker(point);        // 创建标注   
    // map.addOverlay(marker);

    //测试数据
    // var ind;    
    // for(let i=0;i<14400;++i){
    //     if(Complete_graph.place_list[i].in_use==1){
    //         ind=Complete_graph.place_list[i].index;
    //         //console.log(Complete_graph.place_list[i],Complete_graph.place_list[i].index);
    //         break;
    //     }
    // }

    var x=document.getElementById("x");//第一个点的索引
    //console.log(x.value,Complete_graph.place_list[x.value]);
    if(judge(x.value))
    {
        //console.log(choose(),typeof(choose()))
        var y=Complete_graph.place_list[x.value].index;
        if(choose()==1){
            window.alert("此时选择的是以时间为计算准则")
            
            axios.post("http://1.14.150.210:8080/road/neighbour/time", 
            {
                graph: Complete_graph.place_list.map(function(place){
                    let tmp = {
                        index: place.index,
                        in_use: place.in_use,
                    }
                    if(place.in_use){
                        tmp.road_list = place.road_list.map(function(road){
                            return {
                                index: road.index,
                                time: road.time
                            };
                        })
                    }
                    return tmp;
                }).filter(place=> {return place}),
                index:y

            }).then((res)=>{get_out_hundred(res.data.data.road_list)})
        }
        else{
            window.alert("此时选择的是以路程为计算准则")
            axios.post("http://1.14.150.210:8080/road/neighbour/distance", 
            {
                graph: Complete_graph.place_list.map(function(place){
                    let tmp = {
                        index: place.index,
                        in_use: place.in_use,
                    }
                    if(place.in_use){
                        tmp.road_list = place.road_list.map(function(road){
                            return {
                                index: road.index,
                                distance: road.distance
                            };
                        })
                    }
                    return tmp;
                }).filter(place=> {return place}),
                index:y

            }).then((res)=>{get_out_hundred(res.data.data.road_list)})
        
        }
    }
}


//显示最短路径（内涵操作同上）
function get_out_road(all_data)
{
    let i=all_data;
    show_road(i);
}

function show_road(all_data)
{
    Complete_graph.hide_all();
    for(let i=0;i<all_data.length;++i)
    {
        Complete_graph.place_list[all_data[i].start].marker.show();
        Complete_graph.place_list[all_data[i].end].marker.show();
        Complete_graph.place_list[all_data[i].start].road_list[all_data[i].road_index].line.show()
        //if(i==all_data.length-1){Complete_graph.place_list[all_data[i].end].marker.show();}
    }

}
//start未修改
function show_shorest()
{
    
    //测试数据
    // var sta,en,num=0;
    // for(let i=0;i<14400;++i){
    //     if(Complete_graph.place_list[i].in_use==1){
    //         num++;
    //         if(num==1){sta=Complete_graph.place_list[i].index;continue}
    //         if(num==10){en=Complete_graph.place_list[i].index;break;}
            
    //     }
    // }
    var begin=document.getElementById("x");
    var last=document.getElementById("y");
    if(judge(begin.value)&&judge(last.value))
    {
        var start=Complete_graph.place_list[begin.value].index;
        var ending=Complete_graph.place_list[last.value].index;
        //请求：path，start，end
        if(choose()==1)
        {
            window.alert("此时选择的是以时间为计算准则")
            axios.post("http://1.14.150.210:8080/road/path/time", 
            {
                graph: Complete_graph.place_list.map(function(place){
                    let tmp = {
                        index: place.index,
                        in_use: place.in_use,
                    }
                    if(place.in_use){
                        tmp.road_list = place.road_list.map(function(road){
                            return {
                                index: road.index,
                                time: road.time
                            };
                        })
                    }
                    return tmp;
                }).filter(place=> {return place}),
                start:start,
                end:ending
            }).then((res)=>{get_out_road(res.data.data.road_list)})
        }
        else{
            window.alert("此时选择的是以路程为计算准则")
            axios.post("http://1.14.150.210:8080/road/path/distance", 
            {
                graph: Complete_graph.place_list.map(function(place){
                    let tmp = {
                        index: place.index,
                        in_use: place.in_use,
                    }
                    if(place.in_use){
                        tmp.road_list = place.road_list.map(function(road){
                            return {
                                index: road.index,
                                distance: road.distance
                            };
                        })
                    }
                    return tmp;
                }).filter(place=> {return place}),
                start:start,
                end:ending
            }).then((res)=>{get_out_road(res.data.data.road_list)})
        }
    }
    
}
function judge(x){
    if(Number(x).toString() == "NaN")
    {
        window.alert("请输入数字");
        return 0;
    }
    else if(x<1||x>14400)
    {
        window.alert("请输入1~14400之间的数字");
    }
    else if(Complete_graph.place_list[x].in_use==0)
    {
        window.alert("该点索引不存在，请重新输入或者点击图上点获取正确的索引");
        return 0;
    }
    else if(Complete_graph.place_list[x].in_use==1)
    {
        return 1;
    }
    return 0
}

function choose()
{
    var choice=document.getElementById("choice");
    console.log("获取成功");
    console.log(choice.value,typeof(choice.value))
    if(choice.value==1)return 1;
    else if(choice.value==2)return 2;
    else {
        window.alert("请输入数字1(时间)/数字2(路程),系统默认以路程为计算标准");
    }
    return 0;
}