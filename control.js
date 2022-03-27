function button() {
    this.defaultAnchor=BMAP_ANCHOR_TOP_RIGHT;
    this.defaultOffset = new BMapGL.Size(20, 20);
}
button.prototype = new BMapGL.Control();
button.prototype.initialize = function(map){
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
        let N=11451;
        init_Places();
        build_graph(N);
        let i;
        let flag=0;
        for(i=0;i<Place_list.length;i++)
        {
            if(Place_list[i].in_use==true)
                {
                    console.log(Place_list[i].index);
                    flag++;
                }
            else
                console.log(i+"this index is not in_use");
        }
        console.log("totoal in_use point:"+flag);
    }
   // 添加相关DOM元素
    map.getContainer().appendChild(div);
   // 将DOM元素返回
    return div;
};
var mybutton = new button();
map.addControl(mybutton);