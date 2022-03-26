var map = new BMapGL.Map("container");
var point = new BMapGL.Point(116.404, 39.915);
map.centerAndZoom(point, 15); 
map.enableScrollWheelZoom(true);
//以下4个值的内容均要调整
var lng_offset=0.1;//lng（经度）上的offset
var lat_offset=0.1//lat(纬度)上的offset
var lng_base=116.404//lng的基准值
var lat_base=39.915//lat的基准值

//地点的类
function Place(idx,road_num,sw,lng,lat)
{
    this.index=idx;//地点编号
    this.num=road_num;//路的数量
    this.road_list=[];//路的列表
    this.show=sw;//是否显示该点,布尔值表示
    this.point=new BMapGL.Point(lng,lat);//point
    this.marker=new BMapGL.Marker(point);//marker
    this.add_road=function(road)//加路
    {
        this.road_list.push(road);
        num++;   
    };
    //连出一条路
    this.show_road=function(road_index)
    {
        map.addoverlay(new BMapGL.Polyline([this.point,Place_list[road_index].point],{strokeColor:"blue", strokeWeight:2, strokeOpacity:0.5}));
    }

}

//路的类
function Road(idx,l,t)
{
    this.index=idx;//地点编号
    this.length=l;//路长
    this.time=t;//通行时间
    this.get_length=function(){}//获取路长
    this.get_time=function(){}//获取通行时间
}

//最短路径
function shortest_path(source,destination)
{

}

//最短时间
function shortest_time(source,destination)
{

}

//根据x,y计算index
function xy2index(x,y)
{
    return y*110+x;
}

//根据index计算x坐标
function index2x(index)
{
    return index%110;
}

//根据index计算y坐标
function index2y(index)
{
    return parseInt(index(index-(index%110))/110,10);
}

//指定范围内的随机数生成 [min,max)
function randomcreater(min,max)
{
    return Math.floor(Math.random()*(max-min))+min;
}





//初始化图上的地点的位置信息（经纬度）
var Place_list=[];//记录Place的数组
function init_Places()
{
    let i,j;//此处i,j分别相当于y,x
    for(i=0;i<110;i++)
    {
        for(j=0;j<110;j++)
        {
            //把新建立的Place push到Place_list的末尾
            Place_list.push(Place(xy2index(j,i),0,false,lng_base-lng_offset*j, lat_base-lat_offset*i));
        }
    }
}

//路的连接
function connext()
{
    
}

//地图的显示(BFS周围100个点以及相关联的边)
function map_show(x,y)
{
    source=xy2index(x,y);
    let queue = [];//先整个queue
    let list = [];//存放要显示的点
    let i=0,j;
    let flag;
    while(queue.length!=0||list.length<100)
    {
        //初始将起始节点加入显示列表list
        if(list.length==0)
        {
            queue.push(source);
            list.push(source);
            map.addoverlay(Place_list[list[i]].marker);
        }
        //将与当前节点相邻，且不list中的节点push入queue
        for(i=0;i<Place_list[queue[0]].road_list.length;i++)
        {
            flag=true;
            for(j=0;j<list.length;j++)
            {
                if(list[j]==Place_list[queue[0]].road_list[i].index)
                {
                    flag=false;
                }
                else
                    continue;
            }
            if(flag==true)
            {
                queue.push(Place_list[queue[0]].road_list[i].index);
                list.push(Place_list[queue[0]].road_list[i].index);
                map.addoverlay(Place_list[list[i]].marker);
                Place_list[list[i]].show_road(Place_list[queue[0]].road_list[i].index);
            }
            else
                continue;
        }
        //移除位于队首的节点        
        queue.shift();
    }
}






