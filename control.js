//按钮控件，用于执行一定的功能
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
        let i;
        let flag=0;
        for(i=0;i<Place_list.length;i++)
        {
            if(Place_list[i].in_use==true)
            {
                 console.log("this is the length of road_list: "+Place_list[i].road_list.length+" its point is:"+Place_list[i].index);
                 flag++;
            }
            else
            {   
                console.log("this index is not in_use:"+i);
            }
        }
        console.log("totoal in_use point:"+flag);
    }
   // 添加相关DOM元素
    map.getContainer().appendChild(div);
   // 将DOM元素返回
    return div;
};
var create_graph = new create_map(20,20);
map.addControl(create_graph);

//搜索函数
function search()
{
    var x=document.getElementById("x");
    var y=document.getElementById("y");
    window.alert("x坐标是:"+x.value+" y坐标是:"+y.value)
}








