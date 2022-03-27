//按钮控件，用于执行一定的功能
//该按钮用于测试地图的生成
function create_map(x_offset,y_offset) {
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(x_offset, y_offset);
}
create_map.prototype = new BMapGL.Control();
create_map.prototype.initialize = function(map){
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
    map.clearOverlays();//清除所有覆盖物
    map.flyTo(Place_list[12].point,13);//跳转到中心点处，并设置缩放等级
    //map_show(x,y);//调用函数显示

    //window.alert("x坐标是:"+x.value+" y坐标是:"+y.value)
    
}









